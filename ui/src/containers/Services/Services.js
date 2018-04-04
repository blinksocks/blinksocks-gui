import React from 'react';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';

import { call } from '../../utils';
import { MenuRouter } from '../../components/MenuRouter';

import Graphs from './Graphs/Graphs';
import Setting from './Setting/Setting';
import Log from './Log/Log';

import styles from './Services.module.css';

export default class Services extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  state = {
    service: null,
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

  render() {
    const { service } = this.state;
    const routes = this.createRoutes();
    return (
      <div className={styles.container}>
        <ul className="pt-breadcrumbs">
          <li><span className="pt-breadcrumbs-collapsed"/></li>
          <li>
            <Link className="pt-breadcrumb" to="/">Dashboard</Link>
          </li>
          <li><span className="pt-breadcrumb pt-breadcrumb-current">{service && service.remarks}</span></li>
        </ul>
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
