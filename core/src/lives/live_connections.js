const dateFns = require('date-fns');
const { ServiceManager } = require('../utils');

module.exports = async function live_connections({ id }) {
  this.pushInterval(async () => {
    const statuses = await ServiceManager.getServiceConnStatuses(id);
    return statuses.reverse().map((conn) => {
      if (conn.startTime && conn.endTime) {
        conn.elapsed = conn.endTime - conn.startTime; // ms
      }
      if (conn.startTime) {
        conn.startTime = dateFns.format(conn.startTime, 'HH:mm:ss');
      }
      if (conn.endTime) {
        conn.endTime = dateFns.format(conn.endTime, 'HH:mm:ss');
      }
      return conn;
    });
  }, 5e3);
};
