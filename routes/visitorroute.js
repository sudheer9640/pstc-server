
const headerFooter = require("./headerfooterroute");
const express = require("express");
let app = express();

app.use('/headerFooter',headerFooter);

module.exports = app;