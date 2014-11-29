#!/usr/bin/env node
var fs = require('fs');
var zfse = require('../zfse.js');

var testdir = {
    'd1': [
        'f11',
        {'d12': [
            'f121',
            'f122'
        ]},
    ],
};

mkdir(testdir);

var d = Object.keys(testdir)[0];

console.log("Testing rRenameSync()");
zfse.rRenameSync(d, '2', '2m', {'verbose': true});

console.log("Testing rRmDirSync()");
zfse.rRmDirSync(d);
if (fs.existsSync(d)) {
    console.error("Removing '%s' failed", d); 
    procoss.exit(1);
}



function mkdir(d) {
    var k = Object.keys(d)[0];
    fs.mkdirSync(k);
    console.log(k);
    d[k].forEach(function (e) {
        if (typeof e === 'object') {
            var o = {};
            o[k + '/' + Object.keys(e)[0]] = e[Object.keys(e)[0]];
            mkdir(o);
        }
        else {
            var fpath = k + '/' + e;
            fs.closeSync(fs.openSync(fpath, 'w')); 
            console.log(fpath);
        }
    });
}
