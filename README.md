#zfse

Zhou's File System Extension to the 'fs' module of node.js

##Installation
    $ npm install zfse

##Usage

```javascript
var zfse = require('zfse');

// The following code snippet traverses through your current directory and prints every
// file node.
zfse.traverse('./', function (f) {
    console.log(f);
});
```

##API
###Methods
:[*copyDir*](copyDir)       |:Copies a directory.
:*copyFile*     |:Copies a file.
:*find*         |:Searches a directory.
:*rRmDir*       |:Recursively removes a directory.
:*rRename*      |:Recursively renames the files under a directory. 
:*traverse*     |:Traverses a directory with a specified callback applied to every file node.

####copyDir(src, dst, [options])
This method copies a directory synchronously.

#####Arguments
`src` | String | The source directory.
`dst` | String | The destination directory.
`[options]` | Object | Options. 

