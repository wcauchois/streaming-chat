var gulp = require('gulp'),
    browserify = require('browserify'),
    less = require('gulp-less'),
    path = require('path'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream');

// https://hacks.mozilla.org/2014/08/browserify-and-gulp-with-react/
gulp.task('scripts', function() {
  browserify('./src/js/app.js')
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build/js'));
});

gulp.task('clean', function(done) {
  del(['build'], done);
});

gulp.task('less', function() {
  gulp.src('src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/css'));
});

gulp.task('default', ['scripts', 'less']);

gulp.task('watch', ['scripts', 'less'], function() {
  gulp.watch('src/js/**', ['scripts']);
  gulp.watch('src/less/**', ['less']);
});

