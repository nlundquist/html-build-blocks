'use strict';

/**

    parseBlocks() expects a set of path globs to html files as input, and then searches those files for build blocks,
    returning maps of block output paths to an ordered list of the paths referenced by the script or link tags in
    the block.

    Expected input, list of paths globs:
        parseBlocks(['html/**\/*.html', 'admin/**\/*.html'])

    Expected output:
        A pair of maps (one for css, another for js) of block paths to paths contained by that block
        [{
            'js/block/libs.js': [
                'js/lib/script-one.js',
                'js/lib/script-two.js',
                ...
            ],
            'js/block/app.js': [
                'js/app/script-one.js',
                'js/app/script-two.js',
                ...
            ],
            ...
        },
        {
            'css/block/combined.css': [
                'css/app/style-one.js',
                'css/app/style-two.js',
                ...
            ],
            ...
        }]

 **/

var glob = require('glob-all');
var fs = require('fs');

var reg_build = /<!--\s*build:(\w+)(?:\(([^\)]+)\))?\s*([^\s]+)?\s*(?:(.*))?\s*-->/;
var reg_end = /<!--\s*endbuild\s*-->/;
var reg_link = /(?:.*?)<link(?:.*?)href="(.*?)"(?:.*)/;
var reg_script = /(?:.*?)<script(?:.*?)src="(.*?)"(?:.*)/;

function fread(f) {
    return fs.readFileSync(f, {encoding: 'utf-8'});
}

function getBlocks(body) {
    var lines = body.replace(/\r\n/g, '\n').split(/\n/),
        block = false,
        css_sections = {},
        js_sections = {},
        block_type,
        block_lines,
        block_path;

    lines.forEach(function (l) {
        var build = l.match(reg_build),
            endbuild = reg_end.test(l);

        if (endbuild) {
            if (block_type == 'css') {
                css_sections[block_path] = block_lines;
                block_lines = []
            } else if (block_type == 'js') {
                js_sections[block_path] = block_lines;
                block_lines = []
            } else {
                throw new TypeError("Invalid build block type. Type string must be 'css' or 'js'.")
            }
            block = false;
        }

        if (block) {
            var re = block_type == "css" ? reg_link : reg_script;
                block_lines.push(l.match(re)[1]);
        }

        if (build) {
            block = true;

            block_type = build[1];
            block_path = build[3];
            block_lines = [];
        }
    });

    return [js_sections, css_sections];
}

module.exports.parseBlocks = function(path_globs) {
    var css = {};
    var js = {};

    glob.sync(path_globs, {nosort:true}).forEach(function(path) {
        var blocks = getBlocks(fread(path));
        var js_blocks = blocks[0];
        var css_blocks = blocks[1];

        Object.keys(js_blocks).forEach(function(block_path) {
           js[block_path] = js_blocks[block_path];
        });

        Object.keys(css_blocks).forEach(function(block_path) {
            css[block_path] = css_blocks[block_path];
        });
    });

    return [js, css];
};