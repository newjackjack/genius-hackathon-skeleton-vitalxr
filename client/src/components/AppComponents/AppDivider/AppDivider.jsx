// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appDivider.scss';

type AppDividerProps = {
  color?: 'dark' | 'light',
  size?: 'm' | 'l',
  style?: { [string]: any },
};

function AppDivider({ size, color, style }: AppDividerProps): Node {
  return (
    <m.div
      data-color={color}
      data-size={size}
      className="pg-app-divider"
      style={style}
    />
  );
}

AppDivider.defaultProps = {
  size: 'm',
  color: 'dark',
  style: undefined,
};

export default AppDivider;
