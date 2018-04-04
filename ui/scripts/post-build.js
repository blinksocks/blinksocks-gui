const fs = require('fs-extra');
const path = require('path');

const buildPath = path.resolve(__dirname, '../build');
const targetPath = path.resolve(__dirname, '../../core/public');

(async function main() {
  try {
    await fs.remove(targetPath);
    await fs.copy(buildPath, targetPath);
  } catch (err) {
    console.error(err);
  }
})();
