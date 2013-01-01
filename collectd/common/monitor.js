#!/usr/bin/env node

var logger = require("./log"),
    mongoose = require('mongoose');
    

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);


var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SupernodoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    mainip: {
        type: String
    },
    system: {
        type: String
    },
    interfaces: [ {
	name: String,
	address: String
    }],
    ips: [ String ],
    validated: {
        type: Boolean
    },
    latlng: {
        lat: Number,
        lng: Number
    }
});

var Supernodo = mongoose.model('supernodos', SupernodoSchema);

Supernodo.find(function(err, supernodos) {
    if (err) { throw err };
    var count = supernodos.length;
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

      function end() {
	  count--;
          if (count === 0) {
              mongoose.connection.close();
          }
      }
    });
});
