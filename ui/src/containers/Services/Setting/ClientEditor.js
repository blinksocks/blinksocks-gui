import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import AddressEditor from './components/AddressEditor';
import CommonEditor from './components/CommonEditor';
import styles from './ClientEditor.module.css';

export default class ClientEditor extends React.Component {

  static propTypes = {
    client: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: (/* client */) => {
    },
  };

  state = {
    service: '',
    commons: {},
  };

  constructor(props) {
    super(props);
    const { service } = this.props.client;
    this.state = {
      service,
      commons: _.pick(this.props.client, [
        'dns', 'dns_expire', 'timeout',
        'log_path', 'log_level', 'log_max_days',
      ]),
    };
  }

  onChange = () => {
    const { service, commons } = this.state;
    this.props.onChange({
      service: service,
      ...commons,
    });
  };

  onAddressChange = (address) => {
    this.setState({ service: address }, this.onChange);
  };

  onCommonsChange = (commons) => {
    this.setState({ commons }, this.onChange);
  };

  render() {
    const { service, commons } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.subitem}>
          <h5>Address</h5>
          <AddressEditor
            address={service}
            protocols={['socks5', 'socks4', 'socks4a', 'http']}
            onChange={this.onAddressChange}
          />
        </div>
        <CommonEditor
          commons={commons}
          onChange={this.onCommonsChange}
        />
      </div>
    );
  }

}
