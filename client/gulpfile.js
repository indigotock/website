let gulp = require('gulp')
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let watchify = require("watchify");
let tsify = require("tsify");
var sourcemaps = require('gulp-sourcemaps');
let gutil = require("gulp-util");
let buffer = require('vinyl-buffer');
let sass = require('gulp-sass')
let concat = require('gulp-concat')
let postcss = require('gulp-postcss')
let autoprefixer = require('autoprefixer');
let cssnano = require('cssnano');
let uglify = require('gulp-uglify')

let tsbwify = browserify({
    basedir: '.',
    entries: ['ts/index.ts']
}).plugin(tsify)
let wtsbwify = watchify(tsbwify)
wtsbwify.on('update', build_typescript(false))
wtsbwify.on('log', gutil.log)

function build_typescript(watch) {
    return function () {
        if (watch) {
            obj = wtsbwify
        } else {
            obj = tsbwify
        }
        return obj.bundle().pipe(source('index.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('js'))
    }
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

gulp.task('typescript', build_typescript(false))
gulp.task('watch_typescript', build_typescript(true))


gulp.task('build', ['sass', 'typescript'])
gulp.task('watch', ['watch_sass', 'watch_typescript'])
gulp.task('default', ['watch'])

gulp.task('minify', ['build'], function () {

})