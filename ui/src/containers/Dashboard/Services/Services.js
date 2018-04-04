import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from '@blueprintjs/core';

import Service from './Service/Service';
import styles from './Services.module.css';

import { call } from '../../../utils';

export default class Services extends React.Component {

  state = {
    services: [],
  };

  componentDidMount() {
    this.fetchServices();
  }

  async fetchServices() {
    try {
      const services = await call('get_services');
      this.setState({ services });
    } catch (err) {
      console.error(err.message);
    }
  }

  onCopyService = async (id) => {
    try {
      await call('copy_setting', { id });
      await this.fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  onRemoveService = async (id) => {
    if (window.confirm('Are you sure to remove this service?')) {
      try {
        await call('delete_setting', { id });
        await this.fetchServices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  render() {
    const { services } = this.state;
    return (
      <ul className={styles.container}>
        {services.map((service) => (
          <Service
            key={service.id}
            service={service}
            onCopy={() => this.onCopyService(service.id)}
            onRemove={() => this.onRemoveService(service.id)}
          />
        ))}
        <Link to="/services/add">
          <li className={classnames('pt-card pt-elevation-1 pt-interactive', styles.center)}>
            <Icon icon="plus" iconSize={60}/>
          </li>
        </Link>
      </ul>
    );
  }

}
