import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classnames from 'classnames';
import { Switch } from '@blueprintjs/core';

import Tooltip from './components/ToolTip';
import AddressEditor from './components/AddressEditor';
import ProtocolStackEditor from './components/ProtocolStackEditor';
import CommonEditor from './components/CommonEditor';

import styles from './ServerEditor.module.css';

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
    commons: {},

    isShowPassword: false,
  };

  $password = null;

  constructor(props) {
    super(props);
    this.state = {
      ...this.props.server,
      secretKey: this.props.server.key,
      commons: _.pick(this.props.server, [
        'dns', 'dns_expire', 'timeout',
        'log_path', 'log_level', 'log_max_days',
      ]),
    };
  }

  onChange = () => {
    const { isClient } = this.props;
    const { service, secretKey, presets, mux, mux_concurrency } = this.state;
    const { commons, redirect, tls_key, tls_cert, acl, acl_conf } = this.state;
    const config = {
      service,
      key: secretKey,
      presets,
      mux,
    };
    if (isClient) {
      config['mux_concurrency'] = mux_concurrency;
    } else {
      Object.assign(config, commons, {
        redirect,
        tls_key,
        tls_cert,
        acl,
        acl_conf,
      });
    }
    this.props.onChange(config);
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
    this.setState({ isShowPassword: !this.state.isShowPassword });
    this.$password.focus();
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
      presets: presets.concat([_.cloneDeep(presets[presetIndex])]),
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

  onCommonsChange = (commons) => {
    this.setState({ commons }, this.onChange);
  };

  render() {
    const { isClient, defs } = this.props;
    const { isShowPassword } = this.state;
    const { service, secretKey, presets, mux, mux_concurrency } = this.state;
    const { commons, redirect, tls_key, tls_cert, acl, acl_conf } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.subitem}>
          <h5>Address</h5>
          <AddressEditor
            address={service}
            protocols={['tcp', 'ws', 'tls']}
            onChange={this.onServiceChange}
          />
        </div>
        {service.startsWith('tls://') && (
          <>
            {!isClient && (
              <div className={styles.subitem}>
                <h5>TLS Key Name</h5>
                <input
                  className="pt-input"
                  placeholder="key.pem"
                  value={tls_key}
                  onChange={this.onTLSKeyChange}
                />
              </div>
            )}
            <div className={styles.subitem}>
              <h5>TLS Cert Name</h5>
              <input
                className="pt-input"
                placeholder="cert.pem"
                value={tls_cert}
                onChange={this.onTLSCertChange}
              />
            </div>
          </>
        )}
        <div className={styles.subitem}>
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
        </div>
        <div className={styles.subitem}>
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
        </div>
        <div className={styles.subitem}>
          <h5>Multiplexing</h5>
          <div className="pt-control-group">
            <Switch
              inline
              className="pt-large"
              checked={mux}
              onChange={this.onToggleMux}
            />
          </div>
          {mux && isClient && (
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
        </div>
        {!isClient && (
          <div>
            <div className={styles.subitem}>
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
            </div>
            <div className={styles.subitem}>
              <h5>ACL</h5>
              <Switch
                inline
                className="pt-large"
                checked={acl}
                onChange={this.onToggleACL}
              />
            </div>
            {acl && (
              <div className={styles.subitem}>
                <h5>ACL Config</h5>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="acl_conf"
                  value={acl_conf}
                  onChange={this.onACLConfChange}
                />
              </div>
            )}
            <CommonEditor
              commons={commons}
              onChange={this.onCommonsChange}
            />
          </div>
        )}
      </div>
    );
  }

}
