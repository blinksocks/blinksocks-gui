const { ServiceManager } = require('../utils');

module.exports = async function live_services() {
  this.pushInterval(async () => ({
    services: await ServiceManager.getServices()
  }), 5e3);
};
