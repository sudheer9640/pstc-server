const mongoose = require('mongoose');

const headerFooterSchema = new mongoose.Schema({
 headerUrl: String,
 footerUrl: String,
 copyRight: String
},{timestamps: true});

const headerFooter = mongoose.model('HeaderFooter', headerFooterSchema);
module.exports = {headerFooter}
