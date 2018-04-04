import React from 'react';

import { call } from '../../utils';

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
    const { env } = this.state;
    if (!env) {
      return null;
    }
    return (
      <div className={styles.container}>
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
