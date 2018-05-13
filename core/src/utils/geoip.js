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

module.exports = {

  _uniqueKeys: new Set(),

  _store: new Map(/* <ip>: <result> */),

  // lookup ip address to geo location
  async put(arg, extra = {}) {
    if (typeof arg !== 'string') {
      return;
    }

    if (this._uniqueKeys.has(arg)) {
      return;
    } else {
      this._uniqueKeys.add(arg);
    }

    let hostname, ip;

    if (net.isIP(arg)) {
      hostname = '';
      ip = arg;
    } else {
      hostname = arg;
      ip = await lookup(arg);
    }

    // ignore private ip
    if (isPrivateIP(ip)) {
      return;
    }

    try {
      const geoInfo = await getGeoInfo(ip);
      const { lat, lon: lng, query } = geoInfo;
      if (!this._store.get(ip)) {
        // merge hostname and ip by the same geo location
        const item = this.findItemByPosition(lat, lng);
        if (item) {
          const oldValue = item.value;
          const newValue = {
            ...oldValue,
            ips: oldValue.ips.concat([query]),
          };
          if (oldValue.hostname && extra.hostname) {
            newValue.hostname = oldValue.hostname.concat([extra.hostname]);
          }
          this._store.set(item.key, newValue);
        } else {
          const obj = _.pick(geoInfo, ['as', 'city', 'country', 'lat', 'org', 'regionName']);
          obj['ips'] = [query];
          obj['lng'] = lng;
          this._store.set(ip, Object.assign({}, obj, extra));
        }
        return;
      }
    } catch (err) {
      logger.error(err.message);
    }
    this._uniqueKeys.delete(arg);
  },

  // return all resolved ip and its geo location
  getStore() {
    return this._store;
  },

  clear() {
    this._uniqueKeys.clear();
    this._store.clear();
  },

  findItemByPosition(lat, lng) {
    for (const [key, value] of this._store) {
      if (lat === value.lat && lng === value.lng) {
        return { key, value };
      }
    }
    return null;
  },

};
