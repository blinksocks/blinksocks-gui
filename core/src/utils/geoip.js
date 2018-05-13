const dns = require('dns');
const net = require('net');
const http = require('http');
const _ = require('lodash');

const logger = require('./logger');

async function lookup(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, function (err, address) {
      if (err) {
        reject(err);
      } else {
        resolve(address);
      }
    });
  });
}

async function getGeoInfo(ip) {
  return new Promise((resolve, reject) => {
    const request = http.get('http://ip-api.com/json/' + ip, (res) => {
      res.setEncoding('utf-8');
      res.on('data', (data) => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'success') {
            resolve(json);
          }
        } catch (err) {
          return reject(err);
        }
        reject(Error('couldn\'t get geo info of ' + ip));
      });
      res.on('error', reject);
    });
    request.on('error', reject);
  });
}

function isPrivateIP(ip) {
  return (
    /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^f[cd][0-9a-f]{2}:/i.test(ip) ||
    /^fe80:/i.test(ip) ||
    /^::1$/.test(ip) ||
    /^::$/.test(ip)
  );
}

const MAX_QUEUE_SIZE = 500;

class GeoIP {

  constructor() {
    this._uniqueKeys = new Set();
    this._store = [];
  }

  // lookup ip address to geo location
  async put(arg, extra = {}) {
    if (typeof arg !== 'string' || !arg) {
      return;
    }

    if (this._uniqueKeys.has(arg)) {
      return;
    } else {
      this._uniqueKeys.add(arg);
    }

    let ip;
    try {
      ip = net.isIP(arg) ? arg : await lookup(arg);
    } catch (err) {
      return;
    }

    // ignore private ip
    if (isPrivateIP(ip)) {
      return;
    }

    try {
      const geoInfo = await getGeoInfo(ip);
      const { lat, lon: lng, query } = geoInfo;

      // merge hostname and ip by the same geo location
      const item = this._store.find((v) => v.lat === lat && v.lng === lng);
      if (item) {
        item.ips.push(query);
        if (item.ips.length > 20) {
          item.ips.shift();
        }
        if (item.hostname && extra.hostname) {
          item.hostname.push(extra.hostname);
          if (item.hostname.length > 20) {
            item.hostname.shift();
          }
        }
      } else {
        const obj = _.pick(geoInfo, ['as', 'city', 'country', 'lat', 'org', 'regionName']);
        obj['ips'] = [query];
        obj['lng'] = lng;
        this._store.push(Object.assign({}, obj, extra));
        if (this._store.length > MAX_QUEUE_SIZE) {
          this._store.shift();
        }
      }
    } catch (err) {
      logger.error(err.message);
      this._uniqueKeys.delete(arg);
    }
  }

  // return all resolved ip and its geo location
  getStore() {
    return this._store;
  }

  clear() {
    this._uniqueKeys.clear();
    this._store = [];
  }

}

module.exports = GeoIP;
