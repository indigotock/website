var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sassMiddleware = require('node-sass-middleware');
var postcssMiddleware = require('postcss-middleware');
var autoprefixer = require('autoprefixer');


var index = require('./routes/index');
var ideas = require('./routes/ideas');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

app.use(sassMiddleware({
  /* Options */
  src: __dirname,
  dest: __dirname + '/public',
  outputStyle: 'extended'
}));
app.use(postcssMiddleware({
  plugins: [
    autoprefixer({})
  ],
  src: function (req) {
    return path.join(__dirname + '/public', req.url);
  }
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'public', 'javascripts')));

app.use('/', index);
app.use('/ideas', ideas);

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
