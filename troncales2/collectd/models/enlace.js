/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EnlaceSchema = new Schema({
    distance: {
        type: String
    },
    saturation: {
        type: String
    },
    network: {
        type: String
    },
    id: {
        type: String
    },
    active: {
        type: Boolean
    },
    supernodos: [ {
        id: {
            type: String
        },
        iface: {
            type: String
        }
    }],
});

module.exports.EnlaceSchema = EnlaceSchema;
module.exports.Enlace = mongoose.model('enlaces', EnlaceSchema);
