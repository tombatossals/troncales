#!/usr/bin/env node

var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    util = require("util"),
    S = require("string"),
    exec = require('child_process').exec,
    _und = require("underscore"),
    mongoose = require('mongoose');

var app = express.createServer();

// Database

mongoose.connect('mongodb://localhost/troncales');

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
        Supernodo.findOne({ 'ip': supernode_ip }, function(err, supernodo) {
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

var  Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var EnlaceSchema = new Schema({  
        distance: { type: String },  
        saturation: { type: String },
        bandwidth: { type: String },
        supernodos: [ { type: ObjectId } ],
        rrdtool_bandwidth_graph_id: { type: String },
        rrdtool_traffic_graph_id: { type: String },
        rrdtool_bandwidth_id: { type: String },
        rrdtool_traffic_id: { type: String }
});

var Enlace = mongoose.model('enlaces', EnlaceSchema);  

var SupernodoSchema = new Schema({  
        name: { type: String, required: true },  
        email: { type: String },
        ip: { type: String },
        validated: { type: Boolean },
        latlng: { lat: Number, lng: Number }
});

var Supernodo = mongoose.model('supernodos', SupernodoSchema);  

var CaminoSchema = new Schema({
    supernodos: [ { type: ObjectId, ref: "supernodos" } ],
    enlaces: [ { type: ObjectId, ref: "enlaces" } ]
});

var Camino = mongoose.model('caminos', CaminoSchema);  

app.get('/api/getroute/:origin/:final', function (req, res) {
 var o = mongoose.Types.ObjectId(req.params.origin);
 var f = mongoose.Types.ObjectId(req.params.final);

 Supernodo.findOne({ "_id": o }, function(err, origen) {
    Supernodo.findOne({ "_id": f }, function(err, destino) {
        var child = exec("/home/dave/troncales/gps/scripts/traceroute.sh " + origen.get("mainip") + " " + destino.get("mainip"), function(error, stdout, stderr) {
            if (error) {
                res.send(500);
            } else {
                var c = new Camino();
                c.supernodos = [ origen, destino ];
                var ips = S(stdout).trim().toString().split("\n");
                ips.splice(0, 0, origen.get("mainip"));

                var eips = [];
                for (var i=0; i< ips.length -1 ; i++) {
                    eips.push( [ ips[i], ips[i+1] ] );
                }
                var enlaces = [];

                var count = eips.length;
                _und.each(eips, function(eip) {
                    console.log(eip);
                    Supernodo.find( { "ips": { "$in": eip } }, function(err, supernodos) {
                        console.log(supernodos[0]);
                        var s = [ supernodos[0].id, supernodos[1].id ];
                        Enlace.findOne( { "supernodos": { "$all": s } }, function(err, enlace) {
                            count = count -1;
                            enlaces.push(enlace);
                            if (count == 0) {
                                c.enlaces = enlaces;
                                res.send(enlaces);
                            }
                        });
                    });
                });

            }
        });
    });
 });
});

app.get('/api/enlaces', function (req, res){

 return Enlace.find(function (err, enlaces) {
    if (!err) {
      return res.send(enlaces);
    } else {
      return console.log(err);
    }
  });

});

// POST to CREATE
app.post('/api/enlaces', function (req, res) {
    var enlace = new Enlace({
        supernodos: req.body.supernodos
    });
    console.log(enlace);
    enlace.save(function (err) {
        if (!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    return res.send(enlace);
});

// POST to CREATE
app.post('/api/supernodos', function (req, res) {
    var supernodo = new Supernodo({
        name: req.body.name,
        email: req.body.email,
        ip: req.body.ip,
        latlng: req.body.latlng,
        validated: false
    });
    supernodo.save(function (err) {
        if (!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    return res.send(supernodo);
});

app.delete('/api/supernodos/:id', function (req, res){
  return Supernodo.findById(req.params.id, function (err, supernodo) {
    return supernodo.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

app.delete('/api/enlaces/:id', function (req, res){
  return Enlace.findById(req.params.id, function (err, enlace) {
    return enlace.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

app.get('/api/supernodos', function (req, res){

    return Supernodo.find({ validated: true }, function (err, supernodos) {
        if (!err) {
            return res.send(supernodos);
        } else {
            return console.log(err);
        }
    });

});

// Single update
app.put('/api/enlaces/:id', function (req, res) {
  return Enlace.findById(req.params.id, function (err, enlace) {
    enlace.distance = req.body.distance;
    enlace.saturation = req.body.saturation;
    enlace.bandwidth = req.body.bandwidth;
    enlace.rrdtool_bandwidth_graph_id = req.body.rrdtool_bandwidth_graph_id;
    enlace.rrdtool_traffic_graph_id = req.body.rrdtool_traffic_graph_id;
    enlace.rrdtool_bandwidth_id = req.body.rrdtool_bandwidth_id;
    enlace.rrdtool_traffic_id = req.body.rrdtool_traffic_id;
    return enlace.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(enlace);
    });
  });
});
