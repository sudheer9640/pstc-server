const mongoose = require('mongoose');
const instance = require('../config/instance');
mongoose.Promise = global.Promise;
mongoose.connect(instance.dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;

db.on('error', function(err) {
  console.error('There was a db connection error');
  return console.error(err.message);
});
db.once('connected', function() {
  return console.log('Successfully connected to ' + instance.dbUrl);
});
db.once('disconnected', function() {
  return console.error('Disconnected from ' + instance.dbUrl);
});


module.exports = {mongoose};
