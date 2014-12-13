/* Copyright 2014 Zhou Yu
 */
/**
 * Zhou's File System Extension to the 'fs' module of node.js.
 *
 * @module zfse
 * @class zfse
 * @static
 */
var fs = require('fs');
var path = require('path');

module.exports = {
    'verbose':          false,          // verbose output
    'traverse':         traverse,       // Traverses a directory
    'rRmDir':           rRmDir,         // Recursively removes a directory
    'rRename':          rRename,        // Recursively renames all files under a directory
    'find':             find,           // Finds files according to a specified file name pattern
    'copy':             copy,           // Copies a file or directory
    'mkDirs':           mkDirs,         // Creates a directory and all its not existed parents
    'resolveSymLink':   resolveSymLink, // Resolves a symbolic link.
};

/**
 * Traverses through the specified 'dir' directory tree, and apply the 
 * specificed 'callback' function to each file node with optional 
 * 'callback_arg' arguments passed to the function.
 *
 * @method traverse
 * @param dir {String} The directory to traverse.
 * @param [options] {Object} The options
 * @param [options.depthfirst=true] {Object} If true, depth-first traversal; otherwise, breadth-first traversal.
 * @param [options.callbackdelay=true] {Object} If true, calling to callback is delayed until returning from all its child nodes.
 * @param [options.dereference=true] {Object} If true, follows symbolic links under `dir`.
 * @param callback {Function} The callback function to call for each file node traversing through.
 * @param [...callback_arg] The parameters to be passed to the 'callback'.
 */
