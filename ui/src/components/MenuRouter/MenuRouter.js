import React from 'react';
import { Route, Link } from 'react-router-dom';
import classnames from 'classnames';
import styles from './MenuRouter.module.css';

export const MenuRouter = ({ routes, children, style }) => (
  <ul className={styles.container} style={style}>
    {routes.map(({ path, disabled, text, exact }, i) => text && (
      <Route key={i} path={path} exact={exact}>
        {({ match }) => (match || disabled) ? (
          <MenuRouterItem active={match} disabled={disabled}>{text}</MenuRouterItem>
        ) : (
          <Link to={path}>
            <MenuRouterItem active={match} disabled={disabled}>{text}</MenuRouterItem>
          </Link>
        )}
      </Route>
    ))}
    {children}
  </ul>
);

export const MenuRouterItem = ({ active, disabled, children }) => (
  <li className={classnames({ [styles.active]: active, [styles.disabled]: disabled })}>
    {children}
  </li>
);

export const MenuRouterDivider = () => (
  <li className={styles.divider}/>
);
