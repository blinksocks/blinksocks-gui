const child_process = require('child_process');
const sudo = require('sudo-prompt');
const { RUNTIME_HELPERS_SYSPROXY_PATH } = require('../constants');

module.exports = async function get_system_proxy() {
  const command = RUNTIME_HELPERS_SYSPROXY_PATH + ' show';
  return new Promise((resolve, reject) => {
    if (process.platform === 'darwin') {
      sudo.exec(command, { name: 'blinksocksGUI' }, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    } else {
      child_process.exec(command, { encoding: 'utf-8' }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  });
};
