#!/usr/bin/env node

var getips_mikrotik = require("./mikrotik").getips,
    getips_openwrt = require("./openwrt").getips,
    logger = require("./log"),
    mongoose = require('mongoose'),
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

Supernodo.count(function(err, count) {
    if (count == 0) {
            mongoose.connection.close();
    } else {
             
        Supernodo.find(function(err, supernodos) {
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
                var getips = undefined; 
                if (supernodo.system === "mikrotik") {
                    getips = getips_mikrotik;
                } else { 
                    getips = getips_openwrt;
                }

                var password = supernodo.password;
                var username = supernodo.username;

                getips(supernodo.mainip, username, password, function(resul) {
                    if (resul) {
                        supernodo.interfaces = resul;
                        supernodo.save(function() {
                            logger.info("Supernode interfaces updated: " + supernodo.name);
                            end();
                        });
                    } else {
                        end();
                    }
                });
          });
        });
    }
});
