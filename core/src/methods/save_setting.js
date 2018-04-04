const { Config } = require('blinksocks');
const { RUN_TYPE_CLIENT, RUN_TYPE_SERVER, DESENSITIZE_PLACEHOLDER } = require('../constants');

module.exports = async function save_setting({ id, config }) {
  const { runType } = this.ctx;
  const configs = this.db.getConfigs();
  const prevConfig = configs.find({ id }).value();
  switch (runType) {
    case RUN_TYPE_CLIENT:
      Config.testOnClient(config);
      if (config.server.key === DESENSITIZE_PLACEHOLDER) {
        config.server.key = prevConfig.server.key;
      }
      break;
    case RUN_TYPE_SERVER:
      Config.testOnServer(config);
      if (config.key === DESENSITIZE_PLACEHOLDER) {
        config.key = prevConfig.key;
      }
      break;
  }
  configs.find({ id }).assign(config).write();
};
