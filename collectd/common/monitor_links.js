#!/usr/bin/env node

var logger    = require("./log"),
    mongoose  = require('mongoose'),
    time      = require('time'),
    Netmask   = require('netmask').Netmask,
    Enlace    = require("../models/enlace").Enlace,
    util      = require("util");
    sshConn   = require("ssh2");
    //cronJob   = require("cron").CronJob,
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

function bandwidth_test(ip, testip, cb) {
    var c = new sshConn();

    logger.debug(util.format("Executing on %s: :global ip; :set ip %s; /system script run bandwidth", ip, testip));
    c.on("ready", function() {
        c.exec(util.format(":global ip; :set ip %s; /system script run bandwidth", testip), function(err, stream) {
            if (err) { 
                    logger.debug(util.format("Error on bandwidth from %s to %s.", ip, testip));
		    cb();
		    throw err;
	    }
            stream.on("data", function(data) {
                var data = data.toString().trim();
                if (data.search("tx:") != -1) {
                    cb(data);
                }
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

function monitor_link(enlace, countdown_and_exit) {
    var s1 = enlace.supernodos[0];
    var s2 = enlace.supernodos[1];

    Supernodo.find({ _id: { $in: [ s1.toString(), s2.toString() ] } }, function(err, supernodos) {
        if (supernodos.length !== 2) { countdown_and_exit(); return; };
        var s1 = supernodos[0];
        var s2 = supernodos[1];
        if (s1.system === "mikrotik" && s2.system === "mikrotik") {
            var origin = s1.mainip;
            var destiny = get_testing_ip(enlace, s2);
            logger.info(util.format("Connecting from %s to %s", origin, destiny));

            function outfn(data) {
		var tx = 0, rx = 0;
		if (data) {
                    tx = data.split(" ")[0].replace("tx:", "");
                    rx = data.split(" ")[1].replace("rx:", "");
		}

                console.log(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
                logger.debug(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
	        countdown_and_exit();
            }

            var data = bandwidth_test(origin, destiny, outfn);

        } else {
	        countdown_and_exit();
	}
    });
}

function monitor(enlaces) {
    //var job = new cronJob('*/5 * * * * *', function() {
        var counter = enlaces.length;

	function countdown_and_exit() {
		counter = counter - 1;
		if (counter == 0) {
        		mongoose.connection.close();
                        process.exit(0);
		}
	}

        process.on('uncaughtException', function(err) {
            countdown_and_exit();
        });

        enlaces.forEach(function(enlace) {
            monitor_link(enlace, countdown_and_exit);
        });

    //}, null, true, "Europe/Madrid");
}

Enlace.find({ active: true }).exec(function(err, enlaces) {
    if (err) { throw err };

    if (!enlaces) {
        mongoose.connection.close();
        process.exit(0);
    }
    monitor(enlaces);
});
