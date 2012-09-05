# buffy (The Buffer Slayer)

A module to read / write binary data and streams.

## Install

<strong>THIS MODULE IS STILL A WORK IN PROGRESS, DO NOT USE!</strong>

## Usage

Let's say you want to parse a simple C struct, buffy can help:

```js
var buffy = require('buffy');

var buffer = new Buffer([23, 0, 0, 0, 15, 116, 101, 115, 116]);
var reader = buffy.createReader(buffer);

var struct = {
  version : reader.uint8(),
  id      : reader.uint32(),
  name    : reader.ascii(4),
};

// {version: 23, id: 15, name: 'test'}
```

Parsing a buffer is nice, but what about streams? Well, buffy has your back:

```js
var buffy      = require('buffy');
var net        = require('net');
var connection = net.createConnection(1337, 'example.org');

var reader = buffy.createReader();
connection.pipe(reader);

reader.on('data', function() {
  while (reader.bytesAvailable() >= 9) {
    var struct = {
      version : reader.uint8(),
      id      : reader.uint32(),
      name    : reader.ascii(4),
    };
  }
});
```

## API

### reader.write(buffer)

Appends the given `buffer` to the internal buffer.

### reader.bytesAvailable(buffer)

Returns the number of internally buffered bytes that have not yet been consumed.

### reader.int8() / reader.uint8()

Returns the next (un)signed 8 bit integer.

### reader.int16BE() / reader.uint16BE() / reader.int16LE() / reader.uint16LE()

Returns the next (un)signed 16 bit integer in the chosen endianness.

### reader.int32BE() / reader.uint32BE() / reader.int32LE() / reader.uint32LE()

Returns the next (un)signed 32 bit integer in the chosen endianness.

### reader.ascii([bytes]) / reader.utf8([bytes])

Returns the next `bytes` as a string of the chosen encoding. If `bytes` is
omitted, a null terminated string is assumed.

### reader.buffer([bytes])

Returns the next `bytes` as a buffer.

## Error Handling

The reader will throw an exception whenever an operation exceeds the boundary
of the internal buffer.
