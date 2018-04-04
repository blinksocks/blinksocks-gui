const jsSHA = require('jssha');

export default function hash(algorithm, message) {
  const shaObj = new jsSHA(algorithm, 'TEXT');
  shaObj.update(message);
  return shaObj.getHash('HEX');
}
