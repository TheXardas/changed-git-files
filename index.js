var spawn = require("child_process").spawn;
var fs = require("fs");

var cgf = function(filter, callback) {

    if (typeof filter == "function") {
        callback = filter;
        filter = "ACDMRTUXB";
    }

    cgf.getHead(function(err, head) {
        if (err) {
            callback(err);
        } else {
            var command = "git diff --name-status --diff-filter=" + filter + " " + head;
            run(command, function(err, stdout, stderr) {
                if (err || stderr) {
                    callback(err || new Error(stderr));
                } else {
                    callback(null, stdoutToResultsObject(stdout));
                }
            });
        }
    });
}

cgf.cwd = process.cwd();
cgf.debug = false;
cgf.includeContent = false;

cgf.firstHead = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

cgf.getHead = function(callback) {
    run("git rev-parse --verify HEAD", function(err, stdout, stderr) {
        if (err && err.message.indexOf("fatal: Needed a single revision")!==-1) {
            callback(null, cgf.firstHead);
        } else if (err || stderr) {
            callback(err || new Error("STDERR: " + stderr));
        } else {
            stdout = stdout.replace("\n", "");
            callback(null, stdout);
        }
    });
}

cgf.readFile = function(filename, options, callback) {
    fs.readFile(cgf.cwd + "/" + filename, options, callback);
}


module.exports = cgf;

/** ======================================== HELPERS ======================================== **/

var run = function(command, callback) {
    if (cgf.debug) {
        console.log("RUNNING: " + command);
    }
    
    // var exec = require("child_process").exec;
    // exec("cd '" + module.exports.cwd + "' && " + command, callback);
    
    var bits = command.split(" ");
    var args = bits.slice(1);

    var cmd = spawn(bits[0], args, {
        cwd: module.exports.cwd
    });

    var stdout = "";
    var stderr = "";

    cmd.stdout.on('data', function(data){
        stdout+=data.toString();
    });

    cmd.stderr.on('data', function(data){
        stderr+=data.toString();
    });

    cmd.on("close", function(code){
        var err = null;

        if(code!==0){
            err = new Error(stderr);
        }
        
        callback(err,stdout,stderr);
    });
}

var codeToStatus = function(code) {
    /* ===============================================================================================================================
     ** PER git diff --help
     ** --diff-filter=[(A|C|D|M|R|T|U|X|B)...[*]]
     **     Select only files that are Added (A), Copied (C), Deleted (D), Modified (M), Renamed (R), have their type (i.e. regular
     **     file, symlink, submodule, ...) changed (T), are Unmerged (U), are Unknown (X), or have had their pairing Broken (B). Any
     **     combination of the filter characters (including none) can be used. When * (All-or-none) is added to the combination, all
     **     paths are selected if there is any file that matches other criteria in the comparison; if there is no file that matches
     **     other criteria, nothing is selected.
     ** ============================================================================================================================ */

    var map = {
        "A": "Added",
        "C": "Copied",
        "D": "Deleted",
        "M": "Modified",
        "R": "Renamed",
        "T": "Type-Change",
        "U": "Unmerged",
        "X": "Unknown",
        "B": "Broken"
    }

    return map[code];
}

var stdoutToResultsObject = function(stdout) {
    var results = [];
    var lines = stdout.split("\n");
    var iLines = lines.length;
    var files_with_errors = 0;
    while (iLines--) {
        var line = lines[iLines];
        if (line != "") {
            var parts = line.split("\t");
            var result = {
                filename: parts[1],
                status: codeToStatus(parts[0])
            }

            if (cgf.includeContent) {
                try {
                    result.content = fs.readFileSync(cgf.cwd + "/" + result.filename, {
                        encoding: "utf8"
                    });
                } catch (err) {
                    result.err = err;
                }
            }

            results.push(result);
        }
    }
    return results;
}
