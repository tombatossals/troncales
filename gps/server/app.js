#!/usr/bin/env node

var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    util = require("util"),
    S = require("string"),
    exec = require('child_process').exec,
    mongoose = require('mongoose');

var app = express.createServer();

// Database

mongoose.connect('mongodb://localhost/trunks');

// Config

//app.configure('production', function() {
//      app.use(express.logger());
//      app.use(express.errorHandler()); 
//});

app.configure('development', function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.logger());
  app.use(express.static(path.join(application_root, "../static")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/api', function (req, res) {
  res.send('gps API is running');
});

app.get('/api/getsupernode', function (req, res) {
    getSupernodo(req, function(output) {
        res.send(output);
    });
});

function getSupernodo(req, callback) {
    var ip_address;

    try {
        ip_address = req.headers['x-forwarded-for'];
    }
    catch ( error ) {
        ip_address = req.connection.remoteAddress;
    }

    var child = exec('ipcalc ' + ip_address + '/27 -n | grep HostMin | sed -e s/"  *"/" "/g | cut -f2 -d" "', function(error, stdout, stderr) {
        var supernode_ip = S(stdout).trim().s;
        console.log(ip_address, supernode_ip);
        SupernodeModel.findOne({ 'ip': supernode_ip }, function(err, supernodo) {
            if (supernodo) {
                callback(supernodo.id);
            } else {
                return callback(null);
            }
        });
    });
}

// Launch server

app.listen(2424);

var Schema = mongoose.Schema;  

var Enlace = new Schema({  
        id: { type: String, required: true },  
        distance: { type: String, required: true },  
        saturation: { type: String, required: true },
        bandwidth: { type: String, required: true },
        supernodos: [ { type: String } ]
});

var EnlaceModel = mongoose.model('enlaces', Enlace);  

var Supernode = new Schema({  
        id: { type: String, required: true },  
        name: { type: String, required: true },  
        email: { type: String },
        ip: { type: String },
        latlng: { lat: Number, lng: Number }
});

var SupernodeModel = mongoose.model('supernodos', Supernode);  

app.get('/api/getroute/:origin/:final', function (req, res) {
 return EnlaceModel.find( { supernodos: req.params.origin }, function (err, enlaces) {
    if (!err) {
      return res.send(enlaces);
    } else {
      return console.log(err);
    }
  });
});

app.get('/api/supernodos', function (req, res){

 return SupernodeModel.find(function (err, supernodos) {
    if (!err) {
      return res.send(supernodos);
    } else {
      return console.log(err);
    }
  });

});
