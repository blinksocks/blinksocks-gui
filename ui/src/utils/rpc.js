import NProgress from 'nprogress';
import ws from './ws';
import store from './store';
import toast from './toast';
import { RPC_TIMEOUT, SERVICE_STATUS_INIT, RPC_STATUS_ONLINE } from '../constants';

const cacheStorage = {};

function getCache(request) {
  try {
    const key = JSON.stringify(request);
    const value = cacheStorage[key];
    if (typeof value !== 'undefined') {
      return value;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function setCache(request, data) {
  try {
    const key = JSON.stringify(request);
    cacheStorage[key] = data;
  } catch (err) {
    // ignore
  }
}

function createRequest(method, args) {
  if (typeof method !== 'string' || method === '') {
    throw Error('method is invalid');
  }
  const request = { method };
  if (typeof args !== 'undefined' && args !== null) {
    request.args = args;
  }
  return request;
}

export default async function rpc(method, args, options) {
  const { cache = false, showProgress = false, timeout = RPC_TIMEOUT } = options || {};

  if (store.rpcStatus !== SERVICE_STATUS_INIT && store.rpcStatus !== RPC_STATUS_ONLINE) {
    throw Error('rpc service is offline');
  }

  const request = createRequest(method, args);

  // return directly if cached
  let cachedValue;
  if (cache && (cachedValue = getCache(request)) !== null) {
    return cachedValue;
  }

  return new Promise((resolve, reject) => {
    console.log(new Date().toISOString(), '[request]', request);
    showProgress && NProgress.start();

    let isTimeout = false;

    function onTimeout() {
      if (store.rpcStatus !== RPC_STATUS_ONLINE && !showProgress) {
        // prevent timeout toast when it's not online
        return;
      }
      const hint = `method "${method}" timeout`;
      isTimeout = true;
      showProgress && NProgress.done();
      toast(hint, 'warning');
      reject(Error(hint));
    }

    // timeout timer
    const timer = window.setTimeout(onTimeout, timeout);

    ws.emit('request', request, (response) => {
      if (isTimeout) {
        // drop response returned after timeout
        return;
      }
      console.log(new Date().toISOString(), '[response]', response);
      clearTimeout(timer);
      showProgress && NProgress.done();
      const { code, data, message } = response;
      if (code === 0) {
        if (cache) {
          setCache(request, data);
        }
        resolve(data);
      } else {
        const msg = `Server Respond Error: ${message || 'unknown error'}`;
        toast(msg, 'warning');
        reject(Error(msg));
      }
    });
  });
}
