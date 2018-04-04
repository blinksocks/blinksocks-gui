module.exports = async function delete_user({ id }) {
  this.db.get('users').remove({ id }).write();
};
