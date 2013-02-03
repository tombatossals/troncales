"use strict";

var fs = require('fs');

module.exports = function(app, urls){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (!/\.js$/.test(file) || file === "index.js") {
            return;
        }
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, urls);
    });
};
