import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './UserItem.module.css';

export default class UserItem extends React.Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: (/* user */) => {
    },
  };

  $password = null;

  state = {
    user: null,
    isShowPassword: false,
  };

  static getDerivedStateFromProps({ user }) {
    return { user };
  }

  onChange = () => {
    this.props.onChange(this.state.user);
  };

  onPasswordChange = (e) => {
    this.setState({
      user: {
        ...this.state.user,
        password: e.target.value
      },
    }, this.onChange);
  };

  onTogglePasswordView = () => {
    this.setState({ isShowPassword: !this.state.isShowPassword });
    this.$password.focus();
  };

  onToggleMethod = (e, _name) => {
    const { user: { methods } } = this.state;
    const checked = e.target.checked;
    this.setState({
      user: {
        ...this.state.user,
        methods: methods.map(({ name, active }) => ({
          name,
          active: name === _name ? checked : active,
        })),
      },
    }, this.onChange);
  };

  render() {
    const { user, isShowPassword } = this.state;
    return (
      <div className={styles.container}>
        <div className={classnames('pt-form-group', styles.password)}>
          <label className="pt-label" htmlFor="example-form-group-input-b">
            <b>Password</b>
          </label>
          <div className="pt-form-content">
            <div className="pt-input-group">
              <input
                ref={(dom) => this.$password = dom}
                type={isShowPassword ? 'text' : 'password'}
                className="pt-input"
                placeholder="type password here"
                value={user && user.password}
                onChange={this.onPasswordChange}
              />
              <button
                className={classnames(
                  'pt-button pt-minimal pt-intent-warning',
                  isShowPassword ? 'pt-icon-unlock' : 'pt-icon-lock'
                )}
                onClick={this.onTogglePasswordView}
              />
            </div>
          </div>
        </div>
        <div className="pt-form-group">
          <label className="pt-label" htmlFor="example-form-group-input-b">
            <b>Method Access</b>
          </label>
          <div className={classnames('pt-form-content', styles.methods)}>
            {user && user.methods.map(({ name, active }) => (
              <label key={name} title={name} className="pt-control pt-checkbox">
                <input type="checkbox" checked={active} onChange={(e) => this.onToggleMethod(e, name)}/>
                <span className="pt-control-indicator"/>
                {name}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

}
