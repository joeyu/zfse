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
    'verbose':      false,          // verbose output
    'traverse':     traverse,       // Traverses a directory
    'rRmDirSync':   rRmDirSync,     // Recursively removes a directory
    'rRenameSync':  rRenameSync,    // Recursively Rename all files under a directory
    'find':         find,           // Finds files according to a specified file name pattern
    'copyFileSync': copyFileSync,   // Synchronously copy a file
    'copyDirSync':  copyDirSync,    // Synchronously copy a directory
};

/**
 * Traverses through the specified 'dir' directory tree, and apply the 
 * specificed 'callback' function to each file node with optional 
 * 'callback_arg' arguments passed to the function.
 *
 * @method traverse
 * @param dir {String} The directory to traverse.
 * @param [options] {Object} The options
 * @param [options.depthfirst=true] {Object} Depth-first traversal.
 * @param [options.callbackdelay=true] {Object} callback delayed.
 * @param [callback] {Function} The callback function to call for each file node traversing through.
 * @param [...callback_arg] The parameters to be passed to the 'callback'.
 */
function traverse(fpath, options, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
    if (typeof options === 'function') {
        callback = options;
        options = null;
        cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    }
    var base = fpath;
    var depthfirst = true; 
    var callbackdelay = true; 
    for (var key in options) {
        if (key === 'depthfirst') depthfirst = options.depthfirst;
        if (key === 'callbackdelay') callbackdelay = options.callbackdelay;
    }
    
    var _traverseDepth = function (fpath, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        
        if (!callbackdelay) {
            callback.apply(undefined, [fpath, base].concat(cbArgs));
        }

        var stat = fs.lstatSync(fpath);
        if (stat.isDirectory()) {
            var files = fs.readdirSync(fpath);
            files.forEach(function (f) {
                _traverseDepth.apply(undefined, [path.join(fpath, f), base, callback].concat(cbArgs));
            });
        }
        if (callbackdelay) {
            callback.apply(undefined, [fpath, base].concat(cbArgs));
        }
    };

    var _traverseBreadth = function (fpaths, base, callback) {
        var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
        var nextLevel = [];

        fpaths.forEach(function (f) {
            if (!callbackdelay) {
                callback.apply(undefined, [f, base].concat(cbArgs));
            }

            var stat = fs.lstatSync(f);
            if (stat.isDirectory()) {
                nextLevel = nextLevel.concat(fs.readdirSync(f).map(function(e) {return path.join(f, e)}));
            }
        });


        if (nextLevel.length > 0) {
            _traverseBreadth.apply(undefined, [nextLevel, base, callback].concat(cbArgs));
        }

        if (callbackdelay) {
            fpaths.forEach(function (f) {
                callback.apply(undefined, [f, base].concat(cbArgs));
            });
        }
    };

    if (depthfirst) {
        _traverseDepth.apply(undefined, [fpath, base, callback].concat(cbArgs));
    }
    else {
        _traverseBreadth.apply(undefined, [[fpath], base, callback].concat(cbArgs));
    } 
}


/**
 * Recursively removes a directory. This function works in a similar way as linux 
 * shell command 'rm -rf'. 
 * If 'dir' is single file, this function works in the same way as fs.unlinkSync()
 *
 * @method rRmDirSync
 * @param dir {String} The directory to remove.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function rRmDirSync(dir, options) {
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
 * Recursively renames files matching the 'oldNamePattern' regex to 'newName'.
 * This function works a a similar way as linux shell command 'find -name oldNamePattern -exec mv \{\} newName \;'.
 * 
 * @method rRenameSync
 * @param dir {String} The directory from which search starts.
 * @param oldNamePattern {RegExp} Search pattern in regular expression.
 * @param newName {String} The new name.
 * @param [options] {Object} Options when running this function.
 * @param [options.dryrun=false] {Boolean} Dry-runs the function w/o actually renaming.
 */
function rRenameSync(dir, oldNamePattern, newName, options) {
    var dryrun = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
    }

    traverse(dir, {'depthfirst': true, 'callbackdelay': true}, function (fpath) {
        var basename = path.basename(fpath);
        var dirname = path.dirname(fpath);
        var basename2 = basename.replace(oldNamePattern, newName);
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
 * @method copyFileSync
 * @param src {String} The source file.
 * @param dst {String} The destination file, or directory.
 * @param [options] {Object} Options.
 */
function copyFileSync(src, dst, options) {
    var stat;
    if (!fs.existsSync(src)) {
        throw "File doesn't exists!";
    }

    stat = fs.lstatSync(src);
    if (!stat.isFile()) {
        throw "Not file!";
    }
    if (fs.existsSync(dst)) {
        stat = fs.lstatSync(dst);
        if (stat.isDirectory()) {
            dst += path.join(dst, path.basename(src));
        }
    }
    var blksize = stat.blksize;
    var fdSrc = fs.openSync(src, 'r');
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
    
/**
 * Synchromously copies a directory.
 *
 * @method copyDirSync
 * @param src {String} The source directory.
 * @param dst {String} The destination directory.
 * @param [options] {Object} Options.
 */
function  copyDirSync(src, dst, options) {
    var stat;

    src = path.normalize(src);
    dst = path.normalize(dst);

    if (src === dst) {
        throw "Can't copy self!";
    }

    if (!fs.existsSync(src)) {
        throw "File doesn't exists!";
    }

    stat = fs.lstatSync(src);
    if (!stat.isDirectory()) {
        throw "Not Directory!";
    }
    if (fs.existsSync(dst)) {
        stat = fs.lstatSync(dst);
        if (!stat.isDirectory()) {
            throw "Not Directory!";
        }

        var basename = path.basename(src);
        dst = path.join(dst, basename);

    }

    traverse(src, {'callbackdelay': false}, function (fpathSrc, baseSrc) {
        var fpathDst = path.join(dst, path.relative(baseSrc, fpathSrc));
        var stat = fs.lstatSync(fpathSrc);
        if (stat.isFile()) {
            copyFileSync(fpathSrc, fpathDst);
        }
        else if (stat.isDirectory()) {
            fs.mkdirSync(fpathDst);
        }
    });
}

