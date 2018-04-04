const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const rewireMobX = require('react-app-rewire-mobx');

module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env);
  config = rewireMobX(config, env);
  return config;
};
