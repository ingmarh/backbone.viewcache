var gulp   = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var name = 'backbone.viewcache';

gulp.task('compress', function(){
  gulp.src(name + '.js')
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(concat(name + '.min.js'))
    .pipe(gulp.dest('./'));
});
