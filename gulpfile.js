var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    less = require('gulp-less'),
    path = require('path');

gulp.task('scripts', function() {
  gulp.src('src/js/app.js')
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('less', function() {
  gulp.src('src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/css'));
});

gulp.task('default', ['scripts', 'less']);

gulp.task('watch', function() {
  gulp.watch('src/js/**', ['scripts']);
  gulp.watch('src/less/**', ['less']);
});

