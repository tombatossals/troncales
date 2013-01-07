#!/usr/bin/env node

var getips = require("./mikrotik").getips,
    logger = require("./log"),
    mongoose = require('mongoose'),
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

Supernodo.find(function(err, supernodos) {
    if (err) { throw err };

    var count = supernodos.length;
    function end() {
        count--;
        if (count === 0) {
            mongoose.connection.close();
        }
    }

    supernodos.forEach(function(supernodo) {
      if (supernodo.system === "mikrotik") {
          var password = supernodo.password || "";
          getips(supernodo.mainip, "guest", password, function(resul) {
              supernodo.interfaces = resul;
              supernodo.username = "guest";
              supernodo.password = "";
              supernodo.save(function() {
                logger.info("Supernode interfaces updated: " + supernodo.name);
                end();
              });
          });
      } else {
        logger.warn("Supernode interfaces not updated: " + supernodo.name);
        end();
      }

    });
});
