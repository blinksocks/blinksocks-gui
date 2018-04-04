import React from 'react';
import classnames from 'classnames';
import qs from 'querystring';
import { Icon } from '@blueprintjs/core';
import { TOKEN_NAME, HASH_SALT } from '../../constants';
import Github from '../../components/Github/Github';
import { hash } from '../../utils';
import styles from './Landing.module.css';

export default class Landing extends React.Component {

  state = {
    password: '',
    fail: false,
  };

  $input = null;

  componentDidMount() {
    const { password } = qs.parse(window.location.search.substr(1));
    if (password) {
      this.setState({ password }, this.onSignIn);
    }
  }

  onPasswordChange = (e) => {
    this.setState({ password: e.target.value, fail: false });
  };

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.onSignIn();
    }
  };

  onSignIn = async () => {
    const { password } = this.state;
    if (password !== '') {
      try {
        const token = hash('SHA-256', password + HASH_SALT);
        const response = await window.fetch('/verify', {
          method: 'POST',
          body: JSON.stringify({ token }),
          headers: new Headers({
            'content-type': 'application/json',
          }),
        });
        if (response.status === 200) {
          localStorage.setItem(TOKEN_NAME, token);
          window.location.href = '/';
        } else {
          this.setState({ fail: true });
          this.$input.select();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      this.$input.focus();
    }
  };

  render() {
    const { password, fail } = this.state;
    return (
      <div className={styles.container}>
        <Github url="https://github.com/blinksocks/blinksocks-gui"/>
        <div className={styles.background}/>
        <div className={styles.content}>
          <h3>blinksocks gui</h3>
          <div className={styles.input}>
            <Icon icon="lock" iconSize={30}/>
            <input
              autoFocus
              type="password"
              placeholder="enter password here..."
              className={classnames({ [styles.fail]: fail })}
              ref={(dom) => this.$input = dom}
              onKeyPress={this.onKeyPress}
              onChange={this.onPasswordChange}
              value={password}
            />
            <button type="button" onClick={this.onSignIn}>Login</button>
          </div>
          <small style={{ visibility: fail ? 'visible' : 'hidden' }}>password is invalid</small>
        </div>
      </div>
    );
  }

}
