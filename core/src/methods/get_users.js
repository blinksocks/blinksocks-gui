const _ = require('lodash');
const { DESENSITIZE_PLACEHOLDER } = require('../constants');

function merge(method_mapping, disallowed_methods) {
  for (const name of disallowed_methods) {
    method_mapping[name] = false;
  }
  return _.transform(method_mapping, (result, value, key) => result.push({
    name: key,
    active: !!value,
  }), []);
}

module.exports = async function get_users() {
  return this.db
    .get('users')
    .map(({ id, name, password, disallowed_methods }) => {
      const method_mapping = _.transform(this.getConfigurableMethods(), (result, name) => result[name] = true, {});
      return {
        id,
        name,
        password: DESENSITIZE_PLACEHOLDER,
        methods: merge(method_mapping, disallowed_methods || [])
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
    .value();
};
