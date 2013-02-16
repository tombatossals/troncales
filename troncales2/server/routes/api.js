"use strict";

var Supernodo = require('../models/supernodo'),
    Enlace    = require('../models/enlace'),
    User      = require('../models/user'),
    ensureAuthenticated = require('../common/google_auth').ensureAuthenticated;

module.exports = function(app, urls) {

    app.get(urls.api.supernodo, function(req, res) {
        var supernodo = req.params.supernodo;
        var query = new Object();
	query["name"] = supernodo;

        Supernodo.findOne(query, function(err, supernodo) {
            if (err) {
                throw err;
            } else {
                return res.json(supernodo);
            }
        });
    });

    app.delete(urls.api.supernodo, ensureAuthenticated, function(req, res) {
        var supernodo = req.params.id;
        var query = new Object();
	query["id"] = supernodo;

        Supernodo.findOne(query, function(err, supernodo) {
            if (err) {
                throw err;
            } else {
                //supernodo.remove();
                return res.send(200);
            }
        });
    });

    app.get(urls.api.supernodos, function(req, res) {
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
        console.log(id);
        Enlace.find({ supernodos: { $in: [ id ] } }, function(err, enlaces ) {
            if (err) { 
                throw err;
            } else {
                var neighbours = Array();
                for (var i in enlaces) {
                    var enlace = enlaces[i];
                    var supernodos = enlace["supernodos"];
                    if (supernodos[0].toString() == id) {
                        neighbours.push(supernodos[1].toString());
                    } else {
                        neighbours.push(supernodos[0].toString());
                    }
                } 
                Supernodo.find( { _id: { $in: neighbours } }, function( err, supernodos) { 
                    res.send({ supernodos: supernodos });
                });
            }
        });
    });

    app.get(urls.api.enlace, function(req, res) {
        var s1 = req.params.s1;
        var s2 = req.params.s2;
        Supernodo.find({ name: { $in: [ s1, s2 ] } }, function(err, supernodos) {

            if (!supernodos || supernodos.length != 2) {
                throw new Error("Link not found");
            } else {
                var s1 = supernodos[0];
                var s2 = supernodos[1];
                Enlace.findOne({ supernodos: { $all: [ s1.id, s2.id ] } }, function(err, enlace) {
                    res.send({ enlace: enlace, s1: s1, s2: s2 });
                });
            }
        });
    });

    app.delete(urls.api.delEnlace, ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        Enlace.findOne({ id: id }, function(err, enlace) {
            //enlace.remove();
            res.send(200);
        });
    });

    app.get(urls.api.enlaces, function(req, res) {
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
