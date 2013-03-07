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
    util      = require("util"),
    sshConn   = require("ssh2"),
    readline  = require("readline"),
    Supernodo = require("../models/supernodo");

var working = new Array();

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);
var INTERVAL = process.env.COLLECTD_INTERVAL;

if (!INTERVAL) {
	INTERVAL = 1200;
}

function get_testing_ip(enlace, supernodo) {
    if (enlace.supernodos[0].id == supernodo.id.toString()) {
    	var iface_name = enlace.supernodos[0].iface;
    } else if (enlace.supernodos[1].id == supernodo.id.toString()) {
    	var iface_name = enlace.supernodos[1].iface;
    } else {
        logger.error(util.format("Error finding the neighbout IP from %s to %s.", enlace._id, supernodo.name));
        return;
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
    if (s1.system == "mikrotik" && s2.system == "mikrotik") {
        bandwidth_test_mikrotik(enlace, s1, s2, cb);
    } else if (s1.system == "openwrt") {
        bandwidth_test_openwrt(enlace, s1, s2, cb);
    } else if (s2.system == "openwrt") {
        bandwidth_test_openwrt(enlace, s2, s1, cb);
    }
}

function bandwidth_test_openwrt(enlace, s1, s2, cb) {
    var c = new sshConn();
    var ip = s1.mainip;
    var username = s1.username;
    var password = s1.password;
    var duration = 20;
    var testip = get_testing_ip(enlace, s2);
    if (testip) {
        c.on("ready", function() {
            c.exec(util.format("/usr/sbin/mikrotik_btest -d both -t %s %s", duration, testip), function(err, stream) {
                logger.debug(util.format("ssh %s /usr/sbin/mikrotik_btest -d both -t %s %s", ip, duration, testip)); 
                var tx = 0, rx = 0;
                stream.on("data", function(data) {
                    var data = data.toString().trim();
                    var data = data.split("\n");
                    for (l in data) {
                        var line = data[l];
                        if (line.search("Rx:") == 0) {
                            tx = line.split("\t")[1];
                            rx = line.split("\t")[0];
                            tx = tx.replace(/Tx: +/, "");
                            tx = tx.split(" ")[0];
                            rx = rx.replace(/Rx: +/, "");
                            rx = rx.split(" ")[0];
                        }
                    }
                });
                stream.on("exit", function() {
                    tx = parseInt(tx) * 1024 * 1024;
                    rx = parseInt(rx) * 1024 * 1024;
                    console.log(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
                    logger.debug(util.format("PUTVAL \"%s/links/bandwidth-%s\" interval=%s N:%s:%s", s1.name, s2.name, INTERVAL, tx, rx));
                    cb(enlace.id);
                    c.end();
                });
            });
        });

        c.on("error", function(err) {
            logger.error(util.format("Error connecting %s %s", ip, err));
            cb(enlace.id);
        });

        c.connect({
            host: ip, 
            port: 22,
            username: username,
            password: password || "-"
        });  
    } else {
        logger.error(util.format("Link not found: %s %s", ip, enlace.id));
        cb(enlace.id);
    }
}

function bandwidth_test_mikrotik(enlace, s1, s2, cb) {
    var c = new sshConn();
    var ip = s1.mainip;
    var username = s1.username;
    var password = s1.password;
    var username2 = s2.username;
    var password2 = s2.password;
    var interval = 5;
    var duration = 19;
    var testip = get_testing_ip(enlace, s2);
    if (testip) {
        c.on("ready", function() {
            c.exec(util.format(":global ip; :global username; :global password; :global interval; :global duration; :set ip %s; :set username %s; :set password %s; :set interval %s; :set duration %s; /system script run bandwidth", testip, username2, password2, interval, duration), function(err, stream) {
                logger.debug(util.format("Executing on %s: :global ip; :set ip %s; /system script run bandwidth", ip, testip));
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
                        }
                    });
                    stream.on("exit", function() {
                        cb(enlace.id);
                        c.end();
                    });
                }
            });
        });

        c.on("error", function(err) {
            logger.error(util.format("Error connecting %s %s", ip, err));
            cb(enlace.id);
        });

        c.connect({
            host: ip, 
            port: 22,
            username: username,
            password: password || "-"
        });  
    } else {
        logger.error(util.format("Link not found: %s %s", ip, enlace.id));
        cb(enlace.id);
    }
}

function monitor_link(enlace, countdown_and_exit) {
    var s1 = enlace.supernodos[0].id;
    var s2 = enlace.supernodos[1].id;

    Supernodo.count({ _id: { $in: [ s1, s2 ] } }, function(err, count) {
        if (count != 2) {
            logger.error(util.format("Invalid link: %s %s %s", enlace.id, s1, s2));
            countdown_and_exit(enlace.id);
        } else {
            Supernodo.find({ _id: { $in: [ s1, s2 ] } }, function(err, supernodos) {
                var s1 = supernodos[0];
                var s2 = supernodos[1];

                var time = 45000;
                if (working.length == 0) {
                    working[0] = new Array();
                }
                var found = false;
                for (var index in working) {
                    if (working[index].indexOf(s1.name) == -1 && working[index].indexOf(s2.name) == -1) {
                        working[index].push(s1.name);
                        working[index].push(s2.name);
                        found = true;
                        setTimeout(function() {
                            bandwidth_test(enlace, s1, s2, countdown_and_exit);
                        }, time*index);
                        break;
                    }
                }
                if (!found) {
                    var next = working.length;
                    working[next] = new Array(s1.name, s2.nam3);
                    setTimeout(function() {
                        bandwidth_test(enlace, s1, s2, countdown_and_exit);
                    }, time*(next+1));
                }
            });
        }
    });
}

var query = { active: true };
Enlace.find(query).exec(function(err, enlaces) {
    if (err) { throw err };

    var counter = enlaces.length;

    var waitfor = new Array();
    for (var i=0; i<enlaces.length; i++) {
        waitfor.push(enlaces[i].id);
    }

    setTimeout(function() {
       logger.error(util.format("Bad exit: %s", waitfor));
       process.exit(-1);
    }, 380000);

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

