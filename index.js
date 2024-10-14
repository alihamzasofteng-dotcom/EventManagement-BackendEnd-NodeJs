require('express-async-errors');
const express = require('express');
const winston = require('winston');
const app = express();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/logging')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

app.get("/", (req, res) => res.send("Express on Vercel"));

const port = process.env.PORT || 3000;
const server =app.listen(port, () => winston.info(`Listening on port ${port}...`));
// integration testing ky lye server ko export kr rhy han test file main import ky liye
module.exports = server;