const winston = require('winston');

const { transports, format: { printf, combine, colorize, timestamp, splat, prettyPrint } } = winston;

module.exports = winston.createLogger({
  level: 'silly',
  format: combine(
    timestamp(),
    splat(),
    colorize(),
    prettyPrint(),
    printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
  ]
});
