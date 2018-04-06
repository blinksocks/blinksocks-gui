module.exports = async function unset_service_auto_start({ id }) {
  const configs = this.db.getConfigs();
  const services = this.db.get('auto_start_services');

  if (!configs.find({ id }).value()) {
    throw Error('unknown service');
  }

  services.pullAll([id]).write();
};
