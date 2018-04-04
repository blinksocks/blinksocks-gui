module.exports = async function unregister_server_push({ method }) {
  const handler = this.ctx.push_handlers[method];
  if (handler) {
    await handler.dispose();
  }
};
