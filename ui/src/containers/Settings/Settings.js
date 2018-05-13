import React from 'react';
import classnames from 'classnames';
import { Button, Dialog, Icon, EditableText, Tooltip, Position } from '@blueprintjs/core';

import UserItem from './UserItem/UserItem';
import Title from '../../components/Title/Title';

import { call, toast } from '../../utils';

import styles from './Settings.module.css';

export default class Settings extends React.Component {

  state = {
    users: [],
    services: [],
    autoStartServices: [],
    currentUserName: '',
    currentPassword: '',
    isSaving: false,
    isOpenAddUserDialog: false,
    isUserAdding: false,
  };

  componentDidMount() {
    this.fetchUsers();
    this.fetchServices();
  }

  async fetchUsers() {
    try {
      const users = await call('get_users');
      this.setState({ users });
    } catch (err) {
      console.error(err);
    }
  }

  async fetchServices() {
    try {
      const [services, autoStartServices] = await Promise.all([
        call('get_services'),
        call('get_auto_start_services'),
      ]);
      this.setState({ services, autoStartServices });
    } catch (err) {
      console.error(err);
    }
  }

  onToggleAutoStart = async (e, id) => {
    const checked = e.target.checked;
    try {
      if (checked) {
        await call('set_service_auto_start', { id });
      } else {
        await call('unset_service_auto_start', { id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  onUserChange = (_user) => {
    this.setState({
      users: this.state.users.map((user) =>
        user.id === _user.id ? _user : user
      ),
    });
  };

  onEditUserName = (id, name) => {
    this.setState({
      users: this.state.users.map((user) => ({
        ...user,
        name: user.id === id ? name : user.name,
      })),
    });
  };

  onDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure to delete user: ${user.name}`)) {
      return;
    }
    try {
      await call('delete_user', { id: user.id });
      toast('user deleted!', 'success');
      this.fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  onSave = async () => {
    const { users } = this.state;
    this.setState({ isSaving: true });
    try {
      await Promise.all(users.map((user) => call('save_user', { user })));
      toast('updated!', 'success');
    } catch (err) {
      console.error(err);
    }
    this.setState({ isSaving: false });
  };

  onOpenAddUserDialog = () => {
    this.setState({ isOpenAddUserDialog: true });
  };

  // dialog events

  onUserNameChange = (e) => {
    this.setState({ currentUserName: e.target.value });
  };

  onUserPasswordChange = (e) => {
    this.setState({ currentPassword: e.target.value });
  };

  onAddUser = async () => {
    this.setState({ isUserAdding: true });
    try {
      const { currentUserName, currentPassword } = this.state;
      if (currentUserName.length > 0 && currentPassword.length > 0) {
        await call('add_user', { user: { name: currentUserName, password: currentPassword } });
        this.setState({ isOpenAddUserDialog: false, currentUserName: '', currentPassword: '' });
        this.fetchUsers();
        toast('user added!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ isUserAdding: false });
  };

  render() {
    const { users, services, autoStartServices, currentUserName, currentPassword } = this.state;
    const { isSaving, isOpenAddUserDialog, isUserAdding } = this.state;
    return (
      <div className={styles.container}>
        <Title>Settings</Title>
        <h3>Services</h3>
        <table className={classnames('pt-html-table pt-html-table-bordered', styles.table)}>
          <thead>
          <tr>
            <th>Name</th>
            <th>Options</th>
          </tr>
          </thead>
          <tbody>
          {services.map(({ id, remarks }) => (
            <tr key={id}>
              <td>{remarks}</td>
              <td>
                <label className="pt-control pt-checkbox" style={{ marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    defaultChecked={autoStartServices.includes(id)}
                    onChange={(e) => this.onToggleAutoStart(e, id)}
                  />
                  <span className="pt-control-indicator"/>
                  Auto Start
                  <Tooltip content="Auto start after gui process restart" position={Position.RIGHT}>
                    <Icon icon="help" color='#394B59' iconSize={14} style={{ margin: '1px 0 0 3px' }}/>
                  </Tooltip>
                </label>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        <h3>Users</h3>
        <table className={classnames('pt-html-table pt-html-table-bordered', styles.table)}>
          <thead>
          <tr>
            <th>Name</th>
            <th>Properties</th>
            <th/>
          </tr>
          </thead>
          <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <EditableText
                  defaultValue={user.name}
                  onConfirm={(name) => this.onEditUserName(user.id, name)}
                />
              </td>
              <td>
                <UserItem user={user} onChange={this.onUserChange}/>
              </td>
              <td>
                <Icon icon="ban-circle" color="#db3737" onClick={() => this.onDeleteUser(user)}/>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        <div className={styles.buttons}>
          <Button loading={isSaving} intent="success" onClick={this.onSave}>Save</Button>
          <Button icon="plus" onClick={this.onOpenAddUserDialog}>Add User</Button>
        </div>
        <Dialog
          isOpen={isOpenAddUserDialog}
          title="Add User"
          onClose={() => this.setState({ isOpenAddUserDialog: false })}
        >
          <div className="pt-dialog-body">
            <label className="pt-label">
              UserName
              <span className="pt-text-muted">(required)</span>
              <div className="pt-input-group">
                <span className="pt-icon pt-icon-user"/>
                <input
                  className="pt-input"
                  type="text"
                  dir="auto"
                  value={currentUserName}
                  onChange={this.onUserNameChange}
                />
              </div>
            </label>
            <label className="pt-label">
              Password
              <span className="pt-text-muted">(required)</span>
              <div className="pt-input-group">
                <span className="pt-icon pt-icon-lock"/>
                <input
                  className="pt-input"
                  type="password"
                  dir="auto"
                  value={currentPassword}
                  onChange={this.onUserPasswordChange}
                />
              </div>
            </label>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                intent="primary"
                loading={isUserAdding}
                onClick={this.onAddUser}
                text="OK"
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

}
