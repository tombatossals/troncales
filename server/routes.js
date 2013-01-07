var passport = require('passport'),
    mongoose = require('mongoose'),
    exec = require('child_process').exec,
    Supernodo = require('./models/supernodo'),
    S = require("string"),
    exec = require('child_process').exec,
    _und = require("underscore"),
    Enlace = require('./models/enlace'),
    Camino = require('./models/camino');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/google');
}

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('gps', {
            user: req.user
        });
    });

    app.get('/admin', ensureAuthenticated, function(req, res) {
        res.render('gps', {
            user: req.user
        })
    });

    app.get('/api', function(req, res) {
        res.send('gps API is running');
    });

    app.get('/api/getsupernode', function(req, res) {
        getSupernodo(req, function(output) {
            res.send(output);
        });
    });

    function getSupernodo(req, callback) {
        var ip_address;

        try {
            ip_address = req.headers['x-forwarded-for'];
        } catch (error) {
            ip_address = req.connection.remoteAddress;
        }

        var child = exec('ipcalc ' + ip_address + '/27 -n | grep HostMin | sed -e s/"  *"/" "/g | cut -f2 -d" "', function(error, stdout, stderr) {
            var supernode_ip = S(stdout).trim().s;
            Supernodo.findOne({
                'ip': supernode_ip
            }, function(err, supernodo) {
                if (supernodo) {
                    callback(supernodo.id);
                } else {
                    return callback(null);
                }
            });
        });
    }

    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/'
    }), function(req, res) {
        res.redirect('/');
    });

    app.get('/auth/google/return', passport.authenticate('google', {
        failureRedirect: '/'
    }), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/api/getroute/:origin/:final', function(req, res) {
        var o = mongoose.Types.ObjectId(req.params.origin);
        var f = mongoose.Types.ObjectId(req.params.final);

        Supernodo.findOne({
            "_id": o
        }, function(err, origen) {
            Supernodo.findOne({
                "_id": f
            }, function(err, destino) {
                if (err) {
                    res.send(500);
                    return;
                }
                var child = exec("/home/dave/troncales/scripts/traceroute.sh " + origen.get("mainip") + " " + destino.get("mainip"), function(error, stdout, stderr) {
                    if (error) {
                        res.send(500);
                        return;
                    } else {
                        var c = new Camino();
                        c.supernodos = [origen, destino];
                        var ips = S(stdout).trim().toString().split("\n");
                        console.log(ips);
                        ips.splice(0, 0, origen.get("mainip"));

                        var eips = [];
                        for (var i = 0; i < ips.length - 1; i++) {
                            eips.push([ips[i], ips[i + 1]]);
                        }
                        var enlaces = [];

                        var count = eips.length;
                        _und.each(eips, function(eip) {
                            console.log(eip + "\n");
                            Supernodo.find({
                                "ips": {
                                    "$in": eip
                                }
                            }, function(err, supernodos) {
                                if (supernodos.length < 2) {
                                    console.log(supernodos, eip);
                                    count = count - 1;
                                } else {
                                    var s = [supernodos[0].id, supernodos[1].id];
                                    Enlace.findOne({
                                        "supernodos": {
                                            "$all": s
                                        }
                                    }, function(err, enlace) {
                                        count = count - 1;
                                        enlaces.push(enlace);
                                        if (count == 0) {
                                            c.enlaces = enlaces;
                                            res.send(enlaces);
                                        }
                                    });
                                }
                            });
                        });

                    }
                });
            });
        });
    });

    app.get('/api/enlaces', function(req, res) {

        return Enlace.find(function(err, enlaces) {
            if (!err) {
                return res.send(enlaces);
            } else {
                return console.log(err);
            }
        });

    });

    // POST to CREATE
    app.post('/api/enlaces', function(req, res) {
        var enlace = new Enlace({
            supernodos: req.body.supernodos
        });

        if (req.body.supernodos[0] == req.body.supernodos[1]) {
            res.send(500);
            return;
        }

        enlace.save(function(err) {
            if (!err) {
                return console.log("created");
            } else {
                return console.log(err);
            }
        });
        return res.send(enlace);
    });

    // POST to CREATE
    app.post('/api/supernodos', function(req, res) {
        var supernodo = new Supernodo({
            name: req.body.name,
            email: req.body.email,
            ip: req.body.ip,
            latlng: req.body.latlng,
            validated: false
        });
        supernodo.save(function(err) {
            if (!err) {
                return console.log("created");
            } else {
                return console.log(err);
            }
        });
        return res.send(supernodo);
    });

    app.delete('/api/supernodos/:id', function(req, res) {
        return Supernodo.findById(req.params.id, function(err, supernodo) {
            return supernodo.remove(function(err) {
                if (!err) {
                    console.log("removed");
                    return res.send('');
                } else {
                    console.log(err);
                }
            });
        });
    });

    app.delete('/api/enlaces/:id', function(req, res) {
        return Enlace.findById(req.params.id, function(err, enlace) {
            return enlace.remove(function(err) {
                if (!err) {
                    console.log("removed");
                    return res.send('');
                } else {
                    console.log(err);
                }
            });
        });
    });

    app.get('/api/supernodos', function(req, res) {

        return Supernodo.find({
            validated: true
        }, function(err, supernodos) {
            if (!err) {
                return res.send(supernodos);
            } else {
                return console.log(err);
            }
        });
    });

    // Single update
    app.put('/api/enlaces/:id', function(req, res) {
        return Enlace.findById(req.params.id, function(err, enlace) {
            enlace.distance = req.body.distance;
            enlace.saturation = req.body.saturation;
            enlace.bandwidth = req.body.bandwidth;
            enlace.rrdtool_bandwidth_graph_id = req.body.rrdtool_bandwidth_graph_id;
            enlace.rrdtool_traffic_graph_id = req.body.rrdtool_traffic_graph_id;
            enlace.rrdtool_bandwidth_id = req.body.rrdtool_bandwidth_id;
            enlace.rrdtool_traffic_id = req.body.rrdtool_traffic_id;
            return enlace.save(function(err) {
                if (!err) {
                    console.log("updated");
                } else {
                    console.log(err);
                }
                return res.send(enlace);
            });
        });
    });

}
