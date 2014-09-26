var Compass = require( 'compass-compiler' );
var FS = require( 'fs' );
var _ = require( 'lodash' );
var Path = require( 'path' );

module.exports = function( options, compassOptions ){

    var _compassOptions = _.cloneDeep( compassOptions );

    var srcPaths = [
        'sassDir',
        'sassPath',
        'imagesPath',
        'imagesDir',
        'javascriptsPath',
        'javascriptsDir',
        'fontsPath',
        'fontsDir',
        'extensionsDir',
        'spriteLoadPath',
        'importPath'
    ];

    var destPaths = [
        'cssPath',
        'cssDir'
    ];

    // https://github.com/Compass/compass/issues/1108#issuecomment-53404779
    var src = options.src || '';
    var dest = options.dest || src || '';


    _.each( _compassOptions, function( opt, key ){

        if( srcPaths.indexOf( key ) >= 0 ){

            if( _.isArray( opt ) ){
                opt.forEach(function( o, i ){
                    opt[ i ] = Path.join( src, o );
                });
            }
            else {
                opt = Path.join( src, opt );
            }
            _compassOptions[ key ] = opt;
        }

        if (destPaths.indexOf( key ) >= 0) {

            _compassOptions[ key ] = Path.join( dest, opt);
        }
    });

    var callbacks = [];

    return function( req, res, next ){

        if( /\/.*\.css\??/.test( req.url ) ){

            var sassBasePath = Path.join( src, req.url.replace( /\.css\??.*/, '.scss') );

            if( FS.existsSync( sassBasePath ) ){

                if( callbacks.length == 0 ){

                    callbacks.push( next );
                    Compass.compile( _compassOptions, function( err, result, code ){

                        if (code === 127) {
                            console.warn(
                                    'You need to have Ruby and Compass installed ' +
                                    'and in your system PATH for this task to work. '
                            );
                        }

                        // `compass compile` exits with 1 and outputs "Nothing to compile"
                        // on stderr when it has nothing to compile.
                        // https://github.com/chriseppstein/compass/issues/993
                        // Don't fail the task in this situation.
                        if (code === 1 && !/Nothing to compile|Compass can't find any Sass files to compile/g.test(result.stderr)) {
                            console.warn('↑');
                        }

                        callbacks.forEach(function( cb ){
                            cb();
                        });

                        callbacks = [];
                    });
                }
                else {
                    callbacks.push( next );
                }
            }
            else {
                next();
            }
        }
        // Handle sprite images.
        else if( /\/.+-.+\.png\??/.test( req.url ) ){

            var imagePath = Path.join( dest, req.url );

            if( FS.existsSync( imagePath ) ){
                res.type('png');
                res.send( FS.readFileSync( imagePath ) );
            }
            else {
                next();
            }
        }
        else {
            next();
        }
    }

};

//module.exports = Compass;
