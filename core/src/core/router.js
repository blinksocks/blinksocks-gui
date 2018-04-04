const path = require('path');
const { import_dir } = require('../utils');

const methods = import_dir(path.join(__dirname, '..', 'methods'));

async function dispatch(method, args, extra) {
  const func = methods[method];
  if (typeof func === 'function') {
    // check methods
    if (this.getDisallowedMethods().includes(method)) {
      throw Error(`you don't have privileges to call: "${method}"`);
    }
    const result = await func.call(this, args || {}, extra || {});
    if (typeof result === 'undefined') {
      return null;
    } else {
      return await result;
    }
  } else {
    throw Error(`method "${method}" is not implemented or not registered`);
  }
}

module.exports = {
  dispatch,
};
