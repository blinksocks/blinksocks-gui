import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import classnames from 'classnames';
import { Switch, TagInput } from '@blueprintjs/core';

import Tooltip from './ToolTip/ToolTip';
import AddressEditor from './AddressEditor/AddressEditor';
import ProtocolStackEditor from './ProtocolStatckEditor/ProtocolStackEditor';

import styles from './Editor.module.css';

export default class ServerEditor extends React.Component {

  static propTypes = {
    isClient: PropTypes.bool.isRequired,
    server: PropTypes.object.isRequired,
    defs: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: (/* server */) => {
    },
  };

  static getDerivedStateFromProps({ server }) {
    return {
      ...omit(server, 'key'),
      secretKey: server.key,
    };
  }

  state = {
    service: '',
    secretKey: '',
    presets: [],
    mux: false,
    // client only
    mux_concurrency: 10,
    // server only
    redirect: '',
    tls_key: '',
    tls_cert: '',
    acl: false,
    acl_conf: '',
    dns: [],
    dns_expire: 3600,
    timeout: 200,
    log_path: '',
    log_level: '',
    log_max_days: 30,
  };

  _isShowPassword = false;

  _isAdvancedShow = false;

  $password = null;

  onChange = () => {
    if (this.props.isClient) {
      const { service, secretKey, presets, mux, mux_concurrency } = this.state;
      this.props.onChange({
        service,
        key: secretKey,
        presets,
        mux,
        mux_concurrency,
      });
    } else {
      this.props.onChange({
        ...omit(this.state, 'secretKey'),
        key: this.state.secretKey,
      });
    }
  };

  onServiceChange = (address) => {
    this.setState({ service: address }, this.onChange);
  };

  onSecretKeyChange = (e) => {
    this.setState({ secretKey: e.target.value }, this.onChange);
  };

  onTLSKeyChange = (e) => {
    this.setState({ tls_key: e.target.value }, this.onChange);
  };

  onTLSCertChange = (e) => {
    this.setState({ tls_cert: e.target.value }, this.onChange);
  };

  onTogglePasswordView = () => {
    this._isShowPassword = !this._isShowPassword;
    this.$password.focus();
    this.forceUpdate();
  };

  onAddPreset = (preset) => {
    this.setState({
      presets: this.state.presets.concat([preset]),
    }, this.onChange);
  };

  onEditPreset = (presetIndex, preset) => {
    this.setState({
      presets: this.state.presets.map(
        (ps, i) => i === presetIndex ? preset : ps
      ),
    }, this.onChange);
  };

  onCopyPreset = (presetIndex) => {
    const { presets } = this.state;
    this.setState({
      presets: presets.concat([cloneDeep(presets[presetIndex])]),
    }, this.onChange);
  };

  onRemovePreset = (presetIndex) => {
    this.setState({
      presets: this.state.presets.filter((preset, i) => i !== presetIndex),
    }, this.onChange);
  };

  onSortPresets = (presets) => {
    this.setState({ presets }, this.onChange);
  };

  onToggleMux = (e) => {
    this.setState({ mux: e.target.checked }, this.onChange);
  };

  onMuxConcurrencyChange = (e) => {
    this.setState({ mux_concurrency: e.target.value | 0 }, this.onChange);
  };

  onRedirectChange = (e) => {
    this.setState({ redirect: e.target.value }, this.onChange);
  };

  onToggleACL = () => {
    this.setState({ acl: !this.state.acl }, this.onChange);
  };

  onACLConfChange = (e) => {
    this.setState({ acl_conf: e.target.value }, this.onChange);
  };

  onToggleAdvanced = () => {
    this._isAdvancedShow = !this._isAdvancedShow;
    this.forceUpdate();
  };

  onDnsChange = (servers) => {
    this.setState({ dns: servers }, this.onChange);
  };

  onDnsExpireChange = (e) => {
    this.setState({ dns_expire: e.target.value | 0 }, this.onChange);
  };

