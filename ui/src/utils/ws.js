import io from 'socket.io-client';
import toast from './toast';
import store from './store';
import { TOKEN_NAME, RPC_STATUS_ERROR, RPC_STATUS_OFFLINE, RPC_STATUS_ONLINE } from '../constants';

const ws = io.connect('/', {
  query: {
    token: localStorage.getItem(TOKEN_NAME) || '',
  },
});

ws.on('connect', function onConnect() {
  store.rpcStatus = RPC_STATUS_ONLINE;
});

ws.on('connect_error', () => {
  store.rpcStatus = RPC_STATUS_OFFLINE;
});

ws.on('reconnecting', (attempts) => {
  if (attempts >= 10) {
    ws.close();
    store.rpcStatus = RPC_STATUS_ERROR;
  }
});

ws.on('reconnect_failed', () => {
  store.rpcStatus = RPC_STATUS_ERROR;
});

ws.on('pong', (latency) => {
  store.rpcLatency = latency;
});

ws.on('error', (message) => {
  switch (message) {
    case 'authentication error':
      const { pathname } = window.location;
      if (pathname !== '/landing') {
        toast({
          message: 'authentication error, taking you to verify page...',
          intent: 'danger',
          timeout: 1000,
          onDismiss() {
            window.location.replace('/landing');
          },
        });
      }
      break;
    default:
      console.error(message);
      break;
  }
});

export default ws;
