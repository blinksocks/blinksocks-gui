import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { TagInput } from '@blueprintjs/core';

import AddressEditor from './AddressEditor/AddressEditor';

import styles from './ClientEditor.module.css';

export default class ClientEditor extends React.Component {

  static propTypes = {
    client: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: (/* client */) => {
    },
  };

  static getDerivedStateFromProps({ client }) {
    return client;
  }

  state = {
    service: '',
    dns: [],
    dns_expire: 3600,
    timeout: 200,
    log_path: '',
    log_level: '',
    log_max_days: 30,
  };

  _isAdvancedShow = false;

  onChange = () => {
    this.props.onChange(this.state);
  };

  onToggleAdvanced = () => {
    this._isAdvancedShow = !this._isAdvancedShow;
    this.forceUpdate();
  };

  onAddressChange = (address) => {
    this.setState({ service: address }, this.onChange);
  };

  onLogPathChange = (e) => {
    this.setState({ log_path: e.target.value }, this.onChange);
  };

  onLogLevelChange = (e) => {
    this.setState({ log_level: e.target.value }, this.onChange);
  };

  onLogMaxDaysChange = (e) => {
    this.setState({ log_max_days: e.target.value | 0 }, this.onChange);
  };

  onTimeoutChange = (e) => {
    this.setState({ timeout: e.target.value | 0 }, this.onChange);
  };

  onDnsChange = (servers) => {
    this.setState({ dns: servers }, this.onChange);
  };

  onDnsExpireChange = (e) => {
    this.setState({ dns_expire: e.target.value | 0 }, this.onChange);
  };

  render() {
    const { service, log_path, log_level, log_max_days } = this.state;
    const { timeout, dns, dns_expire } = this.state;
    return (
      <div className={styles.container}>
        <section>
          <h5>Address</h5>
          <AddressEditor
            address={service}
            protocols={['socks5', 'socks4', 'socks4a', 'http']}
            onChange={this.onAddressChange}
          />
        </section>
        <section>
          <h5>Log Path</h5>
          <input
            type="text"
            className="pt-input"
            placeholder="log_path"
            value={log_path}
            onChange={this.onLogPathChange}
          />
        </section>
        <button
          className={classnames(
            'pt-button pt-fill pt-minimal',
            {
              'pt-active': this._isAdvancedShow,
              'pt-icon-chevron-up': this._isAdvancedShow,
              'pt-icon-chevron-down': !this._isAdvancedShow,
            },
            styles.advanced
          )}
          onClick={this.onToggleAdvanced}>
          Advanced
        </button>
        {this._isAdvancedShow && (
          <>
            <section>
              <h5>Log Level</h5>
              <div className="pt-select">
                <select value={log_level} onChange={this.onLogLevelChange}>
                  <option disabled defaultValue="">Log Level...</option>
                  {['error', 'debug', 'verbose', 'warn', 'info', 'silly'].map((level, i) => (
                    <option key={i} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </section>
            <section>
              <h5>Log Max Days</h5>
              <input
                type="number"
                className="pt-input"
                min="1"
                value={log_max_days}
                onChange={this.onLogMaxDaysChange}
              />
            </section>
            <section>
              <h5>Timeout</h5>
              <input
                type="number"
                className="pt-input"
                placeholder="timeout"
                value={timeout}
                onChange={this.onTimeoutChange}
              />
            </section>
            <section>
              <h5>DNS Servers</h5>
              <TagInput
                leftIcon="multi-select"
                placeholder="dns servers"
                values={dns}
                onChange={this.onDnsChange}
              />
            </section>
            <section>
              <h5>DNS Expire</h5>
              <input
                type="number"
                className="pt-input"
                min="1"
                value={dns_expire}
                onChange={this.onDnsExpireChange}
              />
            </section>
          </>
        )}
      </div>
    );
  }

}
