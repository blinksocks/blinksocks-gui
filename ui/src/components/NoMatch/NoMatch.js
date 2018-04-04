import React from 'react';
import styles from './NoMatch.module.css';

export default class NoMatch extends React.Component {

  render() {
    return (
      <div className={styles.container}>
        <h1>404</h1>
        <p>We couldn't find the page you <br/> were looking for.</p>
        <button type="button" onClick={() => window.location.href = '/'}>Go Home</button>
      </div>
    );
  }

}
