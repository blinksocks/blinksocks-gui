module.exports = async function get_service({ id }) {
  return this.db.getConfigs().find({ id }).value();
};
