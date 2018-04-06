const url = require('url');

module.exports = async function get_services() {
  return this.db
    .getConfigs()
    .map(({ id, service, log_path, remarks }) => {
      const { protocol, hostname, port } = url.parse(service);
      return {
        id: id,
        protocol: protocol ? protocol.slice(0, -1) : '-',
        address: `${hostname}:${port}`,
        remarks: remarks || '',
        log_path: log_path || '-',
      };
    })
    .value();
};
