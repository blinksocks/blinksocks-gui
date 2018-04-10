const fs = require('fs');
const path = require('path');
const http = require('http');
const utils = require('util');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const staticCache = require('koa-static-cache');
const favicon = require('koa-favicon');
const bodyParser = require('koa-bodyparser');
const setupWebsocket = require('./ws');

const { logger, db } = require('../utils');
const { RUNTIME_LOG_PATH, RUN_TYPE_SERVER } = require('../constants');

const readdir = utils.promisify(fs.readdir);

// http interfaces

async function onPostVerify(ctx) {
  const { token } = ctx.request.body;
  if (!db.get('users').find({ password: token }).value()) {
    return ctx.throw(403, 'authentication error');
  }
  ctx.status = 200;
}

async function onGetLog(ctx) {
  const { file } = ctx.params;
  if (!/^[0-9a-z\-]{36}\.log\.\d{4}-\d{2}-\d{2}$/.test(file)) {
    return ctx.throw(400, 'invalid parameter');
  }
  const files = await readdir(RUNTIME_LOG_PATH);
  const name = files.find(name => name === file);
  if (!name) {
    return ctx.throw(404);
  }
  ctx.set('content-type', 'text/plain');
  ctx.body = fs.createReadStream(path.join(RUNTIME_LOG_PATH, name));
}

module.exports = async function startServer(args) {
  const { runType, port } = args;

  // start koa server
  const app = new Koa();
  const router = new KoaRouter();
  const server = http.createServer(app.callback());

  // websocket setup
  setupWebsocket(server, args);

  // standalone http interfaces
  router.post('/verify', onPostVerify);
  router.get('/logs/:file', onGetLog);

  const publicPath = path.join(__dirname, '../../public');
  app.use(favicon(path.join(publicPath, 'favicon.ico')));
  app.use(staticCache(publicPath, {
    alias: {
      '/': '/index.html',
      '/landing': '/index.html',
    },
  }));
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  const _port = port || 3000;
  server.listen(_port, () => {
    logger.info(`blinksocks gui ${runType === RUN_TYPE_SERVER ? 'server' : 'client'} is running at ${_port}.`);
    logger.info('You can now open blinksocks-gui in browser:');
    console.log('');
    console.log(`  http://localhost:${_port}/`);
    console.log('');
  });
};
