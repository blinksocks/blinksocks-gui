const os = require('os');

/**
 * return os information and Node.js versions
 */
module.exports = async function get_env() {
  const osParams = [
    ['cpu', os.cpus()[0].model],
    ['cores', os.cpus().length],
    ['memory', os.totalmem()],
    ['type', os.type()],
    ['platform', os.platform()],
    ['arch', os.arch()],
    ['release', os.release()]
  ];
  const nodeVersions = [];
  for (const [key, value] of Object.entries(process.versions)) {
    nodeVersions.push([key, value]);
  }
  return {
    version: require('../../package').version,
    blinksocksVersion: require('blinksocks/package').version,
    runType: this.ctx.runType,
    os: osParams,
    node: nodeVersions,
  };
};
