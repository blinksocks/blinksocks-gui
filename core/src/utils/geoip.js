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

    // ignore private ipv4
    if (isPrivateIP(ip)) {
      return;
    }

    try {
      const geoInfo = await getGeoInfo(ip);
      if (!this._store.get(ip)) {
        return this._store.set(ip, Object.assign({}, _.omit(geoInfo, 'status'), extra));
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
  }

};
