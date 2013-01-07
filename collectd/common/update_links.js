#!/usr/bin/env node

var getips    = require("./mikrotik").getips,
    logger    = require("./log"),
    mongoose  = require('mongoose'),
    Netmask   = require('netmask').Netmask,
    Enlace    = require("../models/enlace").Enlace,
    util      = require("util");
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

Enlace.find().exec(function(err, enlaces) {
    if (err) { throw err };

    if (!enlaces) {
        mongoose.connection.close();
        return;
    }

    function end() {
        count--;
        if (count === 0) {
            mongoose.connection.close();
        }
    }

    var count = enlaces.length;
    enlaces.forEach(function(enlace) {
        var s1 = enlace.supernodos[0];
        var s2 = enlace.supernodos[1];

	Supernodo.find({ _id: { $in: [ s1.toString(), s2.toString() ] } }, function(err, supernodos) {
            if (supernodos.length !== 2) { end(); return; };
            var s1 = supernodos[0];
            var s2 = supernodos[1];
	    if (s1.system === "mikrotik" && s2.system === "mikrotik") {
                for (var i=0; i<s1.interfaces.length; i++) {
                    var interface = s1.interfaces[i];
                    if (interface.address.search("172.16") === 0) {
                        var network = new Netmask(interface.address);
                        for (var j=0; j<s2.interfaces.length; j++) {
                            var interface2 = s2.interfaces[j];
                            if (interface2.address.search("172.16") === 0) {
                                var address = interface2.address.split("/")[0];
                                if (network.contains(address)) {
                                    enlace.s1_interface = interface.name;
                                    enlace.s2_interface = interface2.name;
                                    enlace.network = network.base + "/" + network.bitmask;
				    enlace.active = true;
                                    enlace.save(function() {
                			logger.info(util.format("Supernode interfaces updated: %s-%s", s1.name, s2.name));
					end();
				    });
                                }
                            }
                        }
                    }
                }
	    } else {
      		logger.warn(util.format("Link not updated: %s-%s", s1.name, s2.name));
                end();
            }
        });
    });
});
