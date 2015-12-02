'use strict';

var gulp = require('gulp');
var copy = require('gulp-copy');
var rimraf = require('rimraf');
var run = require('gulp-run');
var gutil = require('gulp-util')
var concat = require('gulp-concat')
var addsrc = require('gulp-add-src')


var paths = {
  filesrc: 'source/**/*',
  filepath: 'public'
}

gulp.task('watch', function(){
  gulp.watch('source/**/*', ['build']);
});

gulp.task('build', ['clean', 'bower'], function(){
  return gulp.src(['source/*.js', 'source/**/*.js'])
    .pipe(concat('bundle.js'))
    .pipe(addsrc('source/**/*.html'))
    .pipe(addsrc('source/**/*.css'))
    .pipe(addsrc('source/**/*'))
    .pipe(gulp.dest(paths.filepath))
    .on('error', gutil.log)
    console.log('IM WATCHING YOU')
});

gulp.task('clean', function(cb){
  rimraf(paths.filepath, cb)
});

gulp.task('bower', function(cb){
  run('bower i').exec(cb)
  .on('error', gutil.log);
});


gulp.task('default', ['build', 'watch']);
