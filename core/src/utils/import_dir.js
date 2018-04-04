const fs = require('fs');
const path = require('path');

const cache = {};

module.exports = function import_dir(dir) {
  if (cache[dir]) {
    return cache[dir];
  }
  const files = fs.readdirSync(dir);
  const modules = {};
  for (const file of files) {
    const name = path.basename(file, '.js');
    if (name && name[0] !== '.') {
      modules[name] = require(path.resolve(dir, name));
    }
  }
  return cache[dir] = modules;
};
