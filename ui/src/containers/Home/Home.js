import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { Icon } from '@blueprintjs/core';

import Usage from './Usage/Usage';
import Dashboard from '../Dashboard/Dashboard';
import Plugins from '../Plugins/Plugins';
import Info from '../Info/Info';
import Settings from '../Settings/Settings';

import { MenuRouter, MenuRouterDivider } from '../../components/MenuRouter';
import { call, store } from '../../utils';

import styles from './Home.module.css';

function createRoutes(match) {
  return [{
    exact: true,
    path: match.url,
    text: 'Dashboard',
    component: Dashboard,
  }, {
    path: match.url + 'plugins',
    disabled: true,
    text: 'Plugins',
    component: Plugins,
  }, {
    path: match.url + 'info',
    text: 'System Info',
    component: Info,
  }, {
    path: match.url + 'settings',
    text: 'Settings',
    component: Settings,
  }];
}

export default class Home extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  state = {
    env: null,
  };

  async componentDidMount() {
    try {
      const env = await call('get_env', null, { cache: true });
      this.setState({ env });
    } catch (err) {
      console.error(err.message);
    }
  }

  render() {
    const { match } = this.props;
    const { env } = this.state;
    const routes = createRoutes(match);
    return (
      <div className={styles.container}>
        <MenuRouter routes={routes} style={{ width: 220, 'minWidth': 220 }}>
          <MenuRouterDivider/>
          {env && <Usage env={env}/>}
          <small>
            <Icon icon="pulse" color="#5b6f7f" iconSize={12} style={{ marginTop: '3px' }}/>&nbsp;
            Latency: {store.rpcLatency}ms
          </small>
        </MenuRouter>
        {routes.map(({ path, exact, component }, i) => (
          <Route key={i} path={path} exact={exact} component={component}/>
        ))}
      </div>
    );
  }

}
