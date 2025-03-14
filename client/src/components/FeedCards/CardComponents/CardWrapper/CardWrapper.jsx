// @flow
import React, { useContext, useLayoutEffect, useRef } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';
import type { FeedCard, CardLayoutState } from '../../../../entities';

// $FlowIgnore
import './cardWrapper.scss';
import { TrackingContext } from '../../../FeedPortal/feedTracker';

type CardWrapperProps = {
  card: FeedCard,
  size: 'small' | 'medium' | 'large' | 'auto' | '1x1',
  children?: Node,
  grid?: CardLayoutState,
  ghost?: boolean,
  shadow?: boolean,
  style?: {
    [string]: string|number,
  },
};

function isMetaCard(card: FeedCard): boolean {
  if (
    card.type === 'skeleton_card'
    || card.type === 'merch_card_video'
    || card.type === 'merch_card_review'
    || card.type === 'merch_card_qa'
  ) {
    return true;
  }
  return false;
}

function isContentCard(card: FeedCard): boolean {
  if (
    card.type === 'review_default_card'
    || card.type === 'question_answer_default_card'
    || card.type === 'social_content_card'
  ) {
    return true;
  }
  return false;
}

function CardWrapper({
  children,
  card,
  size,
  grid,
  style,
  ghost,
  shadow,
}: CardWrapperProps): Node {
  const { addTrackingRef, removeTrackingRef } = useContext(TrackingContext);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    /**
     * Add the card data and the element reference to the tracking context
     * if the card is not a meta card.
     */
    if (!isMetaCard(card) && cardRef.current && addTrackingRef) {
      addTrackingRef(card, cardRef.current);
    }
  }, [addTrackingRef, removeTrackingRef, card]);

  return (
    <m.div
      id={card.render_key}
      ref={cardRef}
      className="card-wrapper"
      data-size={size}
      data-grid={grid}
      data-ghost={ghost}
      data-content={isContentCard(card)}
      data-shadow={shadow}
      data-type={card.type}
      data-zig={card.start_link}
      data-zag={card.end_link}
      data-two-col-empty={card.two_col_empty}
      data-ratio={card.aspect_ratio || 'default'}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.25,
      }}
    >
      <div className="card-wrapper-content">{children}</div>
    </m.div>
  );
}

CardWrapper.defaultProps = {
  children: null,
  shadow: false,
  ghost: false,
  grid: '1x1',
  style: {
    backgroundColor: '',
    backgroundImage: '',
  },
};

export default CardWrapper;
