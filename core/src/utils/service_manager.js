const path = require('path');
const _ = require('lodash');
const { Caller } = require('node-ipc-call');

const db = require('./db');
const GeoIP = require('./geoip');

const {
  RUNTIME_PATH,
  SERVICE_STATUS_INIT,
  SERVICE_STATUS_RUNNING,
  SERVICE_STATUS_STOPPED,
} = require('../constants');

const FORK_SCRIPT = path.resolve(__dirname, '_fork.js');

module.exports = {

  _subprocesses: new Map(/* <id>: <ChildProcess> */),

  async start(id, config) {
    let sub = this._subprocesses.get(id);
    if (!sub) {
      sub = Caller.fork(FORK_SCRIPT, [], {
        cwd: RUNTIME_PATH,
        silent: process.env.NODE_ENV === 'production',
      });
      sub.geoip = new GeoIP();
      sub.geoip.put(db.get('runtime.ip').value(), { self: true });
      this._subprocesses.set(id, sub);
    }
    try {
      // force logs to put into runtime/logs/
      const configCopy = _.cloneDeep(config);
      configCopy.log_path = `logs/${id}.log`;
      await sub.invoke('start', configCopy);
    } catch (err) {
      this._subprocesses.delete(id);
      throw err;
    }
  },

  async stop(id) {
    const sub = this._subprocesses.get(id);
    if (sub) {
      await sub.invoke('stop');
      sub.destroy();
      sub.geoip.clear();
      this._subprocesses.set(id, null);
    } else {
      throw Error(`service(${id}) is not found`);
    }
  },

  async getServices() {
    const services = {};
    for (const [id] of this._subprocesses) {
      services[id] = await this.getServiceStatus(id);
    }
    return services;
  },

  async getServiceStatus(id) {
    const sub = this._subprocesses.get(id);
    if (sub) {
      return {
        status: SERVICE_STATUS_RUNNING,
        ...(await sub.invoke('getStatus')),
      };
    } else {
      let status;
      if (sub === undefined) {
        status = SERVICE_STATUS_INIT;
      }
      if (sub === null) {
        status = SERVICE_STATUS_STOPPED;
      }
      return { status };
    }
  },

  async getServiceConnStatuses(id) {
    const sub = this._subprocesses.get(id);
    if (sub) {
      const conns = await sub.invoke('getConnStatuses') || [];
      for (const { sourceHost, targetHost } of conns) {
        if (sourceHost) {
          sub.geoip.put(sourceHost, { hostname: [sourceHost], inbound: true });
        }
        if (targetHost) {
          sub.geoip.put(targetHost, { hostname: [targetHost] });
        }
      }
      return conns;
    }
    return [];
  },

  async getMetrics(id, type) {
    const sub = this._subprocesses.get(id);
    if (sub) {
      switch (type) {
        case 'cpu':
          return await sub.invoke('getCPUMetrics');
        case 'memory':
          return await sub.invoke('getMemoryMetrics');
        case 'speed':
          return await sub.invoke('getSpeedMetrics');
        case 'connections':
          return await sub.invoke('getConnectionsMetrics');
        case 'traffic':
          return await sub.invoke('getTrafficMetrics');
        default:
          break;
      }
    } else {
      return [];
    }
  },

  getServiceGeoIPs(id) {
    const sub = this._subprocesses.get(id);
    if (sub) {
      return sub.geoip.getStore();
    } else {
      return [];
    }
  },

};
