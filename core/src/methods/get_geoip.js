const { ServiceManager } = require('../utils');

module.exports = async function get_geoip({ id }) {
  return ServiceManager.getServiceGeoIPs(id);
};
