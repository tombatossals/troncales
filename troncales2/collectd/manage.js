#!/usr/bin/env node

var util = require("util");
var argv = require("optimist").usage("Usage: $0 [generate collectd|monitor links|update [interfaces|links]]").demand(2).check(check_parameters).argv;


function check_parameters(argv) {
    var sections = [ [ "generate", "monitor", "update" ], [ "collectd", "interfaces", "links" ] ];
    for (var i=0; i<argv._.length; i++) { 
        var section = sections[i];
        var argument = argv._[i];
        if (section.indexOf(argument) === -1) {
            return false;
        }
    }
    return true;
}

require(util.format("./common/%s_%s", argv._[0], argv._[1]));
