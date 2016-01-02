'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let electron = require('electron-prebuilt');
let spawn = require('child_process').spawn;

const CSS_TARGET = 'app/renderer/css/app.scss';
const CSS_FILES = 'app/renderer/css/**/*';
const CSS_DEST = 'app/renderer/dist/css';
const JS_FILES = 'app/renderer/js/**/*';
const JS_DEST = 'app/renderer/dist/js';

gulp.task('build:js', () => {
  return gulp.src(JS_FILES)
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(JS_DEST));
});

gulp.task('build:css', () => {
  let opts = {
    includePaths: ['node_modules'],
  };

  return gulp.src(CSS_TARGET)
    .pipe($.sassGlob())
    .pipe($.sourcemaps.init())
    .pipe($.sass(opts).on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(CSS_DEST));
});

gulp.task('build', ['build:js', 'build:css']);

gulp.task('run', ['build'], (fn) => {
  spawn(electron, ['app/main.js'], { stdio: 'inherit' });
  gulp.watch(CSS_FILES, ['build:css']);
  gulp.watch(JS_FILES, ['build:js']);
  fn();
});

gulp.task('default', ['run']);
