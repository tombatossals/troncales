#!/usr/bin/env node

var logger    = require("./log"),
    mongoose  = require('mongoose'),
    Netmask   = require('netmask').Netmask,
    Enlace    = require("../models/enlace").Enlace,
    util      = require("util");
    ObjectId  = mongoose.Schema.Types.ObjectId;
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

//process.on('uncaughtException', function(err) {  
//    mongoose.connection.close();  
//    process.exit(-1);  
//});  

Enlace.find(function(err, enlaces) {

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
        var s1 = enlace.supernodos[0].id;
        var s2 = enlace.supernodos[1].id;

	Supernodo.find({ _id: { $in: [ s1, s2 ] } }, function(err, supernodos) {
            if (supernodos.length !== 2) { end(); return; };
            var s1 = supernodos[0];
            var s2 = supernodos[1];
            var found = false;
            for (var i=0; i<s1.interfaces.length; i++) {
                var iface = s1.interfaces[i];
                if (iface.address.search("172.16") === 0) {
                    var network = new Netmask(iface.address);
                    for (var j=0; j<s2.interfaces.length; j++) {
                        var iface2 = s2.interfaces[j];
                        if (iface2.address.search("172.16") === 0) {
                            var address = iface2.address.split("/")[0];
                            if (network.contains(address)) {
                                found = true;
                                if (enlace.supernodos[0].id == s1._id.toString()) {
                                    enlace.supernodos[0].iface = iface.name;
                                    enlace.supernodos[1].iface = iface2.name;
                                } else {
                                    enlace.supernodos[1].iface = iface.name;
                                    enlace.supernodos[0].iface = iface2.name;
                                }
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

            if (!found) {
              logger.error(util.format("Link not found: %s-%s %s", s1.name, s2.name, enlace._id));
              end();
            }
        });
    });
});
