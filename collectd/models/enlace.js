/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var EnlaceSchema = new Schema({
    distance: {
        type: String
    },
    active: {
        type: Boolean
    },
    saturation: {
        type: String
    },
    network: {
        type: String
    },
    s1_interface : {
        type: String
    },
    s2_interface : {
        type: String
    },
    bandwidth: {
        type: String
    },
    supernodos: [ {
        type: ObjectId
    }],

    rrdfile: {
        type: String
    }
});

module.exports.EnlaceSchema = EnlaceSchema;
module.exports.Enlace = mongoose.model('enlaces', EnlaceSchema);
