#zfse

Zhou's File System Extension to the 'fs' module of node.js.

`zfse` aims to provide a set of high-level, **synchronous** utility functions operating upon the file system.


##Installation
    $ npm install zfse

##Usage

```javascript
var zfse = require('zfse');
```

<a name="Methods">
##API
###Methods
Method                              | Brief
:-----------------------------------|:-----
[`copy`](#copy)                     |Copies a file or directory.
[`find`](#find)                     |Searches a directory.
[`mkDirs`](#mkDirs)                 |Creates a directory and all its non-existing parents.
[`move`](#move)                     |Moves a file or directory.
[`resolveSymLink`](#resolveSymbLink)|Resolves a symbolic link.
[`rRmDir`](#rRmDir)                 |Recursively removes a directory.
[`rRename`](#rRename)               |Recursively renames the files under a directory. 
[`traverse`](#traverse)             |Traverses a directory with a specified callback applied to every file node.

<hr>

[Go back to **API Methods**](#Methods)
<a name="copy" />
####copy(src, dst, [options])
This method copies a file or directory

If the destination is a directory, the source file copy will be copied to it with the same file name.

#####Arguments
* `src` : String

    The source file, or directory.

    If `src` is a directory ended up with *path.sep* (i.e. '*/*' in linux), not `src` itself but only all its child nodes will be copied.

* `dst` : String 

    The destination file, or directory.

* [`options`] : Object

    Options. 

  * [`options.symlink=dereference`] : String

        This option is only applicable when `src` is a symbolic link. And, if `src` links to a directory, it will applies to its child nodes only.

    * '*dereference*'   - follows the symbolic link.
    * '*link*'          - just copies the link literally.
    * '*linkorigin*'    - Creates a new symbolic link which links to the exactly same destination to which `src` links.

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

[Go back to **API Methods**](#Methods)
<a name="mkDirs" />
####mkDirs(dir)
Creates a directory and all its non-existing parents.

This method works in a similar way as linux shell command 'mkdir -p' does.

#####Arguments
* `dir` : String 

    The directory to create.

#####Return
* Succeeded - {String} The resolved path.
* Failed    - null

<hr>

[Go back to **API Methods**](#Methods)
<a name="resolveSymLink" />
####resolveSymLink(symlink, [options])
Resolves a symbolic link.

#####Arguments
* `symlink` : String 

    The symbolic link.

    If `symLink` isn't a symbolic link, the method works in the same way as path.resolve() does;

* [`options`] : Object

    Options.

  * [`options.parents=false`] : Boolean

        If true, resolves all its parent directories too.

#####Return
* Succeeded - {String} The resolved path.
* Failed    - null

<hr>

[Go back to **API Methods**](#Methods)
<a name="rRmDir" />
####rRmDir(dir, [options])
Recursively removes the `dir` directory synchronously. 

This method works in a similar way as linux shell command 'rm -rf' does. If `dir` is a single file, this method works in the same way as fs.unlinkSync()

#####Arguments
* `dir` : String 

    The directory to remove.

* [`options`] : Object

    Options.

  * [`options.dryrun=false`] : Boolean

        Dry-runs with verbose output only.


<hr>

[Go back to **API Methods**](#Methods)
<a name="rRename" />
####rRename(dir, namePattern, newName, [options])
This method searches the `dir` directory for files with names that match the `namePattern` regexp, and renames the matched files to `newName`.

This method works in a similar way as the following linux shell command: 
>find -name namePattern -exec mv \\{\\} newName \;

Note:

    The replacement of `namePattern` with `newName` simply calls String.prototype.replace().

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

[Go back to **API Methods**](#Methods)
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
        
  * [`options.dereference=true`] : Boolean

        If true, follows symbolic links under `dir`.
        
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


