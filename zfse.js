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
    'verbose':          false,          // verbose output.
    'cloneSymLink':     cloneSymLink,   // Clones a symbolic link.
    'copy':             copy,           // Copies a file or directory.
    'isSymLink':        isSymLink,      // Checks if a file is symbolic link.
    'mkDirs':           mkDirs,         // Creates a directory and all its not existed parents.
    'move':             move,           // Moves a file or direcotry.
    'resolveFileType':  resolveFileType // Resolves the type of a file node.
    'resolveSymLink':   resolveSymLink, // Resolves a symbolic link.
    'search':           search,         // Searches a directory.
    'remove':           remove,         // Recursively removes a directory.
    'sRename':          sRename,        // Recursively renames all files under a directory.
    'traverse':         traverse,       // Traverses a directory.
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
        _traverseDepth.apply(null, [dir, base, callback].concat(cbArgs));
    }
    else {
        _traverseBreadth.apply(null, [[dir], base, callback].concat(cbArgs));
    } 
    
    function  _traverseDepth(dir, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        
        if (!callbackdelay) {
            var dirRet = callback.apply(null, [dir, base].concat(cbArgs));
            if (dirRet) { // `callback` changed the value of `dir`
                if (dir === base) {
                    base = dirRet;
                }
                dir = dirRet;
            }
        }

        if (resolveFileType(dir) === 'dir' 
                && (dir === base || (isSymLink(dir) && dereference))) {
            fs.readdirSync(dir).forEach(function (f) {
                _traverseDepth.apply(
                    null, 
                    [path.join(dir, f), base, callback].concat(cbArgs)
                );
            });
        }
        if (callbackdelay) {
            callback.apply(null, [dir, base].concat(cbArgs));
        }
    }

    function _traverseBreadth(files, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        var nextLevel = [];

        files.forEach(function (f) {
            if (!callbackdelay) {
                var fRet = callback.apply(null, [f, base].concat(cbArgs));
                if (fRet) { // `callback` changed the value of `f`
                    if (f === base) {
                        base = fRet;
                    }
                    f = fRet;
                }
            }

            if (resolveFileType(f) === 'dir' 
                    && (f === base || (isSymLink(f) && dereference))) {
                nextLevel = nextLevel.concat(
                    fs.readdirSync(f).map(function(e) {
                        return path.join(f, e);
                    })
                );
            }
        });


        if (nextLevel.length > 0) {
            _traverseBreadth.apply(null, [nextLevel, base, callback].concat(cbArgs));
        }

        if (callbackdelay) {
            dirs.forEach(function (f) {
                callback.apply(null, [f, base].concat(cbArgs));
            });
        }
    }
}


/**
 * Recursively removes a directory. 
 *
 * This function works in a similar way as linux shell command 'rm -rf'. 
 *
 * If 'file' is single file, this function works in the same way as fs.unlinkSync()
 *
 * @method remove
 * @param file {String} The directory to remove.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function remove(file, options) {
    var dryrun = false;
    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }

    traverse(
        dir, 
        {
            'depthfirst':       true, 
            'callbackdelay':    true, 
            'dereference':      false
        }, 
        function (f) {
            if (module.exports.verbose) {
                console.log(f);
            }
            if (!isSymLink(f) && resolveFileType(f) === 'dir') {
                if (!dryrun) {
                    fs.rmdirSync(f);
                }
            }
            else {
                if (!dryrun) {
                    fs.unlinkSync(f);
                }
            }
        }
    );
}

/**
 * Searches a directory for files whose names match `namePattern` and renames to 'newName'.
 * This function works a a similar way as linux shell command 'find -name namePattern -exec mv \{\} newName \;'.
 * 
 * @method sRename
 * @param dir {String} The directory from which search starts.
 * @param namePattern {RegExp} Search pattern in regular expression.
 * @param newName {String} The new name.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function sRename(dir, namePattern, newName, options) {
    var dryrun = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }

    search(
        dir, 
        namePattern,
        {
            'depthfirst':       true, 
            'callbackdelay':    true, 
            'dereference':      false
        }, 
        function (f) {
            var basename = path.basename(f);
            var dirname = path.dirname(f);
            var basename2 = basename.replace(namePattern, newName);
            if (basename2 !== basename) {
                var f2  = path.join(dirname, basename2);
                if (module.exports.verbose) {
                    console.log("%s --> %s", f, f2);
                }
                if (!dryrun) {
                    fs.renameSync(f, f2);
                }
            }
        }
    );
}

/**
 * Searches the specified directory 'dir' for an optionally specified 'namePattern' 
 * file name pattern, calling the 'callback' function with 'callback_arg' arguments
 * if specified.
 *
 * @method search
 * @param dir {String} The directory from which search starts.
 * @param [namePatten] {RegExp} Search pattern in regular expression.
 * @param [options] {Object} The options
 * @param [options.depthfirst=true] {Object} If true, depth-first traversal; otherwise, breadth-first traversal.
 * @param [options.callbackdelay=true] {Object} If true, calling to callback is delayed until returning from all its child nodes.
 * @param [options.dereference=true] {Object} If true, follows symbolic links under `dir`.
 * @param [callback] {Function} The callback funtion to run for each file node that is found
 * @param [...callback_arg] The parameters to be passed to the 'callback'.
 */
