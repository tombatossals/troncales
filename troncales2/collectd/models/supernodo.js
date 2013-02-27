#!/usr/bin/env node

var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var SupernodoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    mainip: {
        type: String
    },
    system: {
        type: String
    },
    interfaces: [ {
	name: String,
	address: String
    }],
    validated: {
        type: Boolean
    },
    latlng: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model('supernodos', SupernodoSchema);
