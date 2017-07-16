let gulp = require('gulp')
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let watchify = require("watchify");
let tsify = require("tsify");
let gutil = require("gulp-util");
let sass = require('gulp-sass')
let concat = require('gulp-concat')
let postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer');
let cssnano = require('cssnano');

let base_typescript = browserify({
    basedir: '.',
    entries: ['ts/index.ts']
}).plugin(tsify)

function build_typescript() {
    return base_typescript.bundle().pipe(source('index.js'))
        .pipe(gulp.dest('js'))
}

function watch_typescript() {
    let watch = watchify(base_typescript)
    watch.on('update', build_typescript)
    watch.on('log', gutil.log)
    return watch.bundle().pipe(source('index.js'))
        .pipe(gulp.dest('js'))
}

function build_sass() {
    gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', gutil.log))
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer(), cssnano()], {}))
        .pipe(gulp.dest('css'))
}

gulp.task('sass', build_sass)
gulp.task('watch_sass', function () {
    gulp.watch('sass/**/*.scss', ['sass'])
})

gulp.task('typescript', build_typescript)
gulp.task('watch_typescript', watch_typescript)


gulp.task('build', ['sass', 'typescript'])
gulp.task('watch', ['watch_sass', 'watch_typescript'])
gulp.task('default', ['watch'])

gulp.task('minify', ['build'], function () {

})