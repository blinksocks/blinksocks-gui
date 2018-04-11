import React from 'react';
import classnames from 'classnames';
import formatSize from 'filesize';

import styles from './Usage.module.css';
import { store, live } from '../../../utils';

export default class Usage extends React.Component {

  state = {
    cpuUsage: null,
    memoryUsage: null,
  };

  unlive = null;

  async componentDidMount() {
    try {
      this.unlive = await live('live_usage', ({ cpuUsage, memoryUsage }) => {
        this.setState({ cpuUsage, memoryUsage });
      });
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

  render() {
    const { env } = store;
    if (!env.os) {
      return null;
    }
    const { cpuUsage, memoryUsage } = this.state;
    const totalMemory = env.os.filter(([key]) => key === 'memory')[0][1];
    const cpuPercentage = (cpuUsage > 1 ? 1 : cpuUsage);
    const memPercentage = (memoryUsage / totalMemory);
    const colorClass = (value) => classnames({
      'pt-intent-warning': value > 0.5,
      'pt-intent-danger': value > 0.8,
    });
    return (
      <div className={styles.container}>
        <div className={styles.item}>
          <h4>
            CPU
            <small>{(cpuPercentage * 100).toFixed(2) + '%'}</small>
          </h4>
          {cpuUsage !== null && (
            <div className={classnames('pt-progress-bar pt-no-stripes', colorClass(cpuPercentage))}>
              <div className="pt-progress-meter" style={{ width: cpuPercentage * 100 + '%' }}/>
            </div>
          )}
        </div>
        <div className={styles.item}>
          <h4>
            Memory
            <small>{formatSize(memoryUsage)} of {formatSize(totalMemory)}</small>
          </h4>
          {memoryUsage !== null && (
            <div className={classnames('pt-progress-bar pt-no-stripes', colorClass(memPercentage))}>
              <div className="pt-progress-meter" style={{ width: memPercentage * 100 + '%' }}/>
            </div>
          )}
        </div>
      </div>
    );
  }

}
