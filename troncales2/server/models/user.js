/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate')

// Define schema
var UserSchema = new Schema({
    name: {
        givenName: {
            type: String,
            required: true
        },
        familyName: {
            type: String,
            required: true
        }
    },
    phone: {
        type: String,
        unique: true
    },
    displayName: {
        type: String,
        unique: true,
        required: true
    },
    email: [{
        type: String,
        unique: true,
        required: true
    }]
});

UserSchema.plugin(findOrCreate);
module.exports = mongoose.model('User', UserSchema);
