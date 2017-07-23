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

const PRODUCTION = process.env.NODE_ENV === 'production'
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
app.use('/elemeno', require('./routes/elemenoWebhook'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;