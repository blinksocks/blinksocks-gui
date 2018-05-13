import React from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, withStateHandlers } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Circle, Polyline, InfoWindow } from 'react-google-maps';

import styles from './GoogleMap.module.scss';
import { GOOGLE_MAP_API_KEY } from '../../../../constants';
import { call } from '../../../../utils';

const CustomInfoWindow = ({ lat, lon, as, query: ip, country, regionName, city, org, hostname, onClose }) => (
  <InfoWindow
    position={{ lat: lat, lng: lon }}
    onCloseClick={onClose}
  >
    <ul className={styles.infoWindow}>
      <li><b>IP:</b>{ip}</li>
      {hostname && <li><b>Host:</b>{hostname || '-'}</li>}
      <li><b>Location:</b>{[...new Set([regionName, city, country])].join(' ')}</li>
      <li><b>AS:</b>{as || '-'}</li>
      <li><b>Org:</b>{org || '-'}</li>
    </ul>
  </InfoWindow>
);

const Map = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: '100%' }}/>,
    containerElement: <div style={{ height: '500px' }}/>,
    mapElement: <div style={{ height: '100%' }}/>,
  }),
  withStateHandlers(() => ({
    infoWindow: {
      display: false,
      props: null,
    },
  }), {
    onToggleInfoWindow: () => (isOpen, props) => {
      return {
        infoWindow: {
          display: !isOpen,
          props: props,
        }
      };
    },
    onCloseInfoWindow: () => () => {
      return { infoWindow: { display: false, props: null } };
    },
  }),
  withScriptjs,
  withGoogleMap,
)(({ defaultCenter, ips, infoWindow, onToggleInfoWindow, onCloseInfoWindow }) =>
  <GoogleMap
    defaultZoom={2}
    defaultCenter={defaultCenter}
  >
    {ips.map((item, index) =>
      <Circle
        key={index}
        onClick={() => onToggleInfoWindow(infoWindow.display, item)}
        options={{
          center: { lat: item.lat, lng: item.lon },
          radius: 30000,
          fillColor: item.self ? '#ff0000' : '#0000ff',
          fillOpacity: 0.6,
          strokeWeight: 1,
          strokeOpacity: 0.8,
          strokeColor: item.self ? '#ff0000' : '#0000ff',
        }}
      />
    )}
    {ips.map((item, index) =>
      <Polyline
        key={index}
        options={{
          path: [defaultCenter, { lat: item.lat, lng: item.lon }],
          strokeWeight: 1,
          strokeOpacity: 0.8,
          strokeColor: item.inbound ? '#FFC940' : '#669EFF',
        }}
      />
    )}
    {infoWindow.display && (
      <CustomInfoWindow {...infoWindow.props} onClose={onCloseInfoWindow}/>
    )}
  </GoogleMap>
);

export default class _GoogleMap extends React.Component {

  static propTypes = {
    sid: PropTypes.string.isRequired,
  };

  state = {
    ips: [],
  };

  componentDidMount() {
    this.timer = window.setInterval(this.fetchIPs, 5e3);
    this.fetchIPs();
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  fetchIPs = async () => {
    try {
      const ips = await call('get_geoip', { id: this.props.sid });
      this.setState({ ips });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { ips } = this.state;
    const self = ips.filter(({ self }) => self)[0] || { lat: 0, lon: 0 };
    return (
      <div className={styles.container}>
        <Map
          defaultCenter={{ lat: self.lat, lng: self.lon }}
          ips={ips}
        />
      </div>
    );
  }

}
