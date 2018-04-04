module.exports = async function keepalive_server_push({ method }) {
  const handler = this.ctx.push_handlers[method];
  if (handler) {
    handler.keepalive();
  } else {
    throw Error(`method "${method}" is not found or was unregistered`);
  }
};
