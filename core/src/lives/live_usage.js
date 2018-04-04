const os = require('os');
const pidusage = require('pidusage');

module.exports = async function live_usage() {
  this.pushInterval(async () => {
    const stats = await pidusage(process.pid);
    return {
      cpuUsage: stats.cpu / os.cpus().length,
      memoryUsage: stats.memory,
    };
  }, 5e3);
};
