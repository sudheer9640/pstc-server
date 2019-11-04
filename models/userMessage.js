const mongoose = require('mongoose');

const userMessageSchema = new mongoose.Schema({
    userName: String,
    timestamp: String,
    message: String,
    status: String
}, {timestamps: true});

const UserMessage = mongoose.model('UserMessage', userMessageSchema);
module.exports = { UserMessage };