const path = require('path');
const { import_dir } = require('../utils');

const {
  SERVER_PUSH_REGISTER_SUCCESS,
  SERVER_PUSH_REGISTER_ERROR,
  SERVER_PUSH_DISPOSE_TIMEOUT,
} = require('../constants');

const lives = import_dir(path.join(__dirname, '..', 'lives'));

module.exports = async function register_server_push({ method, args }) {
  const { push_handlers } = this.ctx;
  if (push_handlers[method]) {
    return { code: SERVER_PUSH_REGISTER_ERROR, message: `method "${method}" is already registered` };
  }

  const func = lives[method];
  if (typeof func !== 'function') {
    throw Error(`live method "${method}" is not implemented or not registered`);
  }

  // keepalive timer
  let timer = null;

  // interval timers
  let interval_timers = [];

  // prepare a new thisArgs for live methods
  const push = this.push;
  const thisArgs = Object.assign({}, this, {
    push(data) {
      // keepalive();
      push(method, data);
    },
    pushInterval(getData, interval) {
      if (typeof getData !== 'function') {
        throw Error('"getData" must be a function');
      }
      const tick = async () => {
        try {
          this.push(await getData());
        } catch (err) {
          console.error(err);
        }
      };
      tick();
      const tm = setInterval(tick, interval);
      interval_timers.push(tm);
    },
  });
  const unregister = await func.call(thisArgs, args, {});

  // set a timeout here in case the client doesn't call _unregister_server_push()
  timer = setTimeout(dispose, SERVER_PUSH_DISPOSE_TIMEOUT);

  // remember to remove this handler from ctx.push_handlers after unregister()
  async function dispose() {
    clearTimeout(timer);
    interval_timers.forEach(clearTimeout);
    if (typeof unregister === 'function') {
      await unregister();
    }
    delete push_handlers[method];
  }

  // reset timeout timer
  function keepalive() {
    if (timer) {
      clearTimeout(timer);
      timer = setTimeout(dispose, SERVER_PUSH_DISPOSE_TIMEOUT);
    }
  }

  // put it to ctx so that it can be accessed from
  // _keepalive_server_push() and _unregister_server_push()
  push_handlers[method] = {
    // this function should be called in _keepalive_server_push()
    keepalive,
    // this function should be called in _unregister_server_push()
    dispose,
  };

  return { code: SERVER_PUSH_REGISTER_SUCCESS };
};
