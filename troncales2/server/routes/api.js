"use strict";

var Supernodo = require('../models/supernodo'),
    Enlace    = require('../models/enlace');

module.exports = function(app, urls) {

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
