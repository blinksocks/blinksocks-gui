const { ServiceManager } = require('../utils');

module.exports = async function get_service_metrics({ id }) {
  const [cpu_metrics, memory_metrics, speed_metrics, connections_metrics, traffic_metrics] = await Promise.all([
    ServiceManager.getMetrics(id, 'cpu'),
    ServiceManager.getMetrics(id, 'memory'),
    ServiceManager.getMetrics(id, 'speed'),
    ServiceManager.getMetrics(id, 'connections'),
    ServiceManager.getMetrics(id, 'traffic'),
  ]);
  return {
    cpu_metrics,
    memory_metrics,
    speed_metrics,
    connections_metrics,
    traffic_metrics,
  };
};
