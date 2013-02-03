"use strict";

var passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy;

function configure() {
    passport.use(new GoogleStrategy({
        returnURL: 'http://geo.qui.guifi.net/auth/google/return',
        realm: 'http://geo.qui.guifi.net/'
      }, function(identifier, profile, done) {
        process.nextTick(function () {
           profile.identifier = identifier;
           return done(null, profile);
      });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
}

module.exports.configure = configure
