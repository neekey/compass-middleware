"use strict";

var express = require('express');
var fs = require('fs');
var middleware = require('../index');
var request = require('supertest');

var tmpDest = __dirname + '/compass_project_tmp';
var src = __dirname + '/compass_project';
var expectedDir = __dirname + '/compass_project_expected';

describe('middleware', function(){
    describe('simple', function(){
        var app = express();
        app.use(middleware({
            src: src,
            dest: tmpDest
        }, {
            sassDir: 'src',
            cssDir: 'src',
            imagesDir: 'src',
            generatedImagesDir: 'src',
            httpGeneratedImagesPath: 'http://host.com/my/path',
            sourcemap: false,
            noLineComments: true,
            cacheDir: '.sass-cache',
            force: true
        }));
        app.use(express.static(tmpDest));

        it('should process simple less files', function(done){
            var expected = fs.readFileSync( expectedDir + '/src/p/index/index.css', 'utf8');
            request(app)
                .get('/src/p/index/index.css')
                .expect(200)
                .expect(expected, done);
        });
    });
});
