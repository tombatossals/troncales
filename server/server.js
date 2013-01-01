var express = require('express')
  , routes = require('./routes')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , auth = require('./auth')
  , mongoStore = require('connect-mongodb');

var app = module.exports = express();
global.app = app;

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/../static'));
  app.use(express.session({
    cookie: {maxAge: 60000 * 20},
    store: new mongoStore( { url: conn } )
  , secret: 'applecake'
  }, function() {
    app.use(app.router);
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

require('./routes')(app);
app.listen(2424);
