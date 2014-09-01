var Compass = require( './lib/compass' );
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
        'cssDir',
        'generatedImagesDir',
        'generatedImagesPath',
        'cacheDir'
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

            // 某些路径使用的是相对当前工作目录的路径
            if( key == 'generatedImagesDir' || key == 'cacheDir' ){
                _compassOptions[ key ] = Path.relative( process.cwd() , Path.join( dest, opt) );
            }
            else {
                _compassOptions[ key ] = Path.join( dest, opt);
            }
        }
    });

    var callbacks = [];

    return function( req, res, next ){

        if( /\/.*\.css\??/.test( req.url ) ){

            var sassBasePath = Path.join( src, req.url.replace( /\.css\??.*/, '.scss') );

            if( FS.existsSync( sassBasePath ) ){

                if( callbacks.length == 0 ){

                    callbacks.push( next );
                    Compass.compile( _compassOptions, function(){
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