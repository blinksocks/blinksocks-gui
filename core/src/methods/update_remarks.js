module.exports = async function update_remarks({ id, remarks }) {
  if (typeof remarks !== 'string' || remarks.length < 1) {
    throw Error('invalid parameter');
  }
  this.db.getConfigs().find({ id }).assign({ remarks }).write();
};
