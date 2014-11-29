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
    'traverse':     traverse,     // Traverses a directory
    'rRmDirSync':   rRmDirSync,   // Recursively removes a directory
    'rRenameSync':  rRenameSync,  // Recursively Rename all files under a directory
    'find':         find,         // Find files according to a specified file name pattern
};

/**
 * Traverses through the specified 'dir' directory tree, and apply the 
 * specificed 'callback' function to each file node with optional 
 * 'callback_arg' arguments passed to the function.
 *
 * @method traverse
 * @param dir {String} The directory to traverse.
 * @param [callback] {Function} The callback function to call for each file node traversing through.
 * @param [...callback_arg] The parameters to be passed to the 'callback'.
 */
function traverse(fpath, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    var stat = fs.lstatSync(fpath);
    if (stat.isDirectory()) {
        var files = fs.readdirSync(fpath);
        files.forEach(function (f) {
            traverse.apply(undefined, [path.join(fpath, f), callback].concat(cbArgs));
        });
    }
    callback.apply(undefined, [fpath].concat(cbArgs));
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
 * @param [options.verbose=false] {Boolean} Verbose log messages.
 */
function rRmDirSync(dir, options) {
    var dryrun = false;
    var verbose = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
        if (key === 'verbose') verbose = options.verbose;
    }

    traverse(dir, function (fpath) {
        if (verbose) {
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
 * @param [options.verbose=false] {Boolean} Verbose log messages
 */
function rRenameSync(dir, oldNamePattern, newName, options) {
    var dryrun = false;
    var verbose = false;

    for (var key in options) {
        if (key === 'dryrun') dryrun = options.dryrun;
        if (key === 'verbose') verbose = options.verbose;
    }

    traverse(dir, function (fpath) {
        var basename = path.basename(fpath);
        var dirname = path.dirname(fpath);
        var basename2 = basename.replace(oldNamePattern, newName);
        if (basename2 !== basename) {
            var fpath2  = path.join(dirname, basename2);
            if (verbose) {
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
    // arguments
    var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
    if (typeof namePattern === 'function') {
        callback = namePattern; // no namePattern, but callback only
        namePattern = null;
        cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    }
    traverse (dir, function (fpath) {
        if (namePattern) {
            var basename = path.basename(fpath);
            if (namePattern.exec(basename)) {
                console.log(fpath);
            }
        }
        else { //matched anything
            console.log(fpath);
        }

        if (callback) {
            callback.apply(undefined, [fpath].concat(cbArgs));
        }
    });
}



