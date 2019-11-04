

const session = require("./sessionroute");
const question = require("./questionroute");
const content = require("./contentroute");
const headerFooter = require("./headerfooterroute");
const express = require("express");
let app = express();

app.use('/session', session);
app.use('/question', question);
app.use('/content', content);
app.use('/headerFooter',headerFooter);

module.exports = app;