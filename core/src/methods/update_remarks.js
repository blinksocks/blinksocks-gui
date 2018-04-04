module.exports = async function update_remarks({ id, remarks }) {
  this.db.getConfigs().find({ id }).assign({ remarks }).write();
};
