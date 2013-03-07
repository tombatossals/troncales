"use strict";

var Supernodo = require('../models/supernodo'),
    Enlace    = require('../models/enlace'),
    User      = require('../models/user'),
    mikrotik_traceroute = require('../common/mikrotik').traceroute,
    openwrt_traceroute = require('../common/openwrt').traceroute,
    ensureAuthenticated = require('../common/google_auth').ensureAuthenticated;

module.exports = function(app, urls) {

    app.get(urls.api.supernodoSearch, function(req, res) {
        var q = req.query.q;
        var query= {};
        if (q) {
            query = { name: new RegExp("^" + q, "i") };
        }
        Supernodo.find(query, function(err, supernodos) {
            if (err) {
                throw err;
            } else {
                var names = new Array();
                for (var i in supernodos) {
                    names.push({ id: supernodos[i].name, text: supernodos[i].name });
                }
                return res.json(names);
            }
        });
    });

    app.post(urls.api.supernodo, ensureAuthenticated, function(req, res) {
        var lat = req.body.latitude;
        var lng = req.body.longitude;
        var supernodo = new Supernodo();
        supernodo.latlng.lat = lat;
        supernodo.latlng.lng = lng;
        supernodo.name = "newsupernodo";
        supernodo.save(function(err) {
            if (err) {
                throw err;
            } else {
                res.send(200);
            }
        });
    });

    app.post(urls.api.enlace, ensureAuthenticated, function(req, res) {
        var s1 = req.body.s1;
        var s2 = req.body.s2;

        Supernodo.find({ name: { "$in" : [ s1, s2] } }, function(err, supernodos) {
            var s1 = supernodos[0];
            var s2 = supernodos[1];
            var enlace = new Enlace();
            enlace.supernodos = [ { id: s1._id.toString() }, { id: s2._id.toString() } ];
            enlace.save();
            res.send(200);
        });
    });

    app.get(urls.api.supernodoByName, function(req, res) {
        var name = req.params.name;
        var query = new Object();
	query["name"] = name;

        Supernodo.findOne(query, function(err, supernodo) {
            if (err) {
                throw err;
            } else {
                delete supernodo["username"];
                delete supernodo["password"];
                var s = new Object();
                var fields = [ "_id", "mainip", "name", "system", "latlng" ];
                for (var i in fields) {
                    var f = fields[i];
                    s[f] = supernodo[f];
                }
                return res.json(s);
            }
        });
    });

    app.put(urls.api.supernodoById, ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        var name = req.body.name;
        var mainip = req.body.mainip;

        Supernodo.findOne({ _id: id }, function(err, supernodo) {
            if (err) {
                throw err;
            } else {
                supernodo.name = name;
                supernodo.mainip = mainip;
                supernodo.save(function(err) {
                    if (err) {
                        throw err;
                    } else {
                        return res.send(200);
                    }
                });
            }
        });
    });

    app.delete(urls.api.supernodoById, ensureAuthenticated, function(req, res) {
        var id = req.params.id;

        Supernodo.findOne({ _id: id }, function(err, supernodo) {
            if (err) {
                throw err;
            } else {
                supernodo.remove();
                return res.send(200);
            }
        });
    });

    app.get(urls.api.supernodo, function(req, res) {
        var query = new Object();
	//query["geometry"] = { $exists: true };

        Supernodo.find(query, function(err, supernodos) {
            if (err) {
                throw err;
            }
            return res.json(supernodos);
        });
    });

    app.put(urls.api.user, ensureAuthenticated, function(req, res) {
        var phone = req.body.phone;

        var query = new Object();
        query["email"] = req.user.email;

        User.findOne(query, function(err, user) {
            if (err) throw err;
            user.phone = phone;
            user.save(function() {
                return res.json(user);
            });
        });
    });

    app.get(urls.api.user, ensureAuthenticated, function(req, res) {
        var query = new Object();
        query["email"] = req.user.email;

        User.findOne(query, function(err, user) {
            if (err) throw err;
            return res.json(user);
        });
    });

    app.get(urls.api.neighbours, function(req, res) {
        var id = req.params.id;
        Enlace.find({ "supernodos.id": { $in: [ id ] } }, function(err, enlaces ) {
            if (err) { 
                throw err;
            } else {
                var neighbours = Array();
                for (var i in enlaces) {
                    var enlace = enlaces[i];
                    var supernodos = enlace["supernodos"];
                    if (supernodos[0].id == id) {
                        neighbours.push(supernodos[1].id);
                    } else {
                        neighbours.push(supernodos[0].id);
                    }
                } 
                Supernodo.find( { _id: { $in: neighbours } }, function( err, supernodos) { 
                    res.send({ supernodos: supernodos });
                });
            }
        });
    });

    function findByIp(ip, supernodos) {
        var supernodo = null;
        for (var i=0; i<supernodos.length; i++) {
            var s = supernodos[i];
            for (var j=0; j<s.interfaces.length; j++) {
                var iface = s.interfaces[j];
                var ifaceip= iface.address.split("/")[0];
                if (ip === ifaceip) {
                    var supernodo = s;
                    break;
                }
            }
            if (supernodo) break;
        }
        if (!supernodo) { console.log(ip) }
        return supernodo;
    }

    app.get(urls.api.path, function(req, res) {
        var s1 = req.params.s1;
        var s2 = req.params.s2;
        Supernodo.find({ name: { $in: [ s1, s2 ] } }, function(err, supernodos) {

            if (!supernodos || supernodos.length != 2) {
                throw new Error("Link not found");
            } else {
                var s1 = supernodos[0];
                var s2 = supernodos[1];
                var traceroute = undefined;
                if (s1.system == "mikrotik") {
                    traceroute = mikrotik_traceroute;
                } else {
                    traceroute = openwrt_traceroute;
                }
                
                traceroute(s1.mainip, s1.username, s1.password, s2.mainip, function(path) {
                    console.log(path);
                    var count = path.count;
                    var eips = [];
                    eips.push([ s1.mainip, path[0] ]);
                    for (var i = 0; i < path.length - 1; i++) {
                        eips.push([path[i], path[i + 1]]);
                    }
                    var enlaces = [];
                    var count = eips.length;

                    Supernodo.find(function(err, supernodos) {
                        eips.forEach(function(ippair) {
                            var p1 = findByIp(ippair[0], supernodos);
                            var p2 = findByIp(ippair[1], supernodos);
                            if (p1 === null || p2 === null) {
                                res.send(404);
                            } else {
                                var s = [p1.id, p2.id];
                                Enlace.findOne({
                                    "supernodos.id": {
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
                });
            }
        });
    });

    app.get(urls.api.enlaceBySupernodos, function(req, res) {
        var s1 = req.params.s1;
        var s2 = req.params.s2;
        Supernodo.find({ name: { $in: [ s1, s2 ] } }, function(err, supernodos) {

            if (!supernodos || supernodos.length != 2) {
                throw new Error("Link not found");
            } else {
                var s1 = supernodos[0];
                var s2 = supernodos[1];
                Enlace.findOne({ "supernodos.id": { $all: [ s1.id, s2.id ] } }, function(err, enlace) {
                    res.send({ enlace: enlace, s1: s1, s2: s2 });
                });
            }
        });
    });

    app.put(urls.api.enlaceById, ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        var distance = req.body.distance;

        Enlace.findOne({ _id: id }, function(err, enlace) {
            enlace.distance = distance;
            enlace.save(function(err) {
                if (err) {
                    throw err;
                } else {
                    res.send(200);
                }
            });
        });
    });

    app.delete(urls.api.enlaceById, ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        Enlace.findOne({ _id: id }, function(err, enlace) {
            enlace.remove();
            res.send(200);
        });
    });

    app.get(urls.api.enlace, function(req, res) {
        var query = new Object();
	query["active"] = true;
	//query["geometry"] = { $exists: true };

        Enlace.find(query, function(err, enlaces) {
            if (err) {
                throw err;
            }

            return res.json(enlaces);
        });
    });
};
