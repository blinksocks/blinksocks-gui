const { hash_password } = require('../utils');

module.exports = async function add_user({ user }) {
  if (typeof user !== 'object') {
    throw Error('invalid parameter');
  }

  const { name, password } = user;
  if (typeof name !== 'string' || name.length < 1) {
    throw Error('username is invalid');
  }
  if (typeof password !== 'string' || password.length < 1) {
    throw Error('password is invalid');
  }

  if (this.db.get('users').find({ name }).value()) {
    throw Error('user is already exists');
  }

  this.db.get('users').insert({
    name: name,
    password: hash_password(password),
    disallowed_methods: [],
  }).write();
};
