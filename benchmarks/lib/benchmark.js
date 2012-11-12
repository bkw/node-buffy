var path          = require('path');
var FixtureStream = require('./FixtureStream');

module.exports = function(moduleName, fixturePath, checksum) {
  var lib         = require(moduleName);
  var packageJSON = require(moduleName + '/package.json');

  var fixtureName = path.basename(fixturePath, '.bin');

  return function benchmark(name, benchmarkFn) {
    if (name !== fixtureName) {
      return;
    }

    run(benchmarkFn, fixturePath, lib, packageJSON, checksum);
  };
};

function run(benchmarkFn, fixturePath, lib, packageJSON, checksumOK) {
  var stream     = new FixtureStream(fixturePath);
  var iterations = 100;
  var round      = 0;

  console.log(['time', 'number', 'bytesPerMSec', 'memoryUsage', 'lib', 'version'].join('\t'));

  function nextIteration() {
    var start = Date.now();

    benchmarkFn(lib, stream, function(err, checksum) {
      if (err) throw err;

      var memory   = process.memoryUsage();
      var duration = Date.now() - start;

      if (checksum != checksumOK) {
        throw new Error('bad checksum: ' + checksum + ' instead of ' + checksumOK);
      }

      stream.removeAllListeners();

      var bytesPerMSec = Math.round(stream.length / duration);

      console.log([
        Date.now(),
        round++,
        bytesPerMSec,
        process.memoryUsage().rss,
        packageJSON.name,
        packageJSON.version
      ].join('\t'));

      iterations--;
      if (iterations) {
        process.nextTick(nextIteration);
      }
    });

    stream.resume();
  }

  nextIteration();
}
