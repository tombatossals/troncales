"use strict";

var passport = require("passport");

module.exports = function(app, urls) {

    app.get(urls.login,
        passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                                  'https://www.googleapis.com/auth/userinfo.email'] }),
        function(req, res) { }
    );

    app.get(urls.authcallback, 
        passport.authenticate('google', { failureRedirect: urls.login }),
        function(req, res) {
            res.redirect(urls.base);
        }
    );

    app.get(urls.logout, function(req, res){
        req.logout();
        res.redirect(urls.base);
    });

};
