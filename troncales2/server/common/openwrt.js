#!/usr/bin/env node

process.on('error', function(err) {
    logger.error("Error fatal");
    //mongoose.disconnect();
});

var logger    = require("./log"),
    util      = require("util"),
    sshConn   = require("ssh2");


function convierteEstructura(res) {
    var result = new Array();

    var res = res.split("\n");

    for (var l in res) {
        var line = res[l];
        if (line.search("traceroute") != 0) {
            line = line.replace(/ [0-9]+ +/, "");
            line = line.split(" ")[0];
            if (line.search("10.") == 0 || line.search("172.") == 0) {
                result.push(line);
            }
        }
    }

    return result;
}

function traceroute(ip, username, password, remoteip, callback) {
    var c = new sshConn();
    c.on("ready", function() {
        c.exec(util.format("/usr/bin/traceroute %s", remoteip), function(err, stream) {
            if (err) { 
                logger.debug(util.format("Error getting IP information from OpenWRT: %s", ip));
            } else {
                var res = new Array();
                stream.on("data", function(data) {
                    data = data.toString().trim();
                    res = convierteEstructura(data);
                });
                stream.on("exit", function() {
                    callback(res);
                    c.end();
                });
            }
        });
    });

    c.on("error", function(err) {
        logger.debug(util.format("Error getting IP information from OpenWRT: %s %s", ip, err));
    });

    c.connect({
        host: ip, 
        port: 22,
        username: username,
        password: password
    });  
}

module.exports.traceroute = traceroute;
