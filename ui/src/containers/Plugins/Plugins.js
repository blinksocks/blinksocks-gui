import React from 'react';
import PropTypes from 'prop-types';

import styles from './Plugins.module.css';

import { store } from '../../utils';
import Title from '../../components/Title/Title';

export default class Plugins extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  render() {
    const { env } = store;
    if (typeof env.runType === 'undefined' || !env.os) {
      return null;
    }
    return (
      <div className={styles.container}>
        <Title>Plugins</Title>
        <ul className="pt-breadcrumbs">
          <li><span className="pt-breadcrumbs-collapsed"/></li>
          <li><span className="pt-breadcrumb pt-breadcrumb-current">Plugins</span></li>
        </ul>
        <br/>
        <p className="pt-callout pt-icon-info-sign">
          <span>No plugins available yet.</span>
        </p>
      </div>
    );
  }

}
