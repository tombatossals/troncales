#!/usr/bin/env node

var getips    = require("./mikrotik").getips,
    logger    = require("./log"),
    mongoose  = require('mongoose'),
    Netmask   = require('netmask').Netmask,
    Enlace    = require("../models/enlace").Enlace,
    util      = require("util");
    sshConn   = require("ssh2");
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

function get_testing_ip(enlace, supernodo) {
    if (enlace.supernodos[1] == supernodo.id) {
    	var iface_name = enlace.s2_interface;
    } else {
    	var iface_name = enlace.s1_interface;
    }

    var network = new Netmask(enlace.network);
    var interfaces = supernodo.interfaces;
    for (var i=0; i<interfaces.length; i++) {
        var interface = interfaces[i];
        var ip = interface.address.split("/")[0];
        if (interface.name === iface_name && network.contains(ip)) {
            return ip;
        } 
    }
}

function bandwidth_test(ip, testip) {
    var c = new sshConn();
    c.on("ready", function() {
        c.exec("/ip address print", function(err, stream) {
            if (err) throw err;
            stream.on("data", function(data, extended) {
                 console.log(data.toString());
            });
        });
    });
    c.connect({
        host: ip, 
        port: 22,
        username: "guest",
        password: "-"
    });  
}

function monitor_link(enlace) {
    var s1 = enlace.supernodos[0];
    var s2 = enlace.supernodos[1];

    Supernodo.find({ _id: { $in: [ s1.toString(), s2.toString() ] } }, function(err, supernodos) {
        if (supernodos.length !== 2) { end(); return; };
        var s1 = supernodos[0];
        var s2 = supernodos[1];
        if (s1.system === "mikrotik" && s2.system === "mikrotik") {
            var origin = s1.mainip;
            var destiny = get_testing_ip(enlace, s2);
            logger.info(util.format("Connecting from %s to %s", origin, destiny));
            bandwidth_test(origin, destiny);
        }
    });
}

function monitor(enlaces) {
    enlaces.forEach(function(enlace) {
        monitor_link(enlace);
    });
    setTimeout(monitor, 12000, enlaces);
}

Enlace.find({ active: true }).exec(function(err, enlaces) {
    if (err) { throw err };

    if (!enlaces) {
        mongoose.connection.close();
        return;
    }

    monitor(enlaces);
});
