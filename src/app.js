const PRODUCTION = process.env.NODE_ENV === 'production'
console.log('Original node_env:', process.env.NODE_ENV);
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var postcssMiddleware = require('postcss-middleware')
var sassMiddleware = require('node-sass-middleware')
var autoprefixer = require('autoprefixer');

var dateFormat = require('dateformat')
var hbs = require('hbs')

require('dotenv').config({
    path: path.join(__dirname, '.env')
})
var app = express();

require('./cms').initialise()
require('./db').initialise()

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'hbs');

if (!PRODUCTION)
    process.env.NODE_ENV = 'development'


app.use('/css', sassMiddleware({
    src: path.join(__dirname, 'sass'),
    watch: true,
    dest: path.join(__dirname, '..', 'public', 'css'),
    outputStyle: 'compressed',
}));
app.use('/css', postcssMiddleware({
    plugins: [
        autoprefixer()
    ],
    src: function (req) {
        return path.join(__dirname, '..', 'public', 'css', req.url);
    }
}));

app.use('/ts', function (req, res, next) {
    res.contentType('text/x-typescript')
    next()
});

console.log('Starting server in ' + process.env.NODE_ENV)
if (PRODUCTION || true) {
    app.use(express.static(path.join(__dirname, '..', 'public')));
} else {
    app.use(express.static(path.join(__dirname, '..', '..', 'client', 'src')));
    app.use(express.static(path.join(__dirname, '..', '..', 'client', 'copy')));
}


require('./hbsHelpers')(hbs)

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use('/', require('./routes/index'));
app.use('/posts', require('./routes/posts'));
app.use('/elemeno', require('./routes/elemenoWebhook'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.body = `<strong>Whoops.</strong> Not sure how you've managed to get a 404 on my website, but bravo! If you're looking for a post then the slug in the url may be incorrect, otherwise feel free to ask for help via <a href='mailto:kyle.hughes@outlook.com'>email.</a>`
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    if (req.app.get('env') === 'development') {

    } else {
        err.stack = null
    }
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;