const pidusage = require('pidusage');
const dateFns = require('date-fns');
const { Callee } = require('node-ipc-call');

const { Hub } = require('blinksocks');

let hub = null;

async function getUsage() {
  const stats = await pidusage(process.pid);
  return {
    cpuUsage: stats.cpu,
    memoryUsage: stats.memory,
  };
}

const QUEUE_SIZE = 300; // 5min

// metrics collector
const Monitor = {

  _timer: null,

  _cpu_metrics: [
    // timestamp, cpu_percentage
  ],

  _memory_metrics: [
    // timestamp, memory_usage
  ],

  _upload_speed_metrics: [
    // timestamp, memory_usage
  ],

  _download_speed_metrics: [
    // timestamp, memory_usage
  ],

  _connections_metrics: [
    // timestamp, connections
  ],

  _upload_traffic_metrics: [
    // timestamp, total_bytes
  ],

  _download_traffic_metrics: [
    // timestamp, total_bytes
  ],

  getCPUMetrics() {
    return this._cpu_metrics;
  },

  getMemoryMetrics() {
    return this._memory_metrics;
  },

  getUploadSpeedMetrics() {
    return this._upload_speed_metrics;
  },

  getDownloadSpeedMetrics() {
    return this._download_speed_metrics;
  },

  getConnectionsMetrics() {
    return this._connections_metrics;
  },

  getUploadTrafficMetrics() {
    return this._upload_traffic_metrics;
  },

  getDownloadTrafficMetrics() {
    return this._download_traffic_metrics;
  },

  start() {
    this._timer = setInterval(this._sample.bind(this), 1e3);
  },

  stop() {
    clearInterval(this._timer);
  },

  async _sample() {
    const { _cpu_metrics, _memory_metrics } = this;
    const { _connections_metrics, _upload_speed_metrics, _download_speed_metrics } = this;
    const { _upload_traffic_metrics, _download_traffic_metrics } = this;
    try {
      const { cpuUsage, memoryUsage } = await getUsage();
      const dateStr = dateFns.format(Date.now(), 'HH:mm:ss');

      _cpu_metrics.push([dateStr, cpuUsage > 1 ? 1 : cpuUsage]);
      _memory_metrics.push([dateStr, memoryUsage]);

      if (hub) {
        const connections = await hub.getConnections();
        _upload_speed_metrics.push([dateStr, hub.getUploadSpeed()]);
        _download_speed_metrics.push([dateStr, hub.getDownloadSpeed()]);
        _connections_metrics.push([dateStr, connections]);
        _upload_traffic_metrics.push([dateStr, hub.getTotalWritten()]);
        _download_traffic_metrics.push([dateStr, hub.getTotalRead()]);
      }

      const metricsCollection = [
        _cpu_metrics,
        _memory_metrics,
        _upload_speed_metrics,
        _download_speed_metrics,
        _connections_metrics,
        _upload_traffic_metrics,
        _download_traffic_metrics,
      ];

      metricsCollection.forEach((metrics) => {
        if (metrics.length > QUEUE_SIZE) {
          metrics.shift();
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

};

const callee = new Callee();

// process methods mapping
callee.register({
  // start hub
  'start': async function start(config) {
    if (!hub) {
      hub = new Hub(config);
      Monitor.start();
      return hub.run();
    }
  },
  // stop hub
  'stop': async function stop() {
    if (hub) {
      Monitor.stop();
      return hub.terminate();
    }
  },
  // get status from hub
  'getStatus': async function getStatus() {
    if (hub) {
      return {
        connections: await hub.getConnections(),
        download_speed: hub.getDownloadSpeed(),
        upload_speed: hub.getUploadSpeed(),
      };
    }
  },
  // get connection statuses from hub
  'getConnStatuses': async function getConnStatuses() {
    if (hub) {
      return hub.getConnStatuses();
    }
  },
  // get current process cpu metrics
  'getCPUMetrics': () => Monitor.getCPUMetrics(),
  // get current process memory metrics
  'getMemoryMetrics': () => Monitor.getMemoryMetrics(),
  // get current process upload speed and download speed metrics
  'getSpeedMetrics': () => [Monitor.getUploadSpeedMetrics(), Monitor.getDownloadSpeedMetrics()],
  // get current process connections number
  'getConnectionsMetrics': () => Monitor.getConnectionsMetrics(),
  // get current process upload traffic and download traffic
  'getTrafficMetrics': () => [Monitor.getUploadTrafficMetrics(), Monitor.getDownloadTrafficMetrics()],
});

callee.listen();
