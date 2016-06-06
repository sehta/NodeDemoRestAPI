var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
    title: String
});

module.exports = mongoose.model("Role", roleSchema);