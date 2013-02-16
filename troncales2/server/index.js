/*jshint es5:true */ 
"use strict";

var express = require('express'),
    settings = require('./config/settings'),
    mongoose = require('mongoose'),
    urls_constructor = require('./common/urls_constructor'),
    generate_mongo_url = require('./common/generate_mongo_url'),
    passport = require('passport'),
    google_auth = require('./common/google_auth'),
    relative_urls = require('./config/urls');

var SessionMongoose = require('session-mongoose')(express),
    app = express();

var urls = urls_constructor(settings.base_url, relative_urls);

google_auth.configure(urls.authcallback, urls.login);


if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = settings.mongo;
}

var conn = generate_mongo_url(mongo);
var db = mongoose.connect(conn);

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'eldorado' }));
  app.use(express.session({
      store: new SessionMongoose({
          url: conn
      }),
      secret: 'piecake'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.locals({ urls: urls });
  app.use(app.router);
  app.use(express.static(__dirname + '/../app'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

require('./routes')(app, urls);
app.listen(settings.server_port);

module.exports = app;
