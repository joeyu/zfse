var fs = require('fs');
var path = require('path');

module.exports.traverse =   traverse;   // Traverses a directory
module.exports.rrmdir   =   rrmdir;     // Recursively removes a directory

// traverse(dir, callback [,callback_arg1 [,callback_arg2...]])
//
// Traverses through the specified dir tree, and apply the specificed 'callback' function
// to each file node with optional 'callback_arg' arguments passed to the function.
function traverse(path, callback) {
    var cbArgs = Array.prototype.slice.call(arguments, 2); // gets callback arguments
    var stat = fs.lstatSync(fpath);
    if (stat.isDirectory()) {
        var files = fs.readdirSync(dir);
        files.forEach(function (f) {
            traverse(path.join(path, f), callback, cbArgs);
        });
    }
    callback(path, cbArgs);
}

// rrmdirSync(dir)
//
// Recursively removes a directory
// When 'dir' is single file, this function works in the same way as fs.unlinkSync()
function rrmdirSync(dir) {
    traverse(dir, function (f) {
        var stat = fs.lstatSync(fpath);
        if (stat.isDirectory()) {
            fs.rmdirSync(f);
        }
        else {
            fs.unlinkSync(f);
        }
    });
}

// rrenameSync(dir, oldNamePattern, newName))
function rrenameSync(dir, oldNamePattern, newName, isDryRun) {
    isDryRun = true;
    traverse(dir, function (fpath, isDryRun) {
        var basename = path.basename(fpath);
        var dirname = path.dirname(fpath);
        var basename2 = basename.replace(oldNamePattern, newName);
        if (basename2 !== basename) {
            var fpath2  = path.join(dirname, basename2);
            console.log("%s --> %s", fpath1, fpath2);
            if (!isDryrun) {
                fs.renameSync(fpath, fpath2);
            }
        }
    });
}

    