function traverse(dir, options, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
    if (typeof options === 'function') {
        callback = options;
        options = null;
        cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    }
    var base = dir;
    var depthfirst = true; 
    var callbackdelay = true; 
    var dereference = true;
    for (var key in options) {
        if (key === 'depthfirst') depthfirst = options.depthfirst;
        if (key === 'callbackdelay') callbackdelay = options.callbackdelay;
        if (key === 'dereference') dereference = options.dereference;
    }

    if (depthfirst) {
        _traverseDepth.apply(undefined, [dir, base, callback].concat(cbArgs));
    }
    else {
        _traverseBreadth.apply(undefined, [[dir], base, callback].concat(cbArgs));
    } 
    
    function  _traverseDepth(dir, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        
        if (!callbackdelay) {
            callback.apply(undefined, [dir, base].concat(cbArgs));
        }

        var dirResolved = dir;
        if ( dir === base || (fs.lstatSync(dir).isSymbolicLink() && dereference)) {
            dirResolved = resolveSymLink(dir, {'parents': false});
        }
        if (fs.lstatSync(dirResolved).isDirectory()) {
            var files = fs.readdirSync(dir);
            files.forEach(function (f) {
                _traverseDepth.apply(undefined, [path.join(dir, f), base, callback].concat(cbArgs));
            });
        }
        if (callbackdelay) {
            callback.apply(undefined, [dir, base].concat(cbArgs));
        }
    }

    function _traverseBreadth(files, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        var nextLevel = [];

        files.forEach(function (f) {
            if (!callbackdelay) {
                callback.apply(undefined, [f, base].concat(cbArgs));
            }

            var fResolved = f;
            if (f === base || (fs.lstatSync(f).isSymbolicLink() && dereference)) {
                fResolved = resolveSymLink(f, {'parents': false);
            }
            if (fs.lstatSync(fResolved).isDirectory()) {
                nextLevel = nextLevel.concat(fs.readdirSync(f).map(function(e) {return path.join(f, e)}));
            }
        });


        if (nextLevel.length > 0) {
            _traverseBreadth.apply(undefined, [nextLevel, base, callback].concat(cbArgs));
        }

        if (callbackdelay) {
            dirs.forEach(function (f) {
                callback.apply(undefined, [f, base].concat(cbArgs));
            });
        }
    }
}


/**
 * Recursively removes a directory. This function works in a similar way as linux 
 * shell command 'rm -rf'. 
 * If 'dir' is single file, this function works in the same way as fs.unlinkSync()
 *
 * @method rRmDir
 * @param dir {String} The directory to remove.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function rRmDir(dir, options) {
    var dryrun = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }

    traverse(dir, {'depthfirst': true, 'callbackdelay': true}, function (fpath) {
        if (module.exports.verbose) {
            console.log(fpath);
        }
        var stat = fs.lstatSync(fpath);
        if (stat.isDirectory()) {
            if (!dryrun) {
                fs.rmdirSync(fpath);
            }
        }
        else {
            if (!dryrun) {
                fs.unlinkSync(fpath);
            }
        }
    });
}

/**
 * Recursively renames files matching the 'namePattern' regex to 'newName'.
 * This function works a a similar way as linux shell command 'find -name namePattern -exec mv \{\} newName \;'.
 * 
 * @method rRename
 * @param dir {String} The directory from which search starts.
 * @param namePattern {RegExp} Search pattern in regular expression.
 * @param newName {String} The new name.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function rRename(dir, namePattern, newName, options) {
    var dryrun = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }

    traverse(dir, {'depthfirst': true, 'callbackdelay': true}, function (fpath) {
        var basename = path.basename(fpath);
        var dirname = path.dirname(fpath);
        var basename2 = basename.replace(namePattern, newName);
        if (basename2 !== basename) {
            var fpath2  = path.join(dirname, basename2);
            if (module.exports.verbose) {
                console.log("%s --> %s", fpath, fpath2);
            }
            if (!dryrun) {
                fs.renameSync(fpath, fpath2);
            }
        }
    });
}

/**
 * Searches the specified directory 'dir' for an optionally specified 'namePattern' 
 * file name pattern, calling the 'callback' function with 'callback_arg' arguments
 * if specified.
 *
 * @method find
 * @param dir {String} The directory from which search starts.
 * @param namePatten {RegExp} Search pattern in regular expression.
 * @param [callback] {Function} The callback funtion to run for each file node that is found
 * @param [...callback_arg] The parameters to be passed to the 'callback'.
 */
function find(dir, namePattern, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
    if (typeof namePattern === 'function') {
        callback = namePattern; // no namePattern, but callback only
        namePattern = null;
        cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    }
    traverse (dir, {'depthfirst': true, 'callbackdelay': false}, function (fpath) {
        var found = false;
        if (namePattern) {
            var basename = path.basename(fpath);
            if (namePattern.exec(basename)) {
                found = true;
            }
        }
        else { //matched anything
            found = true;
        }

        if (found) {
            if (callback) {
                callback.apply(undefined, [fpath, dir].concat(cbArgs));
            }

            if (module.exports.verbose) {
               console.log(fpath);
            }
        }
    });
}

/**
 * Synchronously copies a file.
 * If the destination is a directory, the source file copy will be copied to it with the
 * same file name.
 *
 * @method copyFile
 * @param src {String} The source file.
 * @param dst {String} The destination file, or directory.
 * @param [options] {Object} Options.
 * @param [options.symlink='dereference'] {String} Only works when `src` is a symbolic link. 
 *      'dereference'   - follows the symbolic link.
 *      'link'          - just copies the link.
 *      'linkorigin'    - create a new symlink which links to the exactly same destination to which `src` links. 
 */
function copyFile(src, dst, options) {
    var symlink = 'dereference';
    for (var key in options) {
        if (key === 'symlink') symlink = options.symlink;
    }

    dst = resolveSymLink(dst, {'parents': false});
    // If `dst` is an existing directory, copy `src` into it.
    if (fs.existsSync(dst)) {
        if (fs.lstatSync(dst).isDirectory()) {
            dst = path.join(dst, path.basename(src));
        }
    }

    var isSrcSymLink = path.lstatSync(src).isSymbolicLink();

    if (symlink === 'dereference') {
        var blksize = fs.lstatSync(src).blksize;
        var fdSrc = fs.openSync(src, 'rs');
        var fdDst = fs.openSync(dst, 'w');
        var buf = new Buffer(blksize);
        var n;
        while (n = fs.readSync(fdSrc, buf, 0, blksize, null)) {
            if (n !== fs.writeSync(fdDst, buf, 0, n, null)) {
                throw "Write file failed!";
            }
        }
        fs.closeSync(fdSrc);
        fs.closeSync(fdDst);

        if (module.exports.verbose) {
            console.log("Copied '%s' to '%s'.", src, dst);
        }
    } else if (isSrcSymLink && symlink === 'link') {
        fs.symlinkSync(fs.readlinkSync(src), dst);
    } else if (isSrcSymLink && symlink === 'linkorigin') {
        src = resolveSymLink(src, {'parents': false});
        src = path.relative(path.dirname(dst), src);
        fs.symlinkSync(src, dst);
    }
}

    
/**
 * Synchronously copies a file or directory.
 *
 * If `src` is a directory ended up with path.sep, not `src` itself but only all its child nodes will be copied to `dst`.
 *
 * @method copy
 * @param src {String} The source file or directory.
 * @param dst {String} The destination.
 * @param [options] {Object} Options.
 * @param [options.symlink='dereference'] {String} Only works when `src` is a symbolic link. If `src` links to a directory, only applies to its child nodes.
 *      'dereference'   - follows the symbolic link.
 *      'link'          - just copies the link.
 *      'linkorigin'    - create a new symlink which links to the exactly same destination to which `src` links. 
 */
function  copy(src, dst, options) {
    var symlink = 'dereference';
    for (var key in options) {
        if (key === 'symlink') symlink = options.symlink;
    }

    // `src` endes up with path.seq?
    var isSrcExcluded = false;
    if (src[src.length - 1] = path.sep) {
        isSrcExcluded = true;
    }

    src = resolveSymLink(src, {'parents': false});
    dst = resolveSymLink(dst, {'parents': false});
    // If `dst` is an existing directory and `src` is included, copy `src` into it.
    if (fs.existsSync(dst)) {
        if (fs.lstatSync(dst).isDirectory() && !isSrcExcluded) {
            dst = path.join(dst, path.basename(src));
        }
    } else {
        if (isSrcExcluded) {
            throw "`dst` must exist if `src` ends up with path.sep";
        }
    }

    if (src === dst) {
        throw "Can't copy self!";
    }

    if (fs.lstatSync(src).isFile()) {
        copyFile(src, dst, {'symlink': 'dereference'});
    } else if (fs.lstatSync(src).isDirectory()) {
        traverse(src, {'depthfirst': true, 'callbackdelay': false, 'dereference': dereference}, function (fSrc, baseSrc) {
            if (fSrc === baseSrc && isSrcExcluded) {
                return;
            }
            var fDst = path.join(dst, path.relative(baseSrc, fSrc));
            if (fs.lstatSync(fSrc).isSymbolicLink()) {
                if (symlink === 'dereference') {
                    fSrc = resolveSymLink(fSrc);
                } else {
                    copyFile(fSrc, fDst, {'symlink': symlink});
                    return;
                }
            } 
            
            if (fs.lstatSync(fSrc).isDirectory()) {
                fs.mkdirSync(fDst);
            } else {
                copyFile(fSrc, fDst, {'symlink': 'dereference');
            }
        });
    }
}

/**
 * Creates a directory and all its non-existed parents.
 *
 * @method mkDirs
 * @param   dir {String} The direcotry path.
 * @return
 *      succeeded   - {String} the resolved path
 *      failed      - null
 */
function mkDirs(dir) {
    var components = path.resolve(dir).split(path.sep);
    var toCreate = false; // flag indicating to start create all successive directory components
    dir = components[0];
    if (dir === '') {
        dir = path.sep; // root directory '/'
    }
    for (var i = 1; i < components.length; i ++) {
        dir = path.join(dir, components[i]);
        if (!toCreate && !fs.existsSync(dir)) {
            toCreate = true; 
        }

        if (toCreate) {
            fs.mkdirSync(dir);
        }
    }

    return dir;
}

/**
 * Recursively resolves a symbolic link.
 *
 * If `symLink` isn't a symbolic link, the method works in the same way as path.resolve() does;
 *
 * @method resolveSymLink
 * @param   symLink {String} symbolic link
 * @param   [options] {Object} Options
 * @param   [options.parents=false] If true, resolve all its parent directories too.
 * @return
 *      succeeded   - {String} the resolved path
 *      failed      - null
 */
function resolveSymLink(symLink, options) {
    var parents = false;
    for (var key in options) {
        if (key === 'parents') parents = options.parents;
    }

    var p = path.resolve(symLink);
    
    if (parents) {
        var components = dpath.split(path.sep);
        var dir = components[0];
        if (dir === '') {
            dir = path.sep; // root directory '/'
        }
        for (var i = 1; i < components.length; i ++) {
            dir = path.join(dir, components[i]);
            while (fs.lstatSync(dir).isSymbolicLink()) {
                dir = path.resolve(path.dirname(dir), fs.readlinkSync(dir));
            }
        }
    } else {
        while (fs.lstatSync(p).isSymbolicLink()) {
            p = path.resolve(path.dirname(p), fs.readlinkSync(p));
        }
    }

    return p;
}


