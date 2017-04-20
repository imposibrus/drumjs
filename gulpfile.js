/**
 * Created by Keith on 4/19/2017.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var uglifyjs = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');

function logError(e){
    console.log(e.cause);
}

gulp.task('drum.js', function(){
    var files = [
        'src/js/Drum.js'
        , 'src/js/DrumIcon.js'
        , 'src/js/PanelModel.js'
    ];

    return gulp.src(files)
        .pipe(concat('drum.js'))
        .pipe(gulp.dest('dist'))
        ;
});

gulp.task('drum.css', function(){
    var files = [
        'src/scss/drum.scss'
    ];

    return gulp.src(files)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'))
        ;
});

gulp.task('drum.min.js', ['drum.js'], function(){
    return gulp.src('dist/drum.js')
        .pipe(uglifyjs().on('error', logError))
        .pipe(rename('drum.min.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('drum.min.css', ['drum.css'], function(){
    return gulp.src('dist/drum.css')
        .pipe(uglifycss().on('error', logError))
        .pipe(rename('drum.min.css'))
        .pipe(gulp.dest('dist'))
});

gulp.task('default', ['drum.min.js', 'drum.min.css']);
