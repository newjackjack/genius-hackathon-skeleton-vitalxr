// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

// $FlowIgnore
import './banner.scss';
import AppMinimizeButton from '../AppMinimize/AppMinimizeButton';

type AppBannerInteractiveProps = {
  children: Node,
  onCloseBanner: () => void,
};

function AppBannerInteractive({
  children,
  onCloseBanner,
}: AppBannerInteractiveProps): Node {
  return (
    <m.div
      className="pg-interactive"
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'tween',
        duration: 0.2,
      }}
    >
      <div className="pg-interactive-banner">
        {children}
        <AppMinimizeButton
          style={{
            top: 6,
            right: 6,
            height: 28,
            width: 28,
            fontSize: 16,
          }}
          onMinimize={() => {
            onCloseBanner();
          }}
        />
      </div>
    </m.div>
  );
}

export default AppBannerInteractive;
