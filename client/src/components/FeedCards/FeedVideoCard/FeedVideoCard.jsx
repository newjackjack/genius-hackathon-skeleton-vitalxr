// @flow
import React, { useRef, useContext, useLayoutEffect } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { VideoCard } from '../../../entities';
import { getVideoId } from '../../../utils/componentUtils';
import { feedVideoTracker, toggleVideoPlayState } from '../../FeedPortal/feedTracker';
import { ConfigContext, MobileContext } from '../../../context';

type VideoCardProps = {
  card: VideoCard,
};

function FeedVideoCard({ card }: VideoCardProps): Node {
  const iframeRef = useRef<HTMLIFrameElement|null>(null);
  const cardRef = useRef<HTMLDivElement|null>(null);
  const visibleRef = useRef(false);
  const playStateRef = useRef('pauseVideo');
  const timestampRef = useRef(0);
  const { source, id } = getVideoId(card.video_link_url);
  const isMobile = useContext(MobileContext);
  const { analytics } = useContext(ConfigContext);

  const handlePlayState = React.useCallback(
    (func: 'playVideo' | 'pauseVideo' | 'toggle') => {
      if (iframeRef.current) {
        playStateRef.current = func;
        toggleVideoPlayState({
          func,
          key: card.render_key,
          volume: 90,
          iframe: iframeRef.current,
        });
        if (func === 'playVideo' && !timestampRef.current) {
          timestampRef.current = Date.now();
        } else if (func === 'pauseVideo' && timestampRef.current) {
          const payload = {
            durationData: {
              viewStartTimestamp: timestampRef.current,
              viewEndTimestamp: Date.now(),
              feedCard: JSON.parse(JSON.stringify(card)),
            },
          };
          analytics.track('feed card video watch duration', payload);
        }
      }
    },
    [card, analytics],
  );

  useLayoutEffect(() => {
    const { current: element } = cardRef;
    if (element && isMobile) {
      const callback = (intersecting: boolean) => {
        visibleRef.current = intersecting;
        handlePlayState(intersecting ? 'playVideo' : 'pauseVideo');
      };
      feedVideoTracker.on(card.render_key, callback);
      feedVideoTracker.observe(element);
    }
    return () => {
      if (element) {
        feedVideoTracker.unobserve(element);
      }
    };
  }, [card.render_key, isMobile, handlePlayState]);

  if (source === 'youtube' && id) {
    return (
      <CardWrapper
        size="large"
        card={card}
        grid={card.layout_state || '1x2'}
      >
        <CardSpace type="vertical-full">
          <m.div
            ref={cardRef}
            id={card.render_key}
            className="pg-card-embedded"
            onHoverStart={() => {
              if (!isMobile) {
                handlePlayState('playVideo');
              }
            }}
            onHoverEnd={() => {
              if (!isMobile) {
                handlePlayState('pauseVideo');
              }
            }}
          >
            <iframe
              ref={iframeRef}
              className="pg-card-embedded-youtube"
              title="pg-card-embedded-content"
              src={`https://www.youtube.com/embed/${id}?enablejsapi=1&mute=1`}
              allowFullScreen
              scrolling="no"
              frameBorder="0"
              allow="encrypted-media; autoplay"
              onLoad={() => {
                if (visibleRef.current && isMobile) {
                  handlePlayState('playVideo');
                }
              }}
            />
            {isMobile && (
              <m.div
                style={{
                  position: 'absolute',
                  height: 'calc(100% - 35px)',
                  width: '100%',
                  top: 0,
                  left: 0,
                }}
                onClick={() => {
                  handlePlayState(
                    playStateRef.current === 'playVideo'
                      ? 'pauseVideo'
                      : 'playVideo',
                  );
                }}
              />
            )}
          </m.div>
        </CardSpace>
      </CardWrapper>
    );
  }
  return null;
}

export default FeedVideoCard;