function search(dir) { // (dir, [namePattern], [options], callback, [callback_extra_arg...])
    var i;
    var namePattern = null;
    var options = null;
    var callback = null;
    for (i = 1; i < 4; i ++) {
        if (!namePattern && !options && arguments[i] instanceof RegExp) {
            namePattern = arguments[i];
            continue;
        }
        if (!options && typeof arguments[i] === 'object' && !(arguments[i] instanceof RegExp)) {
            options = arguments[i];
            continue;
        }
        
        if (typeof arguments[i] === 'function') {
            callback = arguments[i];
            break;
        }
    }
    var cbArgs = Array.prototype.slice.call(arguments, i + 1); // gets callback arguments

    traverse (dir, options, function (f) {
        var found = false;
        if (!namePattern) { //matched anything
            found = true;
        } else if (namePattern instanceof RegExp) {
            if (namePattern.exec(path.basename(f))) {
                found = true;
            }
        }

        if (found) {
            if (callback) {
                callback.apply(undefined, [f, dir].concat(cbArgs));
            }

            if (module.exports.verbose) {
               console.log(f);
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
 */
function copyFile(src, dst) {
    // If `dst` is an existing directory, copy `src` into it.
    if (resolveFileType(dst) === 'dir') {
        dst = path.join(dst, path.basename(src));
    }

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
}

function cloneSymLink(src, dst, literal) {
    if (!isSymLink(src)) {
        return;
    }

    if (!literal) {
        literal = true;
    }

    // If `dst` is an existing directory, copy `src` into it.
    if (resolveFileType(dst) === 'dir') {
        dst = path.join(dst, path.basename(src));
    }

    if (literal) {
        fs.symlinkSync(fs.readlinkSync(src), dst);
    } else {
        src = path.resolve(path.dirname(src), fs.readlinkSync(src));
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
 * @param [options.dereference=false] {Boolean} Only applicable when copying a directory. if true, will follow up all symbolic links.
 */
function  copy(src, dst, options) {
    var dereference = false;
    for (var key in options) {
        if (key === 'dereference') symlink = options.dereference;
    }

    // `src` endes up with path.seq?
    var isSrcExcluded = false;
    if (src[src.length - 1] === path.sep) {
        isSrcExcluded = true;
    }

    // If `dst` is an existing directory and `src` is included, copy `src` into it.
    if (resolveFileType(dst) === 'dir' && !isSrcExcluded) {
        dst = path.join(dst, path.basename(src));
    }

    if (resolveFileType(src) === 'dir') {
        traverse(
            src, 
            {
                'depthfirst':       true, 
                'callbackdelay':    false, 
                'dereference':      dereference
            }, 
            function (fSrc, baseSrc) {
                if (fSrc === baseSrc && isSrcExcluded) {
                    return;
                }
                var fDst = path.join(dst, path.relative(baseSrc, fSrc));
                if (isSymLink(fSrc) && !dereference) { // symlink
                    cloneSymLink(fSrc, fDst, true);
                    return;
                } 
                
                if (resolveFileType(fSrc) === 'dir') {
                    fs.mkdirSync(fDst);
                } else {
                    copyFile(fSrc, fDst);
                }
            }
        );
    } else {
        copyFile(src, dst);
    }
}

/**
 * Moves a file or directory.
 *
 * @method move
 * @param src {String} The source file or directory.
 * @param dst {String} The destination.
 */
function move(src, dst, options) {
    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }
    // If `dst` is an existing directory, move `src` into it.
    if (resolveFileType(src) === 'dir') {
        dst = path.join(dst, path.basename(src));
    }

    try {
        fs.renameSync(src, dst);
    }
    catch (e) {
        if (e.errno === 52) { // cross devices
            copy(src, dst, {'dereference': false});
            remove(src);
        }
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
 * Resolves a symbolic link.
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
        var components = p.split(path.sep);
        p = components[0];
        if (p === '') {
            p = path.sep; // root directory '/'
        }
        for (var i = 1; i < components.length; i ++) {
            p = path.join(p, components[i]);
            while (isSymLink(p)) {
                p = path.resolve(path.dirname(p), fs.readlinkSync(p));
            }
        }
    } else {
        while (isSymLink(dir)) {
            p = path.resolve(path.dirname(p), fs.readlinkSync(p));
        }
    }

    return p;
}

function isSymLink(file) {
    return fs.lstatSync(file).isSymbolicLink();
}

/**
 * Resolves the type of a file.
 *
 * If `file` is a symbolic link, it will be recursively followed up.  To check if a file is symbolic link, method `isSymbLink()` should be used instead.
 */
function resolveFileType(file) {
    if (!fs.existsSync(file)) {
        return null;
    }

    var stat = fs.statSync(file);

    if (stat.isFile()) {
        return 'file';
    }
    else if (stat.isDirectory()) {
        return 'dir';
    }
    else if (stat.isFIFO()) {
        return 'fifo';
    }
    else if (stat.isBlockDevice()) {
        return 'blkdev';
    }
    else if (stat.isCharacterDevice()) {
        return 'chardev';
    }
    else if (stat.isSocket()) {
        return 'socket';
    }
    else {
        return null;
    }
}


