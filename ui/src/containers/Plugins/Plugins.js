import React from 'react';
import PropTypes from 'prop-types';
import SystemProxy from './SystemProxy/SystemProxy';

import styles from './Plugins.module.css';
import { call } from '../../utils';
import { RUN_TYPE_CLIENT, RUN_TYPE_SERVER } from '../../constants';

export default class Plugins extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  state = {
    runType: null,
    platform: null,
  };

  async componentDidMount() {
    try {
      const env = await call('get_env', null, { cache: true });
      this.setState({
        runType: env.runType,
        platform: env.os.find(([key]) => key === 'platform')[1],
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  render() {
    const { runType, platform } = this.state;
    if (runType === null) {
      return null;
    }
    return (
      <div className={styles.container}>
        <ul className="pt-breadcrumbs">
          <li><span className="pt-breadcrumbs-collapsed"/></li>
          <li><span className="pt-breadcrumb pt-breadcrumb-current">Plugins</span></li>
        </ul>
        <br/>
        {platform === 'darwin' && (
          <p className="pt-callout pt-intent-warning pt-icon-info-sign">
            <span>Some of plugins may require <b>root privileges</b> on <b>macOS</b>.</span>
          </p>
        )}
        {runType === RUN_TYPE_CLIENT && (
          <section>
            <SystemProxy/>
          </section>
        )}
        {runType === RUN_TYPE_SERVER && (
          <p className="pt-callout pt-icon-info-sign">
            <span>No plugins available yet.</span>
          </p>
        )}
      </div>
    );
  }

}
