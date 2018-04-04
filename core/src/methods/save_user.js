const { DESENSITIZE_PLACEHOLDER } = require('../constants');

module.exports = async function save_user({ user }) {
  if (!user || typeof user !== 'object') {
    throw Error('invalid parameter');
  }

  // strict check
  const { id, name, password, methods } = user;
  if (typeof name !== 'string' || name.length < 1) {
    throw Error('name is invalid');
  }
  if (typeof password !== 'string' || password.length < 1) {
    throw Error('password is invalid');
  }
  if (!Array.isArray(methods)) {
    throw Error('methods is invalid');
  }

  // all exist method names
  const method_names = this.getConfigurableMethods();
  for (const method of methods) {
    const { name, active } = method;
    if (!method_names.includes(name)) {
      throw Error(`method: "${name}" is not allowed here`);
    }
    if (typeof active !== 'boolean') {
      throw Error('active is invalid');
    }
  }

  const _user = this.db.get('users').find({ id }).value();
  if (!_user) {
    throw Error(`user "${name}" is not exist`);
  }

  this.db.get('users').find({ id }).assign({
    name: name,
    password: password === DESENSITIZE_PLACEHOLDER ? _user.password : password,
    disallowed_methods: methods.filter(({ active }) => !active).map(({ name }) => name),
  }).write();
};
