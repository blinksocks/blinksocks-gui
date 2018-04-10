import React from 'react';
import debounce from 'lodash/debounce';
import keyBy from 'lodash/keyBy';
import { ButtonGroup, Button, Menu, MenuItem, Icon, Popover, Position } from '@blueprintjs/core';
import { matchPath } from 'react-router-dom';

import { live, call } from '../../../utils';
import { CONN_STAGE_INIT, CONN_STAGE_TRANSFER, CONN_STAGE_FINISH, CONN_STAGE_ERROR } from '../../../constants';

import styles from './Log.module.css';

const VIEW_TYPE_PARSED = 0;
const VIEW_TYPE_RAW = 1;

// helper functions

function search(logs, keywords) {
  return logs.filter(({ sourceHost, sourcePort, targetHost, targetPort }) =>
    [sourceHost, sourcePort + '', targetHost, targetPort + ''].some((text) => text.indexOf(keywords) > -1)
  );
}

class ConnectionItem extends React.Component {

  render() {
    const { _showDetails, stage, sourceHost, sourcePort, targetHost, targetPort } = this.props;
    const { startTime, endTime, elapsed, message } = this.props;
    const color = {
      [CONN_STAGE_INIT]: '#FFC940',
      [CONN_STAGE_TRANSFER]: '#43BF4D',
      [CONN_STAGE_FINISH]: '#E1E8ED',
      [CONN_STAGE_ERROR]: '#DB3737',
    }[stage];
    const style = {
      [CONN_STAGE_FINISH]: { color: '#7c7e81' },
    }[stage] || [];
    return (
      <div className={styles.conn}>
        <div className={styles.abstract} style={style}>
          <span><Icon icon={_showDetails ? 'chevron-down' : 'chevron-right'}/></span>
          <span className={styles.dot} style={{ backgroundColor: color }}/>
          <span>{sourceHost}:{sourcePort}</span>
          {targetHost && targetPort && (
            <>
              <span> -> </span>
              <span>{targetHost}:{targetPort}</span>
            </>
          )}
        </div>
        {_showDetails && (
          <div className={styles.details} onClick={(e) => e.stopPropagation()}>
            <span className="pt-tag pt-minimal">
              <b>Duration: {startTime} - {endTime ? endTime : '?'}</b>
            </span>
            {elapsed && (
              <span className="pt-tag pt-minimal">
                <b>Elapsed: {(elapsed / 1e3).toFixed(2)}s</b>
              </span>
            )}
            {message && (
              <span className="pt-tag pt-intent-danger pt-minimal">
                <b>Error: {message}</b>
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

}

export default class Log extends React.Component {

  state = {
    logFiles: [],
    logs: [],
    searchLogs: [],
    keywords: '',
    viewType: VIEW_TYPE_PARSED,
  };

  unlive = null;

  async componentDidMount() {
    const { params: { id } } = matchPath(this.props.match.url, { path: '/services/:id' });
    try {
      this.unlive = await live('live_connections', { id }, (logs) => {
        const indexes = keyBy(this.state.searchLogs, 'id');
        const _logs = logs.map((log) => ({
          ...log,
          _showDetails: indexes[log.id] ? indexes[log.id]._showDetails : false,
        }));
        this.setState({ logs: _logs, searchLogs: search(_logs, this.state.keywords) });
      });
      const logFiles = await call('get_service_logs', { id });
      this.setState({ logFiles });
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

  // ToolBar

  onSearch = debounce((keywords) => {
    if (keywords === '') {
      this.setState({ searchLogs: this.state.logs, keywords });
    } else {
      this.setState({ searchLogs: search(this.state.logs, keywords), keywords });
    }
  }, 300);

  onViewParsed = () => {
    this.setState({ viewType: VIEW_TYPE_PARSED });
  };

  onToggleConnItem = (index) => {
    this.setState({
      searchLogs: this.state.searchLogs.map((log, i) => ({
        ...log,
        _showDetails: i === index ? !log._showDetails : log._showDetails,
      })),
    });
  };

  renderMenu = () => {
    const { logFiles } = this.state;
    const styles = { textDecoration: 'none', color: 'inherit' };
    const getDate = (file) => {
      const result = file.match(/\d{4}-\d{2}-\d{2}/);
      if (result) {
        return result[0];
      }
      return '';
    };
    return (
      <Menu>
        {logFiles.map((file) => (
          <a key={file} target="_blank" href={`/logs/${file}`} style={styles}>
            <MenuItem key={file} text={getDate(file)} icon="import"/>
          </a>
        ))}
        {logFiles.length < 1 && (
          <MenuItem text="NO HISTORY LOGS" disabled/>
        )}
      </Menu>
    );
  };

  render() {
    const { searchLogs, viewType } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-search"/>
            <input
              type="text"
              className="pt-input"
              placeholder="Search..."
              style={{ width: 200 }}
              onChange={(e) => this.onSearch(e.target.value)}
            />
          </div>
          <div className={styles.tools}>
            <ButtonGroup style={{ marginRight: 0 }}>
              <Button icon="eye-open" active={viewType === VIEW_TYPE_PARSED} onClick={this.onViewParsed}>
                <b>Parsed</b>
              </Button>
              <Popover content={this.renderMenu()} position={Position.BOTTOM}>
                <Button icon="history" active={viewType === VIEW_TYPE_RAW}>
                  <b>History</b>
                </Button>
              </Popover>
            </ButtonGroup>
          </div>
        </div>
        {viewType === VIEW_TYPE_PARSED && (
          <ul className={styles.body}>
            {searchLogs.map((conn, i) => (
              <li key={i} onClick={() => this.onToggleConnItem(i)}>
                <ConnectionItem {...conn}/>
              </li>
            ))}
            {searchLogs.length < 1 && (
              <li className={styles.empty}>NO DATA</li>
            )}
          </ul>
        )}
      </div>
    );
  }

}
