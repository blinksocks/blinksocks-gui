import React from 'react';

import { store } from '../../utils';
import Title from '../../components/Title/Title';

import styles from './Info.module.css';

const Table = ({ pairs }) => (
  <table>
    <tbody>
    {pairs.map(([key, value]) => (
      <tr key={key}>
        <td><b>{key}:</b></td>
        <td>{value}</td>
      </tr>
    ))}
    </tbody>
  </table>
);

export default class Info extends React.Component {

  render() {
    const { env } = store;
    if (!env.os || !env.node) {
      return null;
    }
    return (
      <div className={styles.container}>
        <Title>System Info</Title>
        <section>
          <h3>OS</h3>
          {env.os && <Table pairs={env.os}/>}
        </section>
        <section>
          <h3>Node.js</h3>
          {env.node && <Table pairs={env.node}/>}
        </section>
      </div>
    );
  }

}
