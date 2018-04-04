import React from 'react';
import { Button, RadioGroup, Radio, Intent } from '@blueprintjs/core';
import styles from './SystemProxy.module.css';

import { call } from '../../../utils';

const PAC_TYPE_LOCAL = 0;
const PAC_TYPE_REMOTE = 1;

export default class SystemProxy extends React.Component {

  state = {
    pacType: PAC_TYPE_LOCAL,
    sysProxy: '',
    sysPac: '',
  };

  async componentDidMount() {
    try {
      const [sysProxy, sysPac] = await Promise.all([
        call('get_system_proxy', null, { timeout: 6e4 }),
        // call('get_system_pac'),
      ]);
      this.setState({ sysProxy, sysPac });
    } catch (err) {
      console.error(err);
    }
  }

  onSelectPacType = (e) => {
    this.setState({ pacType: +e.currentTarget.value });
  };

  onSystemProxyChange = (e) => {
    this.setState({ sysProxy: e.target.value });
  };

  onSysPacChange = (e) => {
    this.setState({ sysPac: e.target.value });
  };

  onSetSystemProxy = async () => {
    const { sysProxy } = this.state;
    if (!sysProxy) {
      return;
    }
    try {
      await call('set_system_proxy', { sysProxy });
    } catch (err) {
      console.error(err);
    }
  };

  onSetSystemPac = async () => {
    const { sysPac } = this.state;
    if (!sysPac) {
      return;
    }
    try {
      await call('set_system_pac', { sysPac });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { pacType, sysProxy, pac } = this.state;
    return (
      <div className={styles.container}>
        <h3>System Proxy</h3>
        <section>
          <h5>Global HTTP Proxy</h5>
          <div className="pt-control-group">
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-globe"/>
              <input
                type="text"
                className="pt-input"
                placeholder="http://localhost:1080"
                style={{ width: 300 }}
                value={sysProxy}
                onChange={this.onSystemProxyChange}
              />
            </div>
            <Button intent={Intent.PRIMARY} onClick={this.onSetSystemProxy}>
              Set To System
            </Button>
          </div>
        </section>
        <section>
          <h5>PAC</h5>
          <RadioGroup
            inline
            label="Please select a type."
            onChange={this.onSelectPacType}
            selectedValue={pacType}
          >
            <Radio label="Local" value={PAC_TYPE_LOCAL}/>
            <Radio label="Remote" value={PAC_TYPE_REMOTE}/>
          </RadioGroup>
          {pacType === PAC_TYPE_LOCAL && (
            <div>
              <Button intent={Intent.PRIMARY} onClick={this.onSetSystemPac}>
                Set To System
              </Button>
            </div>
          )}
          {pacType === PAC_TYPE_REMOTE && (
            <div className="pt-control-group">
              <div className="pt-input-group">
                <span className="pt-icon pt-icon-random"/>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="http://example.com/proxy.pac"
                  style={{ width: 300 }}
                  value={pac}
                  onChange={this.onSysPacChange}
                />
              </div>
              <Button intent={Intent.PRIMARY} onClick={this.onSetSystemPac}>
                Set To System
              </Button>
            </div>
          )}
        </section>
      </div>
    );
  }

}
