// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appText.scss';

type AppTextProps = {
  children: Node | null,
  color?: 'dark' | 'light',
  size?: 'm' | 'l',
  bold?: boolean,
  style?: { [string]: any },
  selector?: string,
};

function AppText({
  children,
  size,
  bold,
  color,
  style,
  selector,
}: AppTextProps): Node {
  return (
    <m.div
      data-color={color}
      data-size={size}
      data-bold={bold}
      data-selector={selector}
      className="pg-app-text"
      style={style}
    >
      {children}
    </m.div>
  );
}

AppText.defaultProps = {
  size: 'm',
  color: 'dark',
  bold: false,
  selector: undefined,
  style: undefined,
};

export default AppText;
