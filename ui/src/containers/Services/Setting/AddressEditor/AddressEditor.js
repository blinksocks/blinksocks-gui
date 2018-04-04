import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import URL from 'url-parse';
import styles from './AddressEditor.module.css';

export default class AddressEditor extends React.Component {

  static propTypes = {
    address: PropTypes.string.isRequired,
    protocols: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    protocols: [],
    onChange: (/* address */) => {
    },
  };

  state = {
    protocol: '',
    hostname: '',
    port: 0,
  };

  constructor(props) {
    super(props);
    const { protocol, hostname, port } = new URL(this.props.address);
    this.state = {
      protocol,
      hostname,
      port,
    };
  }

  onChange = () => {
    const { protocol, hostname, port } = this.state;
    this.props.onChange(`${protocol}//${hostname}:${port}`);
  };

  onProtocolChange = (e) => {
    this.setState({ protocol: e.target.value }, this.onChange);
  };

  onHostnameChange = (e) => {
    this.setState({ hostname: e.target.value }, this.onChange);
  };

  onPortChange = (e) => {
    this.setState({ port: e.target.value | 0 }, this.onChange);
  };

  render() {
    const { protocols } = this.props;
    const { protocol, hostname, port } = this.state;
    return (
      <div className={classnames('pt-control-group', styles.container)}>
        <div className="pt-select">
          <select value={protocol} onChange={this.onProtocolChange}>
            <option disabled defaultValue="">Protocol...</option>
            {protocols.map((protocol, i) => (
              <option key={i} value={`${protocol}:`}>{protocol}://</option>
            ))}
          </select>
        </div>
        <div className="pt-input-group">
          <input
            type="text"
            className="pt-input"
            placeholder="hostname"
            value={hostname}
            onChange={this.onHostnameChange}
          />
        </div>
        <div className="pt-input-group">
          <input
            type="number"
            className="pt-input"
            min="1"
            max="65535"
            placeholder="port"
            value={port}
            onChange={this.onPortChange}
          />
        </div>
      </div>
    );
  }

}
