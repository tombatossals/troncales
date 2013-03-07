"use strict";

var exec = require('child_process').exec,
    util = require("util"),
    Supernodo = require("../models/supernodo"),
    Enlace = require("../models/enlace"),
    fs = require("fs"),
    ensureAuthenticated = require('../common/google_auth').ensureAuthenticated;

module.exports = function(app, urls) {

    if (urls.base !== "/") {
        app.get("/", function(req, res) {
            res.redirect(urls.base);
        });
    }

    app.get(urls.user, ensureAuthenticated, function(req, res) {
	var title = "User account management";
	res.render("user", { locals: {
            angular_controller: "UserController",
            user: req.user,
            title: title
        } });
    });

    app.get(urls.base, function(req, res) {
	var title = "Troncal de la plana";
	res.render("map", { locals: {
            angular_controller: "MapController",
            user: req.user,
            title: title
        } });
    });

    app.get(urls.supernodo, function(req, res) {
	var title = "Troncal de la plana";
        res.render("supernodo", { locals: {
            angular_controller: "SupernodoController",
            user: req.user,
            title: title
        } });
    });

    app.get(urls.enlace, function(req, res) {
        var title = "Troncal de la plana";
        res.render("enlace", { locals: {
            angular_controller: "EnlaceController",
            user: req.user,
            title: title
        } });
    });

    app.get(urls.graph, function(req, res) {

        var o = req.params.s1;
        var d = req.params.s2;
        var interval = req.query.interval;

        Supernodo.find({ "name": { "$in": [ o, d ] } }, function(err, supernodos) {
            if (err) {
                throw err;
            } else if (supernodos.length != 2) {
                throw err;
            } else {
                var s1 = supernodos[0];
                var s2 = supernodos[1];

                Enlace.findOne( { "supernodos.id": { "$all": [ s1._id.toString(), s2._id.toString() ] } }, function(err, enlace) {
                    if (err) {
                        throw err;
                    } else {
                        var a = "/var/lib/collectd/" + s1.name + "/links/bandwidth-" + s2.name + ".rrd";
                        var iface = "";

                        if (fs.existsSync(a)) {
                            if (s1._id == enlace.supernodos[0].id) {
                              iface = enlace.supernodos[0].iface;
                            } else {
                              iface = enlace.supernodos[1].iface;
                            }
                            iface = iface.replace(/:[0-9]+\./, ".");
                            var b = "/var/lib/collectd/" + s1.name + "/snmp/if_octets-" + iface + ".rrd";
                        } else {
                            var a = "/var/lib/collectd/" + s2.name + "/links/bandwidth-" + s1.name + ".rrd";
                            if (s2._id == enlace.supernodos[1].id) {
                              iface = enlace.supernodos[1].iface;
                            } else {
                              iface = enlace.supernodos[0].iface;
                            }
                            iface = iface.replace(/:[0-9]+/, "");
                            var b = "/var/lib/collectd/" + s2.name + "/snmp/if_octets-" + iface + ".rrd";
                        }

                        if (!fs.existsSync(a) || !fs.existsSync(b)) {
                            res.send(404);
                            return;
                        }

                        var start = -86400;
                        var step = 1200; 
                        if (interval == "weekly") {
                            start = -604800;
                            step = 3600*2;
                        } else if (interval == "monthly") {
                            start = -18144000;
                            step = 3600*24;
                        } else if (interval == "year") {
                            start = -31536000;
                            step = 3600*24*7;
                        }

                        var command = '/usr/bin/rrdtool graph - --imgformat=PNG ' +
                                      '--start=' + start + ' --end=now ' +
                                      '--title="' + o + '- ' + d + ' - Bandwidth meter" ' +
                                      '--step=' + step + ' --base=1000 --height=140 --width=480 ' +
                                      '--alt-autoscale-max --lower-limit="0" ' +
                                      '--vertical-label="bits per second" --font TITLE:10: ' +
                                      '--font AXIS:7: --font LEGEND:8: --font UNIT:7: ' +
                                      'DEF:a="' + a + '":"rx":AVERAGE:step=1200 ' +
                                      'DEF:b="' + a + '":"tx":AVERAGE:step=1200 ' + 
                                      'DEF:c="' + b + '":"rx":AVERAGE:step=300 ' +
                                      'DEF:d="' + b + '":"tx":AVERAGE:step=300 ' +
                                      'CDEF:cdefb=b,-1,* CDEF:cinbits=c,8,* ' +
                                      'CDEF:cdeff=d,8,* CDEF:dinbits=cdeff,-1,* ' +
                                      'AREA:a#4444FFFF:"Bandwidth TX"  ' +
                                      'LINE:a#000000FF GPRINT:a:LAST:"Last%8.2lf %s" ' +
                                      'GPRINT:a:AVERAGE:"Avg%8.2lf %s"  ' +
                                      'GPRINT:a:MAX:"Max%8.2lf %s" GPRINT:a:MIN:"Min%8.2lf %s\\n"  ' +
                                      'AREA:cinbits#FF0000FF:"Traffic   TX" LINE:cinbits#000000FF ' +
                                      'GPRINT:cinbits:LAST:"Last%8.2lf %s" GPRINT:cinbits:AVERAGE:"Avg%8.2lf %s"  ' +
                                      'GPRINT:cinbits:MAX:"Max%8.2lf %s" GPRINT:cinbits:MIN:"Min%8.2lf %s\\n" ' +
                                      'AREA:cdefb#44AAFFFF:"Bandwidth RX" LINE:cdefb#110000FF ' +
                                      'GPRINT:b:LAST:"Last%8.2lf %s" GPRINT:b:AVERAGE:"Avg%8.2lf %s"  ' +
                                      'GPRINT:b:MAX:"Max%8.2lf %s" GPRINT:b:MIN:"Min%8.2lf %s\\n"  ' +
                                      'AREA:dinbits#FF8800FF:"Traffic   RX" LINE:dinbits#000000FF ' +
                                      'GPRINT:cdeff:LAST:"Last%8.2lf %s" GPRINT:cdeff:AVERAGE:"Avg%8.2lf %s"  ' +
                                      'GPRINT:cdeff:MAX:"Max%8.2lf %s" GPRINT:cdeff:MIN:"Min%8.2lf %s\\n"';

                        exec(command, { encoding: 'binary', maxBuffer: 5000*1024 }, function(error, stdout, stderr) {   
                            res.type('png');
                            res.send(new Buffer(stdout, 'binary'));
                        });
                    }
                });
            }
        });
    });
};
