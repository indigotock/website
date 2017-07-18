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
let path = require('path')
let cssnano = require('cssnano');
let uglify = require('gulp-uglify')

let options = {
    default: ['build', 'dist'],
    build: {
        tasks: ['compile:sass', 'compile:ts'],
        dist: './dist',
        source: './src'
    },
    copy: {
        source: './copy/**/*'
    },
    sass: {
        source: './src/sass/**/*.scss',
        destination: './src/css',
        bundleName: 'style.css'
    },
    ts: {
        sources: ['./src/ts/index.ts'],
        destination: './src/js',
        bundleName: 'index.js'
    }
}
gulp.task('default', options.default)


gulp.task('build', function () {
    options.build.tasks.forEach(t => {
        gulp.start(t);
    })
})
gulp.task('compile:sass', function () {
    gulp.src(options.sass.source)
        .pipe(sass().on('error', gutil.log))
        .pipe(concat(options.sass.bundleName))
        .pipe(gulp.dest(options.sass.destination));
});
gulp.task('compile:ts', function () {
    browserify({
            basedir: '.',
            entries: options.ts.sources
        }).plugin(tsify)
        .bundle().pipe(source(options.ts.bundleName))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(options.ts.destination))
})

// Dist


gulp.task('dist', ['dist:sass', 'dist:copy', 'dist:ts'], function () {
    gulp.src(options.build.dist + '/**/*')
        .pipe(gulp.dest(path.join('..', 'server', 'public')))
})
gulp.task('dist:copy', function () {
    gulp.src(options.copy.source)
        .pipe(gulp.dest(path.join(options.build.dist)))
})
gulp.task('dist:sass', ['compile:sass'], function () {
    gulp.src(path.join(options.sass.destination, options.sass.bundleName))
        .pipe(postcss([autoprefixer(), cssnano()], {}))
        .pipe(gulp.dest(path.join(options.build.dist, 'css')))
})
gulp.task('dist:ts', ['compile:ts'], function () {
    gulp.src(path.join(options.ts.destination, options.ts.bundleName))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(options.build.dist, 'js')))
})

gulp.task('watch', function () {
    gulp.start('watch:sass')
    gulp.start('watch:ts')
})
gulp.task('watch:sass', function () {
    gulp.watch(options.sass.source, ['compile:sass'])
})

let tsb = watchify(browserify({
    basedir: '.',
    entries: options.ts.sources,
}).plugin(tsify));
tsb.on("update", tswbundle);
tsb.on("log", gutil.log);

function tswbundle() {
    return tsb.bundle()
        .pipe(source(options.ts.bundleName))
        .pipe(gulp.dest(options.ts.destination))
}
gulp.task('watch:ts', function () {
    tswbundle()
})