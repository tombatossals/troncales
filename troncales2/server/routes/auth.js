"use strict";

var passport = require("passport");

module.exports = function(app, urls) {

    app.get(urls.login,
        passport.authenticate('google', { failureRedirect: urls.base }),
            function(req, res) {
            res.redirect(urls.base);
    });

    app.get('/auth/google/return', 
        passport.authenticate('google', { failureRedirect: urls.base }),
            function(req, res) {
                res.redirect(urls.base.url);
    });

    app.get(urls.logout, function(req, res){
        req.logout();
        res.redirect(urls.base);
    });

};