  onTimeoutChange = (e) => {
    this.setState({ timeout: e.target.value | 0 }, this.onChange);
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

  // renders

  renderTLSConf = () => {
    const { isClient } = this.props;
    const { tls_key, tls_cert } = this.state;
    return (
      <>
        {!isClient && (
          <section>
            <h5>TLS Key Name</h5>
            <input
              className="pt-input"
              placeholder="key.pem"
              value={tls_key}
              onChange={this.onTLSKeyChange}
            />
          </section>
        )}
        <section>
          <h5>TLS Cert Name</h5>
          <input
            className="pt-input"
            placeholder="cert.pem"
            value={tls_cert}
            onChange={this.onTLSCertChange}
          />
        </section>
      </>
    );
  };

  renderClientSideOnly = () => {
    const { mux, mux_concurrency } = this.state;
    return (
      <>
        <h3>MUX</h3>
        <section>
          <h5>Multiplexing</h5>
          <div className="pt-control-group">
            <Switch
              inline
              className="pt-large"
              checked={mux}
              onChange={this.onToggleMux}
            />
          </div>
          {mux && (
            <div>
              <h6>Mux Concurrency</h6>
              <input
                type="number"
                className="pt-input"
                min="1"
                placeholder="mux concurrency"
                value={mux_concurrency}
                onChange={this.onMuxConcurrencyChange}
              />
            </div>
          )}
        </section>
      </>
    );
  };

  renderServerSideOnly = () => {
    const { redirect, acl, acl_conf, mux } = this.state;
    const { log_path, log_level, log_max_days, dns, dns_expire, timeout } = this.state;
    return (
      <>
        <h3>Log</h3>
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
        <h3>DNS</h3>
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
        <h3>Access Control</h3>
        <section>
          <h5>ACL</h5>
          <Switch
            inline
            className="pt-large"
            checked={acl}
            onChange={this.onToggleACL}
          />
          {acl && (
            <section>
              <h5>ACL Config</h5>
              <input
                type="text"
                className="pt-input"
                placeholder="acl_conf"
                value={acl_conf}
                onChange={this.onACLConfChange}
              />
            </section>
          )}
        </section>
        <h3>Others</h3>
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
          <h5>
            Redirect
            <Tooltip content="A redirect target when any preset failed. e.g, example.com:80"/>
          </h5>
          <input
            type="text"
            className="pt-input"
            placeholder="redirect"
            value={redirect}
            onChange={this.onRedirectChange}
          />
        </section>
        <section>
          <h5>Multiplexing</h5>
          <div className="pt-control-group">
            <Switch
              inline
              className="pt-large"
              checked={mux}
              onChange={this.onToggleMux}
            />
          </div>
        </section>
      </>
    );
  };

  render() {
    const { isClient, defs } = this.props;
    const { service, secretKey, presets } = this.state;
    const isShowPassword = this._isShowPassword;
    return (
      <div className={styles.container}>
        <section>
          <h5>Address</h5>
          <AddressEditor
            address={service}
            protocols={['tcp', 'ws', 'tls']}
            onChange={this.onServiceChange}
          />
        </section>
        {service.startsWith('tls://') && this.renderTLSConf()}
        <section>
          <h5>Secret Key<Tooltip content="A master key for encryption and decryption."/></h5>
          <div className="pt-input-group">
            <input
              ref={(dom) => this.$password = dom}
              type={isShowPassword ? 'text' : 'password'}
              className="pt-input"
              placeholder="secret key"
              value={secretKey}
              onChange={this.onSecretKeyChange}
            />
            <button
              className={classnames(
                'pt-button pt-minimal pt-intent-warning',
                isShowPassword ? 'pt-icon-unlock' : 'pt-icon-lock'
              )}
              onClick={this.onTogglePasswordView}
            />
          </div>
        </section>
        <section>
          <h5>Protocol Stack<Tooltip content="An ordered preset list which build a specific protocol stack."/></h5>
          <ProtocolStackEditor
            presets={presets}
            defs={defs}
            onAddPreset={this.onAddPreset}
            onEditPreset={this.onEditPreset}
            onCopyPreset={this.onCopyPreset}
            onRemovePreset={this.onRemovePreset}
            onSortPresets={this.onSortPresets}
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
            {isClient ? this.renderClientSideOnly() : this.renderServerSideOnly()}
          </>
        )}
      </div>
    );
  }

}
