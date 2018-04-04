import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import formatSize from 'filesize';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Dialog, Button, Icon, Switch, Popover, Menu, MenuItem, MenuDivider, Position } from '@blueprintjs/core';

import styles from './Service.module.css';
import { call, toast, store } from '../../../utils';

@observer
export default class Service extends React.Component {

  static propTypes = {
    service: PropTypes.object.isRequired,
    onCopy: PropTypes.func,
    onRename: PropTypes.func,
    onRemove: PropTypes.func,
  };

  static defaultProps = {
    onCopy: () => {
    },
    onRename: () => {
    },
    onRemove: () => {
    },
  };

  state = {
    pending: false,
    currentRemarks: '',
    isRenameDialogOpen: false,
    isRenaming: false,
  };

  onToggle = async (e) => {
    e.stopPropagation();
    const { id } = this.props.service;
    this.setState({ pending: true });
    try {
      if (store.isServiceRunning(id)) {
        store.services[id] = await call('stop_service', { id });
        toast('service stopped!', 'success');
      } else {
        store.services[id] = await call('start_service', { id });
        toast('service started successfully!', 'success');
      }
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ pending: false });
  };

  onOpenRenameDialog = () => {
    const { service } = this.props;
    this.setState({ isRenameDialogOpen: true, currentRemarks: service.remarks });
  };

  onEditRemarks = async () => {
    const { currentRemarks: remarks } = this.state;
    if (remarks.length < 1) {
      return;
    }
    this.setState({ isRenaming: true });
    await this.props.onRename(remarks);
    this.setState({ isRenaming: false, isRenameDialogOpen: false });
  };

  renderMenu = () => {
    const { service: { id }, onRemove, onCopy } = this.props;
    const styles = { textDecoration: 'none', color: 'inherit' };
    return (
      <Menu>
        <Link to={`/services/${id}/setting`} style={styles}>
          <MenuItem text="Settings" icon="cog"/>
        </Link>
        <Link to={`/services/${id}/log`} style={styles}>
          <MenuItem text="View Log" icon="eye-open"/>
        </Link>
        <MenuItem text="Copy" icon="duplicate" onClick={onCopy}/>
        <MenuItem text="Rename" icon="text-highlight" onClick={this.onOpenRenameDialog}/>
        <MenuDivider/>
        <MenuItem
          text="Remove"
          icon="trash"
          intent="danger"
          onClick={onRemove}
          disabled={store.isServiceRunning(id)}
        />
      </Menu>
    );
  };

  renderSummary = () => {
    const { id } = this.props.service;
    const service = store.services[id];
    const getValue = (key) => {
      if (!service || typeof service[key] === 'undefined') {
        return '-';
      }
      if (key.indexOf('speed') > 0) {
        const [num, unit] = formatSize(service[key], { output: 'array' });
        return (
          <div><span>{num}</span> {unit}/s</div>
        );
      }
      return service[key];
    };
    return (
      <table className={styles.summary}>
        <tbody>
        <tr>
          <td><Icon icon="git-commit"/> Connections:</td>
          <td>{getValue('connections')}</td>
        </tr>
        <tr>
          <td><Icon icon="chevron-up"/> Upload:</td>
          <td>{getValue('upload_speed')}</td>
        </tr>
        <tr>
          <td><Icon icon="chevron-down"/> Download:</td>
          <td>{getValue('download_speed')}</td>
        </tr>
        </tbody>
      </table>
    );
  };

  renderRenameDialog = () => {
    const { isRenameDialogOpen, isRenaming, currentRemarks } = this.state;
    return (
      <Dialog
        isOpen={isRenameDialogOpen}
        title="Rename"
        onClose={() => this.setState({ isRenameDialogOpen: false })}
      >
        <div className="pt-dialog-body">
          <label className="pt-label">
            New Name
            <span className="pt-text-muted">(required)</span>
            <div className="pt-input-group">
              <span className="pt-icon pt-icon-user"/>
              <input
                className="pt-input"
                type="text"
                dir="auto"
                autoFocus
                value={currentRemarks}
                onChange={(e) => this.setState({ currentRemarks: e.target.value })}
              />
            </div>
          </label>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              intent="primary"
              loading={isRenaming}
              onClick={this.onEditRemarks}
              text="OK"
            />
          </div>
        </div>
      </Dialog>
    );
  };

  render() {
    const { id, protocol, address, remarks } = this.props.service;
    const { pending } = this.state;
    return (
      <li className={classnames('pt-card pt-elevation-1 pt-interactive', styles.container)}>
        <div className={styles.header}>
          <span className={styles.switch}>
            <Switch
              inline
              disabled={pending}
              checked={store.isServiceRunning(id)}
              className={classnames('pt-large', styles.switch)}
              onChange={this.onToggle}
            />
          </span>
          <Popover content={this.renderMenu()} position={Position.BOTTOM_LEFT}>
            <Icon icon="menu"/>
          </Popover>
        </div>
        <Link className={styles.body} to={'/services/' + id + '/graphs'}>
          <span className={styles.remarks}>{remarks || '-'}</span>
          <small className={styles.address}>{protocol}://{address}</small>
          {this.renderSummary()}
        </Link>
        {this.renderRenameDialog()}
      </li>
    );
  }

}
