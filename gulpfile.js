var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var cssnano = require('gulp-cssnano');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
var babelify = require("babelify");

gulp.task('code', function () {
    return browserify({entries: './src/assets/js/main.js', debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(notify({ message: 'code task complete' }));
});

gulp.task('styles', function(){
    return gulp.src('./src/assets/css/styles.css')
        .pipe(cssnano())
        .pipe(gulp.dest('./dist/assets/css'))
        .pipe(notify({ message: 'styles task complete' }));
});

gulp.task('watch', function() {
    gulp.watch('./src/assets/css/**/*.css', ['styles']);
    gulp.watch('./src/assets/js/**/*.js', ['code']);
    gulp.watch('./src/assets/glsl/**/*.glsl', ['code']);

    livereload.listen();

    gulp.watch(['./dist/**']).on('change', livereload.changed);

});

gulp.task('default', [], function() {
    gulp.start('styles', 'code', 'watch');
});

