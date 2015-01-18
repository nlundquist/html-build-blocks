# html-build-blocks [![Build Status](https://travis-ci.org/nlundquist/html-build-blocks.svg?branch=master)](https://travis-ci.org/nlundquist/html-build-blocks)

> Parse build blocks in HTML to return a mapping from destination file to array of input files. Intended for use in combination with [gulp-replace-build-block](https://github.com/nlundquist/gulp-replace-build-block), [gulp-filter](https://github.com/sindresorhus/gulp-filter) and [gulp-concat](https://github.com/wearefractal/gulp-concat) to provide [useref](https://github.com/digisfera/useref) like behaviour in gulp.

Inspired by the [gulp-useref](https://github.com/jonkemp/gulp-useref) plugin,  but with a signifigantly different design to provide greater modularity and streaming support.


## Install
```
npm install --save-dev html-build-blocks
```


## Usage

The following example will parse HTML build blocks and use the returned map to create a gulp pipeline for concatination of those blocks. Note, this example doesn't order the files, they are concatinated in the order gulp loads them. To ensure ordering them simply add [gulp-order](https://github.com/sirlantis/gulp-order) to the pipeline.

```js
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    filter = require('gulp-filter'),
    buildblocks = require('html-build-blocks');

gulp.task('default', function () {
    var blocks = buildblocks.parseBlocks('html/**/*.html'),
        p = gulp.src(['/css/**/*.css', '/js/**/*.js']),
        add_block_pipe = function(path, asset_paths) {
            var f = filter(asset_paths),
                r = f.restore();
            p = p.pipe(f).pipe(concat(path)).pipe(r)
        };

    Object.keys(blocks).forEach(function() {
        add_block_pipe(path, blocks[path])
    });

	return p.pipe(gulp.dest('dist'));
});
```

Blocks are expressed as:
```html
<!-- build:<type> <path> -->
~ script tags or link tags ~
<!-- endbuild -->
```

- **type**: either `js` or `css`
- **alternate search path**: (optional) By default the input files are relative to the treated file. Alternate search path allows one to change that
- **path**: the file path of the optimized file, the target output


## API

### buildblocks.parseBlocks(glob)

Takes a glob or array of globs.
Returns a mapping of destination paths to arrays of source files.

eg.
```js
    buildblocks.parseBlocks(['html/**/*.html','error/404.html']) ==
    {
     'css/index.css': ['/css/this.css', '/libs/that.css', ...],
     'js/index.js': ['/js/one_thing.js', '/libs/another_thing.js', ...],
     'js/404.js': ['/js/warning.js', ...],
     ...
    }
```

## License

MIT © Nils Lundquist