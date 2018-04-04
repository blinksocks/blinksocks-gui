import call from './rpc';
import ws from './ws';
import { KEEPALIVE_INTERVAL } from '../constants';

const SERVER_PUSH_REGISTER_SUCCESS = 0;
const SERVER_PUSH_REGISTER_ERROR = 1;

export default async function live(method, args, callback) {
  // refine arguments
  if (typeof args === 'function') {
    callback = args;
    args = {};
  }

  // a timer for keepalive
  let timer = null;

  function onServerPush(response) {
    console.log(new Date().toISOString(), '[PUSH]', `[${method}]`, response);
    // reset timer
    // if (timer) {
    //   window.clearInterval(timer);
    //   timer = window.setInterval(keepalive, KEEPALIVE_INTERVAL);
    // }
    // handle message
    callback(response);
  }

  // listening for server push before send register request
  ws.on(method, onServerPush);

  // register a server push method
  const { code } = await call('_register_server_push', { method, args });
  switch (code) {
    case SERVER_PUSH_REGISTER_SUCCESS:
      break;
    case SERVER_PUSH_REGISTER_ERROR:
      ws.off(method, onServerPush);
      break;
    default:
      throw Error(`unknown register response status code: ${code}`);
  }

  async function keepalive() {
    try {
      await call('_keepalive_server_push', { method });
    } catch (err) {
      await unlive();
    }
  }

  // setup keepalive timer
  timer = window.setInterval(keepalive, KEEPALIVE_INTERVAL);

  // return a function to unregister server push
  async function unlive() {
    window.clearInterval(timer);
    ws.off(method, onServerPush);
    await call('_unregister_server_push', { method });
  }

  return unlive;
}
