const { hash } = require('./hash');
const { HASH_SALT } = require('../constants');

module.exports = function hash_password(plaintext) {
  return hash('SHA-256', plaintext + HASH_SALT);
};
