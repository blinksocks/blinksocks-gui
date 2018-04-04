const { RUN_TYPE_CLIENT, RUN_TYPE_SERVER, DESENSITIZE_PLACEHOLDER } = require('../constants');

module.exports = async function get_config({ id }, { desensitize = true }) {
  const { runType } = this.ctx;
  const config = this.db.getConfigs().find({ id }).cloneDeep().value();
  if (!config) {
    throw Error('config is not found');
  }
  if (desensitize) {
    if (runType === RUN_TYPE_CLIENT) {
      config.server.key = DESENSITIZE_PLACEHOLDER;
    }
    if (runType === RUN_TYPE_SERVER) {
      config.key = DESENSITIZE_PLACEHOLDER;
    }
  }
  return config;
};
