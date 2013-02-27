#!/usr/bin/env node

process.on('error', function(err) {
    logger.error("Error fatal");
    //mongoose.disconnect();
});

var logger    = require("./log"),
    Netmask   = require('netmask').Netmask,
    util      = require("util"),
    sshConn   = require("ssh2");


function convierteEstructura(res) {
    var result = new Array();

    var res = res.split("\n");

    for (var l in res) {
        var line = res[l];
        if (line.search(" +inet 10\.") != -1 || line.search(" +inet 172\.16\.") != -1) {
            line = line.replace(/ +inet /, "");
            line = line.replace(/brd /, "");
            line = line.replace(/scope global /, "");
            var interface = line.split(" ")[2];
            var network = line.split(" ")[0];
            var ip = line.split(" ")[1];
            var address = ip + "/" + network.split("/")[1]; 
            result.push({ name: interface, address: address });
        }
    }

    return result;
}

function getips(ip, username, password, callback) {
    var c = new sshConn();
    c.on("ready", function() {
        c.exec(util.format("/usr/sbin/ip a"), function(err, stream) {
            if (err) { 
                logger.debug(util.format("Error getting IP information from OpenWRT"));
            } else {
                var res = "";
                stream.on("data", function(data) {
                    res = data.toString().trim();
                    res = convierteEstructura(res);
                });
                stream.on("exit", function() {
                    callback(res);
                    c.end();
                });
            }
        });
    });

    c.on("error", function(err) {
        logger.debug(util.format("Error getting IP information from OpenWRT"));
    });

    c.connect({
        host: ip, 
        port: 22,
        username: username,
        password: password
    });  
}

module.exports.getips = getips;
