import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import { call } from '../../../utils';

export default class AddService extends React.Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  state = {
    remarks: '',
    isPending: false,
  };

  onRemarksChange = (e) => {
    this.setState({ remarks: e.target.value });
  };

  onAddSetting = async () => {
    const { history } = this.props;
    const { remarks } = this.state;
    try {
      this.setState({ isPending: true });
      const id = await call('add_setting', { remarks });
      history.push('/services/' + id + '/setting');
    } catch (err) {
      console.error(err);
    }
    this.setState({ isPending: false });
  };

  render() {
    const { remarks, isPending } = this.state;
    return (
      <div>
        <ul className="pt-breadcrumbs">
          <li><span className="pt-breadcrumbs-collapsed"/></li>
          <li>
            <Link className="pt-breadcrumb" to="/">Dashboard</Link>
          </li>
          <li><span className="pt-breadcrumb pt-breadcrumb-current">Add Service</span></li>
        </ul>
        <br/>
        <label className="pt-label">
          Remarks&nbsp;
          <span className="pt-text-muted">(required)</span>
          <input
            autoFocus
            type="text"
            className="pt-input"
            placeholder="remarks"
            value={remarks}
            onChange={this.onRemarksChange}
          />
        </label>
        <Button intent="success" loading={isPending} onClick={this.onAddSetting}>
          Next
          <span className="pt-icon-standard pt-icon-arrow-right pt-align-right"/>
        </Button>
      </div>
    );
  }

}
