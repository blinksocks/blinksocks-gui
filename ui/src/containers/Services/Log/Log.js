import React from 'react';
import _ from 'lodash';
import { matchPath } from 'react-router-dom';

import styles from './Log.module.css';
import live from '../../../utils/live';

export default class Log extends React.Component {

  state = {
    logs: [],
    searchLogs: [],
  };

  unlive = null;

  async componentDidMount() {
    const { params: { id } } = matchPath(this.props.match.url, { path: '/services/:id' });
    try {
      this.unlive = await live('live_log', { id }, (log) => {
        const logs = this.state.logs.concat(Array.isArray(log) ? log : [log]);
        this.setState({ logs, searchLogs: logs });
      });
    } catch (err) {
      console.error(err);
    }
  }

  componentWillUnmount() {
    if (this.unlive) {
      this.unlive();
      this.unlive = null;
    }
  }

  onSearch = _.debounce((keywords) => {
    if (keywords === '') {
      this.setState({ searchLogs: this.state.logs });
    } else {
      this.setState({ searchLogs: this.state.logs.filter((log) => log.indexOf(keywords) > -1) });
    }
  }, 500);

  onClear = () => {
    this.setState({ logs: [], searchLogs: [] });
  };

  render() {
    const { searchLogs } = this.state;
    return (
      <div className={styles.container}>
        <div className="pt-input-group">
          <span className="pt-icon pt-icon-search"/>
          <input
            type="text"
            className="pt-input"
            placeholder="Search Log..."
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </div>
        <div className={styles.tools}>
          <span className="pt-icon pt-icon-eraser" onClick={this.onClear}/>
        </div>
        <textarea readOnly="readOnly" value={searchLogs.join('\n')}/>
      </div>
    );
  }

}
