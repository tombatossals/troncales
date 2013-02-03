"use strict";

var exec = require('child_process').exec;

module.exports = function(app, urls) {

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect(urls.login);
    }

    if (urls.base !== "/") {
        app.get("/", function(req, res) {
            res.redirect(urls.base);
        });
    }

    app.get(urls.base, function(req, res) {
	var title = "Troncal de la plana";
	res.render("home", { locals: {
            angular_controller: "MapController",
            username: req.user,
            title: title
        } });
    });

    app.get(urls.graph, function(req, res) {

        var o = req.params.s1;
        var d = req.params.s2;
        var a = "/var/lib/collectd/" + o + "/links/bandwidth-" + d + ".rrd";
        var b = "/var/lib/collectd/castalia/snmp/if_octets-wlan2.rrd";

        var command = '/usr/bin/rrdtool graph - --imgformat=PNG --start=-86400 ' +
                      '--end=-1200 --title="' + o + '- ' + d + ' - Bandwidth meter" ' +
                      '--base=1000 --height=140 --width=500 --alt-autoscale-max --lower-limit="0" ' +
                      '--vertical-label="bits per second" --slope-mode --font TITLE:10: ' +
                      '--font AXIS:7: --font LEGEND:8: --font UNIT:7: DEF:a="' + a + '":"rx":AVERAGE ' +
                      'DEF:b="' + a + '":"tx":AVERAGE DEF:c="' + b + '":"rx":AVERAGE ' +
                      'DEF:d="' + b + '":"tx":AVERAGE CDEF:cdefb=b,-1,* CDEF:cinbits=c,8,* ' +
                      'CDEF:cdeff=d,8,* CDEF:dinbits=cdeff,-1,* AREA:a#4444FFFF:"Bandwidth TX"  ' +
                      'LINE:a#000000FF GPRINT:a:LAST:"Last%8.2lf %s" GPRINT:a:AVERAGE:"Avg%8.2lf %s"  ' +
                      'GPRINT:a:MAX:"Max%8.2lf %s" GPRINT:a:MIN:"Min%8.2lf %s\n"  ' +
                      'AREA:cinbits#FF0000FF:"Traffic   TX" LINE:cinbits#000000FF ' +
                      'GPRINT:cinbits:LAST:"Last%8.2lf %s" GPRINT:cinbits:AVERAGE:"Avg%8.2lf %s"  ' +
                      'GPRINT:cinbits:MAX:"Max%8.2lf %s" GPRINT:cinbits:MIN:"Min%8.2lf %s\n" ' +
                      'AREA:cdefb#44AAFFFF:"Bandwidth RX" LINE:cdefb#110000FF ' +
                      'GPRINT:b:LAST:"Last%8.2lf %s" GPRINT:b:AVERAGE:"Avg%8.2lf %s"  ' +
                      'GPRINT:b:MAX:"Max%8.2lf %s" GPRINT:b:MIN:"Min%8.2lf %s\n"  ' +
                      'AREA:dinbits#FF8800FF:"Traffic   RX" LINE:dinbits#000000FF ' +
                      'GPRINT:cdeff:LAST:"Last%8.2lf %s" GPRINT:cdeff:AVERAGE:"Avg%8.2lf %s"  ' +
                      'GPRINT:cdeff:MAX:"Max%8.2lf %s" GPRINT:cdeff:MIN:"Min%8.2lf %s\n"';

        exec(command, { encoding: 'binary', maxBuffer: 5000*1024 }, function(error, stdout, stderr) {   
            res.type('png');
            res.send(new Buffer(stdout, 'binary'));
        });

    });
};
