compass-middleware
==================

compass middleware for [expressjs](expressjs.com).

* Note that the implement of Compass compile is mostly modified from the source of [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass) but have removed grunt dependence.

## install

```
npm install compass-middleware
```

## usage

```js
var compass = require( 'compass-middleware' );
var app = require( 'express' )();

app.use(compass({
      src: options.base,
      dest: options.tmpDir
    }, {
      sassDir: 'src',
      cssDir: 'src',
      imagesDir: 'src',
      generatedImagesDir: 'src',
      httpGeneratedImagesPath: 'http://localhost:3333/src',
      cacheDir: '.sass-cache',
      force: false
    }))
```

## config

This middleware accepts two object as options:

```js
compass( baseOptions, compassOptions )
```

`baseOptions` allows you to config source base and dest base

```js
{
    src: '/my/project/src',
    dest: '/var/tmp/temporary'
}
```

`compassOptions` is just the same as [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass#options) options.
