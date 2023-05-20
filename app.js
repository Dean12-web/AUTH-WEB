var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var session = require('express-session')
var flash = require('connect-flash');
var MongoClient = require('mongodb').MongoClient;

const { Pool } = require('pg')

const pool = new Pool({
  user: 'Dean12',
  host: 'localhost',
  database: 'cobadb',
  password: '12345',
  port: 5432
});

// MongoDB connection string
const mongoURL = 'mongodb://localhost:27017/cobadb';
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    const db = client.db();

    // Set the database object on the app.locals
    app.locals.db = db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

var indexRouter = require('./routes/index')(pool);// immediately call 
var usersRouter = require('./routes/users')(pool);
var dataRouter = require('./routes/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'dean12-web',
  resave: false,
  saveUninitialized: true
}))

app.use(flash());
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
