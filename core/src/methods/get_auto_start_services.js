module.exports = async function get_auto_start_services() {
  return this.db.get('auto_start_services');
};
