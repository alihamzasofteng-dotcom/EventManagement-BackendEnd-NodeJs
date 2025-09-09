// ye sirf use krny hoty ta ky prod pe har chiz safe rhy ye dono sirf safety dety han or kuch ni
const helmet = require('helmet');
const compression = require('compression');

module.exports = function (app){
    app.use(helmet());
    app.use(compression());
}