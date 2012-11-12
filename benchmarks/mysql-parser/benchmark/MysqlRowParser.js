// vim: ts=2:sw=2
var util           = require('util');
var EventEmitter   = require('events').EventEmitter;

var MysqlRowParser = function (buffy) {
  EventEmitter.call(this);
  this._reader = buffy.createReader();
};
util.inherits(MysqlRowParser, EventEmitter);

MysqlRowParser.prototype.parse = function (stream, fields) {
  var that = this;

  this._packetNumber = undefined;
  this._packetLength = 0;
  this._parsedFields = {};
  this._currentField = 0;
  this._exitSoon = false;
  this._fields = fields;
  this._rowCount = 0;

  stream.on('data', this._parseBuffer.bind(this));

  stream.on('end', function () {
    if (that._reader.bytesAhead()) {
      that._exitSoon = true;
    } else {
      // that._reader.compact();
      that.emit('end', that._rowCount);
    }
  });
};

MysqlRowParser.prototype._readThreeByteInteger = function () {
  var bytes = this._reader.buffer(3);
  return bytes[0] | bytes[1] << 8 | bytes[2] << 16;
};


MysqlRowParser.prototype._parseBuffer = function (buffer) {
  var firstByte, lengthValue;

  this._reader.write(buffer);

  while (true) {
    if (this._packetNumber === undefined || this._packetLength === 0) {
      if (this._reader.bytesAhead() < 4) {
        break;
      }

      this._packetLength = this._readThreeByteInteger();
      this._packetNumber = this._reader.uint8();
    }

    if (this._reader.bytesAhead() < this._packetLength) {
      break;
    }

    // parse values:
    // http://dev.mysql.com/doc/internals/en/overview.html#length-encoded-integer
    firstByte = this._reader.uint8(),
    this._packetLength -= 1;
    switch (firstByte) {
      case 0xfc:
        lengthValue = this._reader.uint16LE();
        this._packetLength -= 2;
      break;
      case 0xfd:
        lengthValue = this._readThreeByteInteger();
        this._packetLength -= 3;
        break;
      case 0xfe:
        lengthValue = this._reader.double64LE();
        this._packetLength -= 8;
        break;
      case 0xfb:
        lengthValue = 0;
        break;
      default:
        lengthValue = firstByte;
    }

    this._parsedFields[this._fields[this._currentField++]] =
      this._reader.buffer(lengthValue);

    this._packetLength -= lengthValue;

    if (this._packetLength === 0) {
//      this.emit('data', this._parsedFields);
      ++ this._rowCount;
      this._currentField = 0;
    }
    if (this._exitSoon) {
      // this._reader.compact();
      this.emit('end', this._rowCount);
    }
  }
  // this._reader.compact();
  return true;
};

module.exports = MysqlRowParser;
