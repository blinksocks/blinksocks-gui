import React from 'react';
import { Icon } from '@blueprintjs/core';
import { observer } from 'mobx-react';

import { RPC_STATUS_ERROR, RPC_STATUS_INIT, RPC_STATUS_OFFLINE, RPC_STATUS_ONLINE } from '../../../constants';
import { store } from '../../../utils';

import styles from './NetworkTips.module.css';

@observer
export default class NetworkTips extends React.Component {

  render() {
    const { rpcStatus: status } = store;
    if (status === RPC_STATUS_INIT || status === RPC_STATUS_ONLINE) {
      return null;
    }
    const hint = {
      [RPC_STATUS_OFFLINE]: 'You\'re currently offline, we are trying to reconnect...',
      [RPC_STATUS_ERROR]: 'We cannot connect to server, please check your connection then refresh the page.',
    }[status];
    const bgColor = {
      [RPC_STATUS_OFFLINE]: '#ff7373d4',
      [RPC_STATUS_ERROR]: '#ff3939d4',
    }[status];
    return (
      <div className={styles.container}>
        <div className={styles.content} style={{ backgroundColor: bgColor }}>
          <Icon icon="warning-sign"/>&nbsp;{hint}
        </div>
      </div>
    );
  }

}
