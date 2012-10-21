// vim: ts=2:sw=2
var benchmark = require('./lib/benchmark')(__dirname + '/../', process.argv[2]);

function readThreeByteInteger (reader) {
  var bytes = reader.buffer(3);
  return bytes[0] | bytes[1] << 8 | bytes[2] << 16;
}

benchmark('100k-blog-rows.mysql', function(buffy, stream, cb) {
  var reader = buffy.createReader();
  var packetLength;
  var packetNumber;
  var checksum = 0;

  stream
    .on('data', function(buffer) {
      var firstByte, lengthValue;
      reader.write(buffer);

      while (true) {
        if (packetNumber === undefined || packetLength === 0) {
          if (reader.bytesAhead() < 4) {
            break;
          }

          packetLength = readThreeByteInteger(reader);
          packetNumber = reader.uint8();
          break;
        }

        if (reader.bytesAhead() < packetLength) {
          break;
        }

        // parse values:
        // http://dev.mysql.com/doc/internals/en/overview.html#length-encoded-integer
        firstByte = reader.uint8(),
        packetLength -= 1;
        switch (firstByte) {
          case 0xfc:
            lengthValue = reader.uint16LE();
            packetLength -= 2;
          break;
          case 0xfd:
            lengthValue = readThreeByteInteger(reader);
            packetLength -= 3;
            break;
          case 0xfe:
            lengthValue = reader.uint64LE();
            packetLength -= 8;
            break;
          case 0xfb:
            lengthValue = 0;
            break;
          default:
            lengthValue = firstByte;
        }
        value = reader.buffer(lengthValue);
        // console.log('Read "%s"', value);
        packetLength -= lengthValue;
        checksum += lengthValue;
      }
    })
    .on('end', function() {
      cb(null, checksum);
    });
});
