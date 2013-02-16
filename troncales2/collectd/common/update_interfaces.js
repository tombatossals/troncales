#!/usr/bin/env node

var getips = require("./mikrotik").getips,
    logger = require("./log"),
    mongoose = require('mongoose'),
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

Supernodo.count( { system : "mikrotik" }, function(err, count) {
    if (count == 0) {
            mongoose.connection.close();
    } else {
             
        Supernodo.find({ system : "mikrotik" }, function(err, supernodos) {
            if (err) { throw err };

            var count = supernodos.length;

            function end() {
                count--;
                if (count === 0) {
                    mongoose.connection.close();
                    process.exit(0);
                }
            }

            supernodos.forEach(function(supernodo) {
                if (supernodo.system === "mikrotik") {
                    logger.info("Updating interfaces of: " + supernodo.name);
                    var guest_password = supernodo.guest_password || "";
                    var guest_username = supernodo.guest_username || "guest";

                    getips(supernodo.mainip, guest_username, guest_password, function(resul) {
                        supernodo.interfaces = resul;
                        if (resul) {
                            supernodo.save(function() {
                                logger.info("Supernode interfaces updated: " + supernodo.name);
                                end();
                            });
                        } else {
                            end();
                        }
                    });
                } else {
                    logger.warn("Supernode interfaces not updated: " + supernodo.name);
                    end();
                }
          });
        });
    }
});
