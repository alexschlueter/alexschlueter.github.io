var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var merge2 = require('merge2');
var bowerMain = require('bower-main');

var bowerMainJavaScriptFiles = bowerMain('js','min.js');

gulp.task('vendor-dev', function() {
  return gulp.src(bowerMainJavaScriptFiles.normal)
    // .pipe(concat('vendor-scripts.js'))
        .pipe(gulp.dest('./js/vendor'));
});

gulp.task('vendor', function() {
  return merge2(
    gulp.src(bowerMainJavaScriptFiles.minified),
    gulp.src(bowerMainJavaScriptFiles.minifiedNotFound)
      // .pipe(concat('tmp.min.js'))
      .pipe(uglify())
  )
    // .pipe(concat('vendor-scripts.min.js'))
        .pipe(gulp.dest('./js/vendor'));
});
