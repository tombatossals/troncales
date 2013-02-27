"use strict";

var passport = require("passport");

module.exports = function(app, urls) {

    app.get(urls.googlelogin,
        passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                                  'https://www.googleapis.com/auth/userinfo.email'] }),
        function(req, res) { }
    );

    app.get(urls.login, function(req, res) {
        if (req.query.return) {
            req.session.redirectUrl = req.header("Referrer") + "#/" + req.query.return;
        } else {
            req.session.redirectUrl = req.header("Referrer");
        }
        res.redirect(urls.googlelogin);
    });

    app.get(urls.authcallback, 
        passport.authenticate('google', { failureRedirect: urls.login }),
        function(req, res) {

            var url = urls.base;
            if (req.session.redirectUrl) {
                url = req.session.redirectUrl;
                req.session.redirectUrl = null;
            }

            res.redirect(url);
        }
    );

    app.get(urls.logout, function(req, res){
        req.logout();
        res.redirect(urls.base);
    });

};
