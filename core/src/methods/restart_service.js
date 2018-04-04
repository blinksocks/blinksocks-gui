const { ServiceManager } = require('../utils');

module.exports = async function restart_service({ id }) {
  await this.invoke('stop_service', { id });
  await this.invoke('start_service', { id });
  return ServiceManager.getServiceInfo(id);
};
