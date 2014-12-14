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
Method                                  | Brief
:---------------------------------------|:-----
[`cloneSymLink`](#cloneSymLink)         |Clones a symbolic link.
[`copy`](#copy)                         |Copies a file or directory.
[`isSymLink`](#isSymLink)               |Checks if a file is a symbolic link.
[`mkDirs`](#mkDirs)                     |Creates a directory and all its non-existing parents.
[`move`](#move)                         |Moves a file or directory.
[`remove`](#remove)                     |Removes a directory including all its sub-nodes.
[`resolveFileType`](#resolveFileType)   |Resolves the type of a file node.
[`resolveSymLink`](#resolveSymLink)     |Resolves a symbolic link.
[`search`](#search)                     |Searches a directory.
[`sRename`](#sRename)                   |Searches a directory and renames matched files. 
[`traverse`](#traverse)                 |Traverses a directory with a specified callback applied to every file node.

<hr>

[Go back to **API Methods**](#Methods)
<a name="cloneSymLink" />
####cloneSymLink(src, dst, [literal])
This method clones a symbolic link.

#####Arguments
* `src` : `String`

    The source symbolic link.

* `dst` : `String`

    The destination file, or directory.

    If `dst` is a directory, the `src` will be copied to it with the same file name.

* [`literal`] : `Boolean`

    If true, the method copies literally; otherwise, the cloned symbolic link links to the exactly same destination to which `src` links. 

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="copy" />
####copy(src, dst, [options])
This method copies a file or directory

#####Arguments
* `src` : `String`

    The source file, or directory.

    If `src` is a directory ended up with *path.sep* (i.e. '*/*' in linux), not `src` itself but only all its child nodes will be copied.

* `dst` : `String`

    The destination file, or directory.

    If `dst` is a directory, the `src` will be copied to it with the same file name.

* [`options`] : `Object`

    Options. 

  * [`options.dereference=false`] : `String`

        This option is only applicable when when copying a directory. If true, all symbol links under that directory will be followed up.

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="search" />
####search(dir, [namePattern], [options], callback, [callback_extra_arg...])
Searches the specified directory `dir` for files matching the `namePattern` file name pattern, calling the `callback` function.

This method is a synchronous function, though it calls a callback function.

#####Arguments
* `dir` : `String` 

    The directory from which search starts.

* [`namePattern`] : `RegExp`

    Search pattern in regular expression.

    If `namePattern` isn't specified, all files (including sub-directories) will be matched.

* [`options`] : `Object`

    Options.

  * [`options.depthfirst=true`] : `Boolean`

        If true, [depth-first traversal](http://en.wikipedia.org/wiki/Depth-first_search); otherwise, [breadth-first traversal](http://en.wikipedia.org/wiki/Breadth-first_search)

  * [`options.callbackdelay=true`] : `Boolean`

        If `true`, when meeting a file node, calling to `callback()` is delayed until returning back from all its sub-nodes.
        
  * [`options.dereference=true`] : `Boolean`

        If `true`, follows symbolic links under `dir`.
        
* `callback` : `Function`

    The callback function to run for each file node. Its prototype is as follows:

    `function callback(file, base, [callback_extra_arg...]);`

  * `file` : `String`

        The file node iterated.

  * `base` : `String`

        Equals to `dir`, the base directory.

  * [`callback_extra_arg`...]

        The same `callback_extra_arg` passed to `traverse()`.

    Note:
        If `callback()` modifies the value of `file`, i.e. renamed `file`, it **must** return the new value. Because `traverse` needs the new value to proceed further on.

* [`callback_extra_arg`...] 

    Optional arguments passed to `callback`

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="mkDirs" />
####mkDirs(dir)
Creates a directory and all its non-existing parents.

This method works in a similar way as linux shell command 'mkdir -p' does.

#####Arguments
* `dir` : `String` 

    The directory to create.

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="move" />
####move(src, dst, [options])
This method moves a file or directory

#####Arguments
* `src` : `String`

    The source file, or directory.

* `dst` : `String`

    The destination file, or directory.

    If `dst` is a directory, the `src` will be moved to it with the same file name.

* [`options`] : `Object`

    Options. 

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="remove" />
####remove(file, [options])
Removes a file or a directory recursively.

If `file` is a directory, this method works in a similar way as linux shell command 'rm -rf' does. 

If `file` is a normal file, this method just calls to `fs.unlinkSync()` to remove it.

If any symbolic link that this method meets, only the symbolic link will be removed without further dereferencing.


#####Arguments
* `dir` : `String` 

    The directory to remove.

* [`options`] : `Object`

    Options.

  * [`options.dryrun=false`] : `Boolean`

        Dry-runs with verbose output only.

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="resolveFileType" />
####resolveFileType(file)
This method resolves the type of a file.

If `file` is a symbolic link, it will be recursively followed up.  To check if a file is symbolic link, method `isSymbLink()` should be used instead.

#####Arguments
* `file` : `String`

    The file to resolve.

#####Return
* Succeeded

    A `String` of the following values:

    Value       | Description
    :-----------|:-----------
    `'file'`    | Normal file
    `'dir'`     | Directory
    `'fifo'`    | FIFO
    `'blkdev'`  | Block device
    `'chardev'` | Character device
    `'socket'`  | Socket

* Failed

    `null`

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="resolveSymLink" />
####resolveSymLink(symlink, [options])
Resolves a symbolic link.

#####Arguments
* `symlink` : `String` 

    The symbolic link.

    If `symLink` isn't a symbolic link, the method works in the same way as `path.resolve()` does.

* [`options`] : `Object`

    Options.

  * [`options.parents=false`] : `Boolean`

        If `true`, resolves all its parent directories too.

#####Return
* Succeeded

    A `String` of the resolved path.

* Failed

    `null`

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="sRename" />
####sRename(dir, namePattern, newName, [options])
This method searches the `dir` directory for files whose names match the `namePattern` regexp, and renames the matched files to `newName`.

This method works in a similar way as the following linux shell command: 
>find -name namePattern -exec mv \\{\\} newName \;

Note:

    The replacement of `namePattern` with `newName` simply calls `String.prototype.replace()`.

#####Arguments
* `dir` : `String`

    The directory from which search starts.

* `namePattern` : `RegExp`

    Search pattern in regular expression.

* `newName` : `String`

    The new file name.

* [`options`] : `Object`

    Options.

  * [`options.dryrun=false`]  : `Boolean`

        Dry-runs with verbose output only.

#####Return

#####Examples

<hr>

[Go back to **API Methods**](#Methods)
<a name="traverse" />
####traverse(dir, [options], callback, [callback_extra_arg...])
This method traverses through the `dir` directory tree, and applies the `callback` callback function to each file node.

This method is a synchronous function, though it calls a callback function.

#####Arguments
* `dir` : `String`

    The directory from which search starts.

* [`options`] : `Object`

    Options.

  * [`options.depthfirst=true`] : `Boolean`

        If true, [depth-first traversal](http://en.wikipedia.org/wiki/Depth-first_search); otherwise, [breadth-first traversal](http://en.wikipedia.org/wiki/Breadth-first_search)

  * [`options.callbackdelay=true`] : `Boolean`

        If `true`, when meeting a file node, calling to `callback()` is delayed until returning back from all its sub-nodes.
        
  * [`options.dereference=true`] : `Boolean`

        If `true`, follows symbolic links under `dir`.
        
* `callback` : `Function`

    The callback function to run for each file node. Its prototype is as follows:

    `function callback(file, base, [callback_extra_arg...]);`

  * `file` : `String`

        The file node iterated.

  * `base` : `String`

        Equals to `dir`, the base directory.

  * [`callback_extra_arg`...]

        The same `callback_extra_arg` passed to `traverse()`.

    Note:
        If `callback()` modifies the value of `file`, i.e. renamed `file`, it **must** return the new value. Because `traverse` needs the new value to proceed further on.

* [`callback_extra_arg`...]

    Optional arguments passed to `callback`.
    
#####Return

#####Examples
The following code snippet traverses through your current directory and prints every file node.
```javascript
var zfse = require('zfse');
zfse.traverse('./', function (f) {
    console.log(f);
});
```


