const child_process = require('child_process');
const { RUNTIME_HELPERS_PAC_PATH } = require('../constants');

module.exports = async function get_system_pac() {
  return new Promise((resolve, reject) => {
    child_process.exec(RUNTIME_HELPERS_PAC_PATH + ' show', { encoding: 'utf-8' }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
