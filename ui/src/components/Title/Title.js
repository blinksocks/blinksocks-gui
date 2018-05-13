import React from 'react';
import { Helmet } from 'react-helmet';
import { APP_NAME } from '../../constants';

export default function Title({ children = '' }) {
  return <Helmet><title>{children} - {APP_NAME}</title></Helmet>;
}
