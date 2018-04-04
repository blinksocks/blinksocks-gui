module.exports = async function copy_setting({ id }) {
  const configs = this.db.getConfigs();
  const config = configs.find({ id }).cloneDeep().value();
  delete config.id;
  return configs.insert(config).write();
};
