import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Icon, Switch, EditableText } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { Route, Link } from 'react-router-dom';

import { call, store, toast } from '../../utils';
import { MenuRouter } from '../../components/MenuRouter';

import Graphs from './Graphs/Graphs';
import Setting from './Setting/Setting';
import Log from './Log/Log';

import styles from './Services.module.css';

@observer
export default class Services extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  state = {
    service: null,
    pending: false,
  };

  async componentDidMount() {
    const { params: { id } } = this.props.match;
    try {
      const service = await call('get_service', { id }, { showProgress: true });
      this.setState({ service });
    } catch (err) {
      console.error(err);
    }
  }

  createRoutes() {
    const { match } = this.props;
    return [{
      path: match.url + '/graphs',
      text: 'Graphs',
      component: Graphs,
    }, {
      path: match.url + '/setting',
      text: 'Setting',
      component: Setting,
    }, {
      path: match.url + '/log',
      text: 'Log',
      component: Log,
    }];
  }

  onEditRemarks = async (id, remarks) => {
    if (remarks.length < 1) {
      return;
    }
    try {
      await call('update_remarks', { id, remarks });
    } catch (err) {
      console.error(err);
    }
  };

  onToggle = async () => {
    const { params: { id } } = this.props.match;
    this.setState({ pending: true });
    try {
      if (store.isServiceRunning(id)) {
        store.services[id] = await call('stop_service', { id });
        toast('service stopped!', 'success');
      } else {
        store.services[id] = await call('start_service', { id });
        toast('service started successfully!', 'success');
      }
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ pending: false });
  };

  render() {
    const { service, pending } = this.state;
    if (!service) {
      return null;
    }
    const { params: { id } } = this.props.match;
    const routes = this.createRoutes();
    return (
      <div className={styles.container}>
        <ul className="pt-breadcrumbs">
          <li><span className="pt-breadcrumbs-collapsed"/></li>
          <li>
            <Link className="pt-breadcrumb" to="/">Dashboard</Link>
          </li>
          <li><span className="pt-breadcrumb pt-breadcrumb-current">{service.remarks}</span></li>
        </ul>
        <div className={styles.title}>
          <div className={styles.left}>
            <Icon icon="console" iconSize={50} color="#555"/>
            <section>
              <h3>
                <EditableText
                  defaultValue={service.remarks}
                  onConfirm={(remarks) => this.onEditRemarks(id, remarks)}
                />
              </h3>
              <p>{service.service}</p>
            </section>
          </div>
          <Switch
            inline
            disabled={pending}
            checked={store.isServiceRunning(id)}
            className={classnames('pt-large', styles.switch)}
            onChange={this.onToggle}
          />
        </div>
        <div className={styles.body}>
          <MenuRouter routes={routes} style={{ width: 120, minWidth: 120 }}/>
          <div style={{ width: '100%' }}>
            {routes.map(({ path, exact, component }, i) => (
              <Route key={i} path={path} exact={exact} component={component}/>
            ))}
          </div>
        </div>
      </div>
    );
  }

}
