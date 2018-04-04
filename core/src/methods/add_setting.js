const bsInit = require('blinksocks/bin/init');
const { RUN_TYPE_CLIENT, RUN_TYPE_SERVER } = require('../constants');

module.exports = async function add_setting({ remarks }) {
  const { runType } = this.ctx;
  const { clientJson, serverJson } = bsInit({ isMinimal: false, isDryRun: true });
  const configs = this.db.getConfigs();
  if (runType === RUN_TYPE_CLIENT) {
    return configs.insert(Object.assign({}, clientJson, { remarks })).write().id;
  }
  if (runType === RUN_TYPE_SERVER) {
    return configs.insert(Object.assign({}, serverJson, { remarks })).write().id;
  }
};
