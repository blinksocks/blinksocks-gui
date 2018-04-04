const { Config } = require('blinksocks');
const { ServiceManager } = require('../utils');

module.exports = async function start_service({ id }) {
  const config = await this.invoke('get_config', { id }, { desensitize: false });
  Config.test(config);
  await ServiceManager.start(id, config);
  return ServiceManager.getServiceInfo(id);
};
