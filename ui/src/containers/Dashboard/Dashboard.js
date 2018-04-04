import React from 'react';

import Services from './Services/Services';
import styles from './Dashboard.module.css';

export default class Dashboard extends React.Component {

  render() {
    return (
      <div className={styles.container}>
        <Services/>
      </div>
    );
  }

}
