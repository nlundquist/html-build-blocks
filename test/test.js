/**
 * Created by Nils on 14-12-17.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;
var buildblocks = require('../index');

describe('build-block-read', function() {
    it('should parse blocks from the head and body for css and js', function() {
        var result = buildblocks.parseBlocks(['test/html/test.html']);

        expect(result).to.eql({
            "js/combined.js": [
                "/scripts/this.js",
                "/scripts/that.js"
            ],
            "js/body.js": [
                "/scripts/this.js",
                "/scripts/that.js"
            ],
            "css/combined.css": [
                "/css/one.css",
                "/css/two.css"
            ],
            "css/body.css": [
                "/css/one.css",
                "/css/two.css"
            ]
        });
    });
});