"use strict";

var passport = require('passport'),
    settings = require('../config/settings'),
    relative_urls = require('../config/urls'),
    urls_constructor = require('./urls_constructor'),
    User = require('../models/user'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var urls = urls_constructor(settings.base_url, relative_urls);

function configure() {

    passport.use(new GoogleStrategy({
        clientID: settings.GOOGLE_CLIENT_ID,
        clientSecret: settings.GOOGLE_CLIENT_SECRET,
        callbackURL: urls.authcallback
      },
      function(accessToken, refreshToken, profile, done) {
          var userData = { displayName: profile.displayName, email: profile.emails[0].value, name: profile.name };

          User.findOrCreate(userData, function (err, user) {
              return done(err, user);
          });
      }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.redirectUrl = req.url;
    res.redirect(urls.googlelogin);
}

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.configure = configure;
