/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var EnlaceSchema = new Schema({
    distance: {
        type: String
    },
    saturation: {
        type: String
    },
    bandwidth: {
        type: String
    },
    supernodos: [{
        type: ObjectId
    }],
    rrdfile: {
        type: String
    }
});

module.exports = mongoose.model('enlaces', EnlaceSchema);
