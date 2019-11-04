const mongoose = require('mongoose');

const liveUpdateSchema = new mongoose.Schema({
    update: String,
    timestamp: String,
    sessionId:String,
},{timestamps: true});


const liveUpdate = mongoose.model('LiveUpdate', liveUpdateSchema);

module.exports = { liveUpdate };