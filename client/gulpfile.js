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


let options = {
    default: ['build', 'dist'],
    build: {
        tasks: ['compile:sass', 'compile:ts'],
        dist: './build',
        source: './src'
    },
    sass: {
        source: 'src/sass/*.sass',
        destination: 'src/css/style.css'
    },
    ts: {
        sources: ['src/ts/index.ts'],
        destination: 'src/js/index.js'
    },
    watch: {
        sass: {
            task: function () {

            }
        },
        ts: {
            task: function () {

            }
        }
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
        .pipe(concat('style.css'))
        .pipe(postcss([autoprefixer(), cssnano()], {}))
        .pipe(gulp.dest(options.sass.destination));
});

gulp.task('compile:ts', function () {
    browserify({
            basedir: '.',
            entries: options.ts.sources
        }).plugin(tsify)
        .bundle().pipe(source('index.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(options.ts.destination, 'js')))
})

gulp.task('dist', ['dist:sass', 'dist:ts'])

gulp.task('dist:sass', ['compile:sass'], function () {
    gulp.src(options.sass.destination)
        .pipe(gulp.dest(path.join(options.build.dist, 'css')))
})
gulp.task('dist:ts', ['compile:ts'], function () {
    gulp.src(options.ts.destination)
        .pipe(gulp.dest(path.join(options.build.dist, 'js')))
})