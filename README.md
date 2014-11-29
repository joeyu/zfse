#zfse

Zhou's File System Extension to the 'fs' module of node.js

##Usage

var zfse = require('zfse');

// The following code snippet traverses through your current directory and prints every
// file node.
zfse.traverse('./', function (f) {
    console.log(f);
});

##API
http://joeyu.github.io/zfse/modules/zfse.html
