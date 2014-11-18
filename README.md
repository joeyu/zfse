#zfse

Zhou's file system extension.

##API
----|----
###traverse(dir, callback [,callback_arg1 [,callback_arg2...]]) 
Traverses through the specified 'dir' directory tree, and apply the specificed 'callback' function to each file node with optional 'callback_arg' arguments passed to the function.

###rrmdirSync(dir[, options])
Recursively removes a directory When 'dir' is single file, this function works in the same way as fs.unlinkSync() 'options': 
    isDryRun (false)    - dry-runs the function w/o actually renaming (default: false)
    isVerbose (false)   - verbose log messages

###rrenameSync(dir, oldNamePattern, newName[, options]))

Recursively rename files matching the 'oldNamePattern' regex to 'newName'
'options': 
    isDryRun (false)    - dry-runs the function w/o actually renaming (default: false)
    isVerbose (false)   - verbose log messages

###find(dir [,namePatten [,callback[, callback_arg1[, callback_arg2...]]]])

Searches the specified directory 'dir' for an optionally specified 'namePattern' 
file name pattern, calling the 'callback' function with 'callback_arg' arguments
if specified.
