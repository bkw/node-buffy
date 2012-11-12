#!/usr/bin/env node
// vim: ts=2:sw=2

var fs            = require('fs');
var common        = require('../../common');
var MysqlParser   = require(__dirname + '/MysqlRowParser');
var FixtureStream = require(__dirname + '/FixtureStream');
var libName       = process.argv[2];
var lib           = require(libName);
var rows          = 100 * 1000;
var fields        = ['id', 'title', 'text', 'created', 'updated'];
var dataFile      = __dirname + '/../fixtures/100k-blog-rows.mysql.bin';
var stream        = new FixtureStream(dataFile);
var bytes         = fs.statSync(dataFile).size;


common.run(libName, function(cb) {
  // var rows = [];
  var parser        = new MysqlParser(lib);
  // fixture.pause();

  parser.parse(stream, fields);
  /*
  parser.on('data', function (row) {
    rows.push(row);
  });
  */
  parser.on('end', function (rowcount) {
    parser.removeAllListeners();
    stream.removeAllListeners();
    cb(null, {rows: rowcount, bytes: bytes});
  });

  stream.resume();
});
