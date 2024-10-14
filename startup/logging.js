const winston = require('winston');
//commented this line for integratioin testing 
//require('winston-mongodb');

module.exports = function () {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    // Handle uncaught exceptions and colorize the output in the console
    winston.exceptions.handle(
            new winston.transports.Console({
                format: winston.format.simple()
            }),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' }) // Log uncaught exceptions to a file
    );

    // Normal log handling with file and colorized console output
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));

    // Adding color to all log levels in console
    winston.add(new winston.transports.Console({
      format: winston.format.simple()
    }));

    // MongoDB logging for storing logs in MongoDB
    //commented this line for integratioin testing 
   // winston.add(new winston.transports.MongoDB({ db: 'mongodb://127.0.0.1:27017/vidly' }));
};
