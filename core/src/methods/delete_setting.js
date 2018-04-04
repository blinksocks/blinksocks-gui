module.exports = async function delete_setting({ id }) {
  return this.db.getConfigs().remove({ id }).write();
};
