const fs = require('fs');
const utils = require('util');
const { RUNTIME_LOG_PATH } = require('../constants');

const readdir = utils.promisify(fs.readdir);

module.exports = async function get_service_logs({ id }) {
  return (await readdir(RUNTIME_LOG_PATH))
    .filter(name => name.startsWith(id + '.log'))
    .sort();
};
