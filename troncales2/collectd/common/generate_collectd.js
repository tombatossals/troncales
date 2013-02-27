#!/usr/bin/env node

var logger = require("./log"),
    mongoose = require('mongoose'),
    Supernodo = require("../models/supernodo");

var conn = 'mongodb://localhost/troncales';
var db = mongoose.connect(conn);

Supernodo.find(function(err, supernodos) {
    if (err) { throw err };

    console.log("LoadPlugin snmp");
    console.log("<Plugin snmp>");
    console.log("  <Data \"std_traffic\">");
    console.log("    Type \"if_octets\"");
    console.log("    Table true");
    console.log("    Instance \"IF-MIB::ifDescr\"");
    console.log("    Values \"IF-MIB::ifInOctets\" \"IF-MIB::ifOutOctets\"");
    console.log("  </Data>");

    for (var i=0; i<supernodos.length; i++) {
        var supernodo = supernodos[i];

        console.log("  <Host \"" + supernodo.name + "\">");
        console.log("      Address \"" + supernodo.mainip + "\"");
        console.log("      Version 2");
        console.log("      Community \"public\"");
        console.log("      Collect \"std_traffic\"");
        console.log("  </Host>");

    }
    console.log("</Plugin>");
    mongoose.disconnect();
});
