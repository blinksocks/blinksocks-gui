const path = require('path');
const _ = require('lodash');
const Router = require('./router');
const { RUN_TYPE_CLIENT, RUN_TYPE_SERVER } = require('../constants');
const { logger, db, import_dir } = require('../utils');

const ALL_METHODS = Object.assign(
  {},
  import_dir(path.resolve(__dirname, '../methods')),
  import_dir(path.resolve(__dirname, '../lives')),
);

// create "this" for each method
function createThisArg({ socket, runType }) {
  const { user, address } = socket.handshake;

  function extendDB(db) {
    db.getConfigs = () => {
      const key = {
        [RUN_TYPE_CLIENT]: 'client_configs',
        [RUN_TYPE_SERVER]: 'server_configs',
      }[runType];
      return db.get(key);
    };
    return db;
  }

  const _this = {
    ctx: {
      runType,
      push_handlers: {}, // used by _xxx_server_push().
    },
    user: user || null,
    db: extendDB(db),
    getConfigurableMethods() {
      const methods = _.transform(ALL_METHODS, (result, _, key) => result.push(key), []);
      return methods.filter((name) => name[0] !== '_');
    },
    getDisallowedMethods() {
      return user['disallowed_methods'] || [];
    },
    push(event, data) {
      logger.info(`[${address}] [PUSH] ${JSON.stringify(data)}`);
      socket.emit(event, data);
    },
    invoke(method, args, extra) {
      return Router.dispatch.call(_this, method, args, extra);
    },
  };
  return _this;
}

// once websocket connection established
function onConnection(socket, { runType }) {
  const { address } = socket.handshake;
  logger.verbose(`[${address}] connected`);

  const thisArg = createThisArg({ socket, runType });

  // handle client requests
  socket.on('request', async function (req, send) {
    const reqStr = JSON.stringify(req);
    logger.info(`[${address}] request => ${reqStr}`);
    const { method, args } = req;
    try {
      const result = await Router.dispatch.call(thisArg, method, args);
      const response = { code: 0 };
      if (result !== null) {
        response.data = result;
      }
      logger.info(`[${address}] response => ${JSON.stringify(response)}`);
      send(response);
    } catch (err) {
      logger.error(`[${address}] cannot process the request: ${reqStr}, %s`, err.stack);
      send({ code: -1, message: err.message });
    }
  });

  socket.on('disconnect', async function () {
    logger.verbose(`[${address}] disconnected`);
    try {
      const { push_handlers } = thisArg.ctx;
      for (const key of Object.keys(push_handlers)) {
        await push_handlers[key].dispose();
      }
    } catch (err) {
      // ignore any errors
      // console.log(err);
    }
  });
}

module.exports = function setup(server, args) {
  const io = require('socket.io')(server);

  // ws authentication middleware
  io.use((socket, next) => {
    const { query: { token } } = socket.handshake;
    const user = db.getWrappedUsers().find((user) => user.token === token);
    if (user) {
      // NOTE: put user to socket.handshake so that
      // we can access it again in onConnection().
      socket.handshake.user = user;
      return next();
    }
    return next(new Error('authentication error'));
  });

  // handle ws connections
  io.on('connection', (socket) => onConnection(socket, args));
};
