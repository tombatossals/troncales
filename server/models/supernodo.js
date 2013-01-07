/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var SupernodoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    ip: {
        type: String
    },
    validated: {
        type: Boolean
    },
    latlng: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model('supernodos', SupernodoSchema);