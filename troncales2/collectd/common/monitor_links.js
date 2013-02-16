#!/usr/bin/env node

process.on('error', function(err) {
    logger.error("Error fatal");
    //mongoose.disconnect();
});

var logger    = require("./log"),
    mongoose  = require('mongoose'),
    time      = require('time'),
    Netmask   = require('netmask').Netmask,
    Enlace    = require("../models/enlace").Enlace,
    util      = require("util");
    sshConn   = require("ssh2");
    readline  = require("readline"),
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);
var INTERVAL = process.env.COLLECTD_INTERVAL;

if (!INTERVAL) {
	INTERVAL = 1200;
}

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

function bandwidth_test(enlace, s1, s2, cb) {
    var c = new sshConn();
    var ip = s1.mainip;
    var username = s1.guest_username;
    var password = s1.guest_password;
    var testip = get_testing_ip(enlace, s2);

    if (testip) {
        c.on("ready", function() {
            c.exec(util.format(":global ip; :set ip %s; /system script run bandwidth", testip), function(err, stream) {
                if (err) { 
                        logger.debug(util.format("Error on bandwidth from %s to %s.", ip, testip));
		        cb(enlace.id);
	        } else {
                    stream.on("data", function(data) {
                        var data = data.toString().trim();
                        if (data.search("tx:") != -1) {
                            var tx = 0, rx = 0;
                            tx = data.split(" ")[0].replace("tx:", "");
                            rx = data.split(" ")[1].replace("rx:", "");
                            console.log(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
                            logger.debug(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
                            cb(enlace.id);
                        }
                    });
                }
            });
        });

        c.on("error", function(err) {
            logger.error(util.format("Error connecting %s", c.host));
            cb(enlace.id);
        });

        logger.debug(util.format("Executing on %s: :global ip; :set ip %s; /system script run bandwidth", ip, testip));
        c.connect({
            host: ip, 
            port: 22,
            username: "guest",
            password: "-"
        });  
    } else {
        logger.error(util.format("Link not found: %s %s", ip, enlace.id));
        cb(enlace.id);
    }
}

function monitor_link(enlace, countdown_and_exit) {
    var s1 = enlace.supernodos[0];
    var s2 = enlace.supernodos[1];

    Supernodo.count({ _id: { $in: [ s1.toString(), s2.toString() ] } }, function(err, count) {
        if (count != 2) {
            logger.error(util.format("Invalid link: %s %s %s", enlace.id, s1, s2));
            countdown_and_exit(enlace.id);
        } else {

            Supernodo.find({ _id: { $in: [ s1.toString(), s2.toString() ] } }, function(err, supernodos) {
                var s1 = supernodos[0];
                var s2 = supernodos[1];
                if (s1.system === "mikrotik" && s2.system === "mikrotik") {
                    bandwidth_test(enlace, s1, s2, countdown_and_exit);
                } else {
                    logger.error(util.format("Link to openwrt: %s %s", s1.name, s2.name));
                    countdown_and_exit(enlace.id);
	        }
            });
        }
    });
}

Enlace.find({ active: true }).exec(function(err, enlaces) {
    if (err) { throw err };

    var counter = enlaces.length;

    var waitfor = new Array();
    for (var i=0; i<enlaces.length; i++) {
        waitfor.push(enlaces[i].id);
    }

    setTimeout(function() {
       logger.error(util.format("Bad exit: %s", waitfor));
       process.exit(-1);
    }, 120000);

    function countdown_and_exit(enlaceid) {
        waitfor.splice(waitfor.indexOf(enlaceid), 1);
        if (waitfor.length == 0) {
            mongoose.disconnect();
            process.exit(0);
        }
    }

    enlaces.forEach(function(enlace) {
        monitor_link(enlace, countdown_and_exit);
    });
});

