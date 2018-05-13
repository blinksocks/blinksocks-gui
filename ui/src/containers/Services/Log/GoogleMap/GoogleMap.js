import React from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, withStateHandlers } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline, InfoWindow } from 'react-google-maps';

import styles from './GoogleMap.module.scss';
import { GOOGLE_MAP_API_KEY } from '../../../../constants';
import { call } from '../../../../utils';

const CustomInfoWindow = ({ lat, lng, as, ips, country, regionName, city, org, hostname, onClose }) => (
  <InfoWindow
    position={{ lat, lng }}
    onCloseClick={onClose}
  >
    <ul className={styles.infoWindow}>
      <li><b>Location:</b>{[...new Set([regionName, city, country])].join(' ')}</li>
      <li>
        <b>IP{ips.length > 1 && `(${ips.length})`}:</b>
        <pre>{ips.join('\n')}</pre>
      </li>
      {hostname && (
        <li>
          <b>Host{hostname.length > 1 && `(${hostname.length})`}:</b>
          <pre>{hostname.join('\n') || '-'}</pre>
        </li>
      )}
      <li><b>AS:</b>{as || '-'}</li>
      <li><b>Org:</b>{org || '-'}</li>
    </ul>
  </InfoWindow>
);

const Map = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: '100%' }}/>,
    containerElement: <div style={{ height: '650px' }}/>,
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
    onClick={onCloseInfoWindow}
    defaultZoom={2}
    defaultCenter={defaultCenter}
  >
    {ips.map((item, index) =>
      <Marker
        key={index}
        onClick={() => onToggleInfoWindow(infoWindow.display, item)}
        options={{
          position: { lat: item.lat, lng: item.lng },
          icon: item.self ? '' : {
            url: require('./destination.png'),
            scaledSize: { width: 16, height: 16 },
            anchor: { x: 8, y: 8 },
          },
        }}
      />
    )}
    {ips.map((item, index) =>
      <Polyline
        key={index}
        options={{
          path: [defaultCenter, { lat: item.lat, lng: item.lng }],
          strokeWeight: 1,
          strokeColor: item.inbound ? '#ff8d1f' : '#6b6d70',
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
    const self = ips.filter(({ self }) => self)[0] || { lat: 21.289, lng: -175.253 };
    return (
      <div className={styles.container}>
        <Map
          defaultCenter={{ lat: self.lat, lng: self.lng }}
          ips={ips}
        />
      </div>
    );
  }

}
