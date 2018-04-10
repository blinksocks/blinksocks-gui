import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Prompt, matchPath } from 'react-router-dom';
import { Button, Intent } from '@blueprintjs/core';
import classnames from 'classnames';
import omit from 'lodash/omit';
import keyBy from 'lodash/keyBy';
import cloneDeep from 'lodash/cloneDeep';

import ClientEditor from './ClientEditor';
import ServerEditor from './ServerEditor';
import styles from './Setting.module.css';

import { call, toast, store } from '../../../utils';

@observer
export default class Setting extends React.Component {

  static propTypes = {
    match: PropTypes.string.isRequired,
  };

  state = {
    id: '',
    config: null,
    client: null, // client only
    server: null,
    isClient: false,
    defs: null,
    isUnSaved: false,
    isSaving: false,
  };

  async componentDidMount() {
    const { params: { id } } = matchPath(this.props.match.url, { path: '/services/:id' });
    try {
      const [config, defs] = await Promise.all([
        call('get_config', { id }),
        call('get_preset_defs', null, { cache: true }),
      ]);
      const isClient = !!config.server;
      let client, server;
      if (isClient) {
        client = omit(config, 'server');
        server = config.server;
      } else {
        server = config;
      }
      // mix "._def" in each server.presets
      const map = keyBy(defs, 'name');
      for (const preset of server.presets) {
        preset._def = map[preset.name];
      }
      this.setState({ id, config, client, server, isClient, defs: map });
    } catch (err) {
      console.error(err);
    }
  }

  onClientChange = (client) => {
    this.setState({ client, isUnSaved: true });
  };

  onServerChange = (server) => {
    this.setState({ server, isUnSaved: true });
  };

  onSave = async () => {
    const { id } = this.state;
    const { isClient, client, server } = this.state;
    // drop "._def" of each server.presets
    const serverCopy = cloneDeep(server);
    for (const preset of serverCopy.presets) {
      delete preset._def;
    }
    let config;
    if (isClient) {
      config = { ...client, server: serverCopy };
    } else {
      config = serverCopy;
    }
    this.setState({ isSaving: true });
    try {
      await call('save_setting', { id, config });
      toast('configuration saved!', 'success');
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ isSaving: false, isUnSaved: false });
  };

  onSaveAndRestart = async () => {
    const { id } = this.state;
    await this.onSave();
    try {
      await call('restart_service', { id });
      toast('service restart successfully!', 'success');
    } catch (err) {
      console.error(err.message);
    }
  };

  renderSaveButton = () => {
    const { id, isSaving, isUnSaved } = this.state;
    const props = {
      disabled: !isUnSaved,
      loading: isSaving,
    };
    if (store.isServiceRunning(id)) {
      return (
        <div>
          <p className="pt-callout pt-intent-warning pt-icon-info-sign">
            <span>This service is <b>RUNNING</b> now, save and restart to take effect immediately.</span>
          </p>
          <Button {...props} intent={Intent.PRIMARY} onClick={this.onSaveAndRestart}>
            Save And Restart
          </Button>
          &nbsp;&nbsp;
          <Button {...props} onClick={this.onSave}>
            Save
          </Button>
        </div>
      );
    } else {
      return <Button {...props} intent={Intent.PRIMARY} onClick={this.onSave}>Save</Button>;
    }
  };

  renderClient = () => {
    const { client, server, isClient, defs } = this.state;
    return (
      <>
        <section>
          <h2>Local Service</h2>
          {client && (
            <ClientEditor
              client={client}
              onChange={this.onClientChange}
            />
          )}
        </section>
        <section>
          <h2>Remote Server</h2>
          {server && defs && (
            <ServerEditor
              isClient={isClient}
              server={server}
              defs={defs}
              onChange={this.onServerChange}
            />
          )}
        </section>
      </>
    );
  };

  renderServer = () => {
    const { server, isClient, defs } = this.state;
    return (
      <section>
        <h2>Local Service</h2>
        {server && defs && (
          <ServerEditor
            isClient={isClient}
            server={server}
            defs={defs}
            onChange={this.onServerChange}
          />
        )}
      </section>
    );
  };

  render() {
    const { id, isClient, isUnSaved } = this.state;
    return (
      <div className={styles.container}>
        <Prompt when={isUnSaved} message="You have unsaved changes, are you sure to leave?"/>
        {isUnSaved && !store.isServiceRunning(id) && (
          <p className={classnames('pt-callout pt-intent-warning pt-icon-info-sign', styles.warning)}>
            <span>You have unsaved changes, remember to save <b>before start/restart service</b>.</span>
            <button type="button" className="pt-button pt-minimal pt-intent-primary" onClick={this.onSave}>
              Save
            </button>
          </p>
        )}
        <div className={styles.body}>
          {isClient ? this.renderClient() : this.renderServer()}
        </div>
        {this.renderSaveButton()}
      </div>
    );
  }

}
