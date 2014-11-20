var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename');

var del = require('del');
var stylish = require('jshint-stylish');

// File globs
var clientJS = ['client/{app,components}/**/*.js',
                '!client/{app,components}/**/*.spec.js'];
var serverJS = ['server/**/*.js',
                '!server/**/*.spec.js'];

// Gulp Tasks
gulp.task('clean', function () {
    del('dist/');
});

// Linting
gulp.task('client:lint', function() {
    gulp.src(clientJS)
        .pipe(jshint('client/.jshintrc'))
        .pipe(jshint.reporter(stylish))
});
gulp.task('server:lint', function() {
    gulp.src(serverJS)
        .pipe(jshint('server/.jshintrc'))
        .pipe(jshint.reporter(stylish))
});
gulp.task('lint', ['client:lint', 'server:lint']);


// JS ugilfy
gulp.task('client:js', function () {
    gulp.src(clientJS)
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/public'));
});
gulp.task('server:js', function () {
    gulp.src(serverJS)
        .pipe(uglify())
        .pipe(gulp.dest('dist/server'));
});
gulp.task('js', ['client:js', 'server:js']);

// Stylesheets
// TODO: fix this. -_-
gulp.task('app:sass', function() {
    gulp.src('client/{app,components,bower_components}/**/*.scss')
        .pipe(sass({
            style: 'expanded',
            check: true,
            loadPath: [
                'client/bower_components',
                'client/components/',
                'client/app/'
            ]
        }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('public/app/'));
});

// Meta commands
gulp.task('build', ['lint', 'js']);
gulp.task('default', ['build']);