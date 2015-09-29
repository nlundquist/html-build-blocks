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
var reg_comment = /<!--(.*?)-->/;
var reg_comment_start = /<!--/;
var reg_comment_end = /-->/;
var reg_whitespace = /^(\s*)$/;

function fread(f) {
  return fs.readFileSync(f, {encoding: 'utf-8'});
}

function getBlocks(body, path) {
  var lines = body.replace(/\r\n/g, '\n').split(/\n/),
    block = false,
    incomment = false,
    sections = {},
    block_type,
    block_lines,
    block_path;

  lines.forEach(function (l, i) {
    var build = l.match(reg_build),
      endbuild = reg_end.test(l);

    if (l.trim().length == 0) {
    } else if (incomment) {
      if (l.match(reg_comment_end)) {
        incomment = false;
      }
    } else if (l.match(reg_comment_start) && ! l.match(reg_comment)) {
      incomment = true;
    } else if (endbuild) {
      sections[block_path] = block_lines;
      block_lines = [];
      block = false;
    } else if (block) {
      var re = block_type == "css" ? reg_link : reg_script;
      var src = l.match(re);

      if (l.match(reg_comment) && !build) {}
      else if (src) block_lines.push(src[1]);
      else throw new RangeError("No asset source URI could be parsed on line #" + (i+1) + " " + path +
          "\n" + l);
    } else if (build) {
      block = true;

      block_type = build[1];
      block_path = build[3];
      block_lines = [];
    }
  });

  return sections;
}

module.exports.parseBlocks = function(path_globs) {
  var all_blocks = {};

  glob.sync(path_globs, {nosort:true}).forEach(function(path) {
    var blocks = getBlocks(fread(path), path);

    Object.keys(blocks).forEach(function(block_path) {
      all_blocks[block_path] = blocks[block_path];
    });
  });

  return all_blocks;
};