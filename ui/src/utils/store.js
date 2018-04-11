import { observable } from 'mobx';
import { RPC_STATUS_INIT, SERVICE_STATUS_INIT, SERVICE_STATUS_RUNNING } from '../constants';

const store = observable({

  // global environment variables
  env: observable.map({}),

  // global websocket status
  rpcStatus: RPC_STATUS_INIT,

  // global websocket latency in ms
  rpcLatency: 0,

  // services
  services: observable.map({
    // <uuid>: {
    //   status: SERVICE_XXX,
    //   connections: 0,
    //   total_download_bytes: 0,
    //   total_upload_bytes: 0,
    //   download_speed: 0,
    //   upload_speed: 0,
    // },
    // ...
  }),

  // custom methods
  isServiceRunning(id) {
    return this.getServiceStatusById(id) === SERVICE_STATUS_RUNNING;
  },
  getServiceStatusById(id) {
    return !this.services[id] ? SERVICE_STATUS_INIT : this.services[id].status;
  },

});

if (process.env.NODE_ENV === 'development') {
  window.store = store;
}

export default store;
