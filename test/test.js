#!/usr/bin/env node
var fs = require('fs');
var assert = require('assert');
var util = require('util');
var zfse = require('../zfse.js');
describe('Arguments', function(){
    describe('#constructor()', function(){
        (function () {
            var args = new zfse.Arguments(arguments, [
                {'name': 'int1', 'type': 'number'},
                {'name': 'int2', 'type': 'number', 'optional': true},
                {'name': 'str1', 'type': 'string', 'optional': true},
            ]);

            var astr = util.inspect(arguments);        
            console.log(args);

            it(astr, function(){
                assert.equal(args.int1, 1);
                assert.equal(args.str1, 'a');
            })
        })(1, 'a', 2, 3, 'b', 'c', 'd', 'e', 'f');
    })
});

//zfse.verbose = true;
//var testdir = {
//    'd1': [
//        'f11',
//        {'d12': [
//            'f121',
//            'f122'
//        ]},
//    ],
//};
//
//mkdir(testdir);
//
//var d = Object.keys(testdir)[0];
//
//
//console.log("Testing copyFileSync()");
//zfse.copyFile(d + '/' + 'f11', d + '/' + 'd12/f123_f11');
//
//console.log("Testing copyDirSync()");
//zfse.copyDir(d, d + '_copy');
//zfse.find(d + '_copy');
//
//console.log("Testing rRenameSync()");
//zfse.rRename(d, '2', '2m', {'verbose': true});
//
//console.log("Testing rRmDirSync()");
//zfse.rRmDir(d);
//zfse.rRmDir(d + '_copy');
//if (fs.existsSync(d)) {
//    console.error("Removing '%s' failed", d); 
//    procoss.exit(1);
//}
//
//
//
//function mkdir(d) {
//    var k = Object.keys(d)[0];
//    fs.mkdirSync(k);
//    console.log(k);
//    d[k].forEach(function (e) {
//        if (typeof e === 'object') {
//            var o = {};
//            o[k + '/' + Object.keys(e)[0]] = e[Object.keys(e)[0]];
//            mkdir(o);
//        }
//        else {
//            var fpath = k + '/' + e;
//            fs.closeSync(fs.openSync(fpath, 'w')); 
//            console.log(fpath);
//        }
//    });
//}
