import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { FocusStyleManager } from "@blueprintjs/core";
import { I18nextProvider } from 'react-i18next';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';

import i18n from './i18n';

import 'nprogress/nprogress.css';
import 'normalize.css';
import './index.css';

import App from './containers/App/App';
import Landing from './containers/Landing/Landing';
// import registerServiceWorker from './registerServiceWorker';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Router>
        <Switch>
          <Route exact path="/landing" component={Landing}/>
          <Route path="/" component={App}/>
        </Switch>
      </Router>
    </I18nextProvider>,
    document.getElementById('root')
  );
});

// registerServiceWorker();
FocusStyleManager.onlyShowFocusOnTabs();

// initialize google analytics
if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize(process.env.GOOGLE_ANALYTICS_TRACKING_ID);
}
