var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sassMiddleware = require('node-sass-middleware');
var postcssMiddleware = require('postcss-middleware');
var autoprefixer = require('autoprefixer');
// var compression = require('compression');

var dateFormat = require('dateformat')
var hbs = require('hbs')

var restart = require('./routes/restart');
var posts = require('./routes/posts');
var index = require('./routes/index');
var cms = require('./cms')

var app = express();


// app.use(compression())
app.use(function (req, res, next) {
  res.locals.techs = cms.site_techs
  next()
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

app.use('/stylesheets', sassMiddleware({
  /* Options */
  src: path.join(__dirname, 'stylesheets'),
  dest: path.join(__dirname, 'public', 'stylesheets'),
  outputStyle: 'compressed',
}));
app.use('/stylesheets', postcssMiddleware({
  plugins: [
    autoprefixer()
  ],
  src: function (req) {
    return path.join(__dirname, 'public', 'stylesheets', req.url);
  }
}));
app.use(express.static(path.join(__dirname, '/public')));

hbs.handlebars.registerHelper('datetime', function (dt, f) {
  return dateFormat(new Date(dt), f)
})


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/restart', restart);
app.use('/posts', posts);
app.use('/', index);

app.use('/api', require('./api'))


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