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
    s1_interface: {
        type: String
    },
    s2_interface: {
        type: String
    },
    supernodos: [{
        type: ObjectId
    }],
    rrdtool_bandwidth_graph_id: {
        type: String
    },
    rrdtool_traffic_graph_id: {
        type: String
    },
    rrdtool_bandwidth_id: {
        type: String
    },
    rrdtool_traffic_id: {
        type: String
    }
});

module.exports = mongoose.model('enlaces', EnlaceSchema);
