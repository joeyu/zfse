#zfse

Zhou's File System Extension to the 'fs' module of node.js

##Installation
    $ npm install zfse

##Usage

```javascript
var zfse = require('zfse');
```

##API
###Methods
Method                      | Brief
:---------------------------|:-----
[`copyDir`](#copyDir)       |Copies a directory.
[`copyFile`](#copyFile)     |Copies a file.
[`find`](#find)             |Searches a directory.
[`rRmDir`](#rRmDir)         |Recursively removes a directory.
[`rRename`](#rRename)       |Recursively renames the files under a directory. 
[`traverse`](#traverse)     |Traverses a directory with a specified callback applied to every file node.

<hr>
<a name="copyDir" />
####copyDir(src, dst, [options])
This method copies a directory.

#####Arguments
* `src` : String

    The source directory.

* `dst` : String 

    The destination directory.

* [`options`] : Object

    Options. 


<hr>

<a name="copyFile" />
####copyFile(src, dst, [options])
This method copies a file.

If the destination is a directory, the source file copy will be copied to it with the same file name.

#####Arguments
* `src` : String

    The source file.

* `dst` : String 

    The destination file, or directory.

* [`options`] : Object

    Options. 

<hr>

<a name="find" />
####find(dir, [namePattern], callback, [callback_arg...])
Searches the specified directory `dir` for files matching the `namePattern` file name pattern, calling the `callback` function.

This method is a synchronous function, though it calls a callback function.

#####Arguments
* `dir` : String 

    The directory from which search starts.

* [`namePattern`] : RegExp

    Search pattern in regular expression.

    If `namePattern` isn't specified, all files (including sub-directories) will be matched.

* `callback` : Function
    The callback function to run for each file node that is found.

* [`callback_arg`...] 
    Optional arguments passed to `callback`


<hr>

<a name="rRmDir" />
####rRmDir(dir, [options])
Recursively removes the `dir` directory synchronously. 

This method works in a similar way as linux shell command 'rm -rf'. If `dir` is a single file, this method works in the same way as fs.unlinkSync()

#####Arguments
* `dir` : String 

    The directory to remove.

* [`options`] : Object

    Options.

  * [`options.dryrun=false`] : Boolean

        Dry-runs with verbose output only.


<hr>

<a name="rRename" />
####rRename(dir, namePattern, newName, [options])
This method searches the `dir` directory for files with names that match the `namePattern` regexp, and renames the matched files to `newName`.

This method works in a similar way as the following linux shell command: 
>find -name namePattern -exec mv \\{\\} newName \;

#####Arguments
* `dir` : String

    The directory from which search starts.

* `namePattern` : RegExp

    Search pattern in regular expression.

* `newName` : String

    The new file name.

* [`options`] : Object

    Options.

  * [`options.dryrun=false`]  : Boolean

        Dry-runs with verbose output only.


<hr>

<a name="traverse" />
####traverse(dir, [options], callback, [callback_arg...])
This method traverses through the `dir` directory tree, and applies the `callback` callback function to each file node.

This method is a synchronous function, though it calls a callback function.

#####Arguments
* `dir` : String

    The directory from which search starts.

* [`options`] : Object

    Options.

  * [`options.depthfirst=true`] : Boolean

        If true, [depth-first traversal](http://en.wikipedia.org/wiki/Depth-first_search); otherwise, [breadth-first traversal](http://en.wikipedia.org/wiki/Breadth-first_search)

  * [`options.callbackdelay=true`] : Boolean

        If true, when meeting a file node, calling to `callback` is delayed until returning back from all its sub-nodes.
        
* `callback` : Function

    The callback function to run for each file node.

* [`callback_arg`...]

    Optional arguments passed to `callback`.

#####Examples
The following code snippet traverses through your current directory and prints every file node.
```javascript
var zfse = require('zfse');
zfse.traverse('./', function (f) {
    console.log(f);
});
```


