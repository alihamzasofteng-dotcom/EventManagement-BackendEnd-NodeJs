const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

// Set deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);  // for the 'ensureIndex' warning

module.exports= function (){
    const db = config.get('db');
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Adjust the timeout value if needed
  })
  .then(() => winston.info(`Connected to ${db}...`));
}