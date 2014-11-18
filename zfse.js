var fs = require('fs');
var path = require('path');

module.exports.traverse =   traverse;   // Traverses a directory
module.exports.rrmdir   =   rrmdirSync; // Recursively removes a directory
module.exports.find     =   find;       // Find files according to a specified file name pattern

// traverse(dir, callback [,callback_arg1 [,callback_arg2...]])
//
// Traverses through the specified 'dir' directory tree, and apply the 
// specificed 'callback' function to each file node with optional 
// 'callback_arg' arguments passed to the function.
function traverse(fpath, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    var stat = fs.lstatSync(fpath);
    if (stat.isDirectory()) {
        var files = fs.readdirSync(fpath);
        files.forEach(function (f) {
            var args = [path.join(fpath, f), callback, cbArgs];
            traverse.apply(undefined, args);
        });
    }
    callback.apply(undefined, cbArgs.unshift(fpath));
}

// rrmdirSync(dir)
//
// Recursively removes a directory
// When 'dir' is single file, this function works in the same way as fs.unlinkSync()
function rrmdirSync(dir, options) {
    var isDryRun = false;
    var isVerbose = false;

    for (var key in options) {
        if (key === 'isDryRun') isDryRun = options.isDryRun;
        if (key === 'isVerbose') isVerbose = options.isVerbose;
    }

    traverse(dir, function (fpath) {
        if (isVerbose) {
            console.log(fpath);
        }
        var stat = fs.lstatSync(fpath);
        if (stat.isDirectory()) {
            if (!isDryRun) {
                fs.rmdirSync(fpath);
            }
        }
        else {
            if (!isDryRun) {
                fs.unlinkSync(fpath);
            }
        }
    });
}

// rrenameSync(dir, oldNamePattern, newName))
function rrenameSync(dir, oldNamePattern, newName, options) {
    var isDryRun = false;
    var isVerbose = false;

    for (var key in options) {
        if (key === 'isDryRun') isDryRun = options.isDryRun;
        if (key === 'isVerbose') isVerbose = options.isVerbose;
    }

    traverse(dir, function (fpath) {
        var basename = path.basename(fpath);
        var dirname = path.dirname(fpath);
        var basename2 = basename.replace(oldNamePattern, newName);
        if (basename2 !== basename) {
            var fpath2  = path.join(dirname, basename2);
            if (isVerbose) {
                console.log("%s --> %s", fpath1, fpath2);
            }
            if (!isDryrun) {
                fs.renameSync(fpath, fpath2);
            }
        }
    });
}

// find(dir [,namePatten [,callback[, callback_arg1[, callback_arg2...]]]])
//
// Searches the specified directory 'dir' for an optionally specified 'namePattern' 
// file name pattern, calling the 'callback' function with 'callback_arg' arguments
// if specified.
function find(dir, namePattern, callback) {
    // arguments
    var cbArgs = Array.prototype.slice.call(arguments, 3); // gets callback arguments
    if (typeof namePattern === 'function') {
        callback = namePattern; // no namePattern, but callback only
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
            callback.apply(undefined, cbArgs.unshift(fpath));
        }
    });
}



