const jsSHA = require('jssha');

module.exports = function hash(algorithm, message) {
  const shaObj = new jsSHA(algorithm, 'TEXT');
  shaObj.update(message);
  return shaObj.getHash('HEX');
};
