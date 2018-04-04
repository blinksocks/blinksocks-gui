// const os = require('os');
const winston = require('winston');

module.exports = new (winston.Logger)({
  level: 'silly',
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      prettyPrint: true
    }),
    // new (require('winston-daily-rotate-file'))({
    //   json: false,
    //   eol: os.EOL,
    //   filename: __LOG_PATH__,
    //   level: __LOG_LEVEL__,
    //   maxDays: __LOG_MAX_DAYS__
    // }),
  ]
});
