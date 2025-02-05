// @flow
import React, { useRef } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appVideo.scss';

type AppVideoProps = {
  videoURL: string,
  position?: string,
  aspectRatio?: '16 / 9' | '9 /16',
  hover?: boolean,
  shadow?: boolean,
  style?: { [string]: any },
  onError?: (image: HTMLImageElement) => void | Promise<void>,
};

function AppVideo({
  videoURL,
  position,
  aspectRatio,
  shadow,
  style,
  hover,
  onError,
}: AppVideoProps): Node {
  const status = useRef('initial');
  return (
    <m.div
      data-status="loaded"
      data-model="background"
      data-shadow={shadow}
      data-hover={hover}
      style={style}
      className="pg-app-video"
      viewport={{ once: true }}
    >
      <iframe
        title="pg_video"
        className="pg-app-video-content"
        src={videoURL || ''}
        loading="lazy"
        style={{ objectPosition: position, aspectRatio }}
        onError={({ currentTarget }) => {
          if (status.current === 'initial') {
            status.current = 'error';
            currentTarget.removeAttribute('src');
            if (onError) {
              onError(currentTarget);
            }
          }
        }}
      />
    </m.div>
  );
}

AppVideo.defaultProps = {
  shadow: false,
  hover: false,
  aspectRatio: '16 / 9',
  position: 'unset',
  style: undefined,
  onError: undefined,
};

export default AppVideo;
