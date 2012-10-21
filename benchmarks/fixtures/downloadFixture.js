var http = require('http'),
    fs   = require('fs'),
    url = process.argv[2],
    dst = process.argv[3],
    out = fs.createWriteStream(dst);

http.get(url, function (res) {
    res.pipe(out);
    console.log('downloading %s to %s, please be patient', url, dst);
});

