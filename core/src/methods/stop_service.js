const { ServiceManager } = require('../utils');

module.exports = async function stop_service({ id }) {
  await ServiceManager.stop(id);
  return ServiceManager.getServiceStatus(id);
};
