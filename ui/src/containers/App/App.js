import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { hot } from 'react-hot-loader';
import { Route, Link, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Icon } from '@blueprintjs/core';

import NetworkTips from './NetworkTips/NetworkTips';
import Home from '../Home/Home';
import Services from '../Services/Services';
import AddServer from '../Services/Add/Add';
import Github from '../../components/Github/Github';

import styles from './App.module.css';

import { call, live, store } from '../../utils';
import { RUN_TYPE_CLIENT, TOKEN_NAME } from '../../constants';

@hot(module)
@observer
export default class App extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  state = {
    env: {},
  };

  async componentDidMount() {
    try {
      const [env, unlive] = await Promise.all([
        call('get_env', null, { cache: true }),
        live('live_services', ({ services }) => {
          store.services = services;
        }),
      ]);

      this.unlive = unlive;

      this.setState({ env });
    } catch (err) {
      console.error(err.message);
    }
  }

  componentWillUnmount() {
    if (this.unlive) {
      this.unlive();
      this.unlive = null;
    }
  }

  onSignOut = () => {
    localStorage.removeItem(TOKEN_NAME);
    window.location.href = '/landing';
  };

  render() {
    const { match } = this.props;
    const { env } = this.state;
    const FOOTER_LINKS = [{
      text: 'ChangeLog',
      link: 'https://github.com/blinksocks/blinksocks-gui/blob/master/CHANGELOG.md',
    }, {
      text: 'Issues',
      link: 'https://github.com/blinksocks/blinksocks-gui/issues',
    }, {
      text: 'Document',
      link: 'https://github.com/blinksocks/blinksocks-gui',
    }, {
      text: `blinksocks - v${env.blinksocksVersion}`,
      link: 'https://github.com/blinksocks/blinksocks',
    }];
    return (
      <div className={styles.container}>
        <Github url="https://github.com/blinksocks/blinksocks-gui"/>
        <NetworkTips/>
        <h1 className={styles.header}>
          <Icon icon="offline" iconSize={50}/>
          <div className={styles.caption}>
            <p><Link className="link-reset" to="/">blinksocks-gui</Link></p>
            <small>v{env.version}</small>
          </div>
          <span className={classnames('pt-tag pt-intent-warning', styles.runType)}>
            {env.runType === RUN_TYPE_CLIENT ? 'client' : 'server'}
          </span>
        </h1>
        <button
          className={classnames('pt-button pt-minimal pt-icon-log-out', styles.signout)}
          onClick={this.onSignOut}>
          Sign Out
        </button>
        <div className={styles.body}>
          <Switch>
            <Route path={match.url + 'services/add'} component={AddServer}/>
            <Route path={match.url + 'services/:id'} component={Services}/>
            <Route component={Home}/>
          </Switch>
        </div>
        <footer>
          <ul>
            {FOOTER_LINKS.map(({ text, link }, i) => (
              <li key={i}>
                <a href={link} target="_blank" rel="noopener noreferrer">{text}</a>
                {i < FOOTER_LINKS.length - 1 && <span className={styles.divider}/>}
              </li>
            ))}
          </ul>
        </footer>
      </div>
    );
  }

}
