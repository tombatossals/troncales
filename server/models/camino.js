/** User Schema for CrowdNotes **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CaminoSchema = new Schema({
    supernodos: [{
        type: ObjectId,
        ref: "supernodos"
    }],
    enlaces: [{
        type: ObjectId,
        ref: "enlaces"
    }]
});

module.exports = mongoose.model('caminos', CaminoSchema);