var _ = require( 'lodash' );
var Glob = require( 'glob' );
var Path = require( 'path' );
var FS = require( 'fs' );
var Spawn = require( 'child_process').spawn;

var processPatterns = function(patterns, fn) {
    // Filepaths to return.
    var result = [];
    // Iterate over flattened patterns array.
    _.flatten(patterns).forEach(function(pattern) {
        // If the first character is ! it should be omitted
        var exclusion = pattern.indexOf('!') === 0;
        // If the pattern is an exclusion, remove the !
        if (exclusion) { pattern = pattern.slice(1); }
        // Find all matching files for this pattern.
        var matches = fn(pattern);
        if (exclusion) {
            // If an exclusion, remove matching files.
            result = _.difference(result, matches);
        } else {
            // Otherwise add matching files.
            result = _.union(result, matches);
        }
    });
    return result;
};

module.exports = {
    exapnd: function(){

        var args = _.toArray(arguments);
        // If the first argument is an options object, save those options to pass
        // into the file.glob.sync method.
        var options = _.isPlainObject(args[0]) === 'object' ? args.shift() : {};
        // Use the first argument if it's an Array, otherwise convert the arguments
        // object to an array and use that.
        var patterns = _.isArray(args[0]) ? args[0] : args;
        // Return empty set if there are no patterns or filepaths.
        if (patterns.length === 0) { return []; }
        // Return all matching filepaths.
        var matches = processPatterns(patterns, function(pattern) {
            // Find all matching files for this pattern.
            return Glob.sync(pattern, options);
        });
        // Filter result set?
        if (options.filter) {
            matches = matches.filter(function(filepath) {
                filepath = Path.join(options.cwd || '', filepath);
                try {
                    if (typeof options.filter === 'function') {
                        return options.filter(filepath);
                    } else {
                        // If the file is of the right type and exists, this should work.
                        return FS.statSync(filepath)[options.filter]();
                    }
                } catch(e) {
                    // Otherwise, it's probably not the right type.
                    return false;
                }
            });
        }
        return matches;
    },

    spawn:  function( options, done) {

        var child = Spawn( options.cmd, options.args || [], options.opts );

        var stdout = new Buffer('');
        var stderr = new Buffer('');
        if (child.stdout) {
            child.stdout.on('data', function(buf) {
                stdout = Buffer.concat([stdout, new Buffer(buf)]);
            });
        }
        if (child.stderr) {
            child.stderr.on('data', function(buf) {
                stderr = Buffer.concat([stderr, new Buffer(buf)]);
            });
        }
        child.on('close', function(code) {

            var result = {
                stdout: stdout.toString(),
                stderr: stderr.toString()
            };

            if( code === 0 ){
                done( null, result, code );
            }
            else {
                done( new Error(stderr), result, code );
            }
        });

        return child;
    }
};