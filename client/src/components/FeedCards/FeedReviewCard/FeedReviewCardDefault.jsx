// @flow
import React from 'react';
import type { Node } from 'react';

import type { ReviewCardDefault } from '../../../entities';
import { CardSpace, CardWrapper } from '../CardComponents';
import { AppRating, AppText, AppDivider } from '../../AppComponents';

type FeedReviewCardDefaultProps = {
  card: ReviewCardDefault,
};

function FeedReviewCardDefault({ card }: FeedReviewCardDefaultProps): Node {
  const renderProductRating = (): Node => {
    if (card.review_info.stars) {
      return (
        <div
          className="pg-card-product-rating"
          style={{
            paddingBottom: 'calc(var(--pg-padding-card-content-title) - 4px)',
          }}
        >
          <AppRating
            style={{ scale: '1.2', transformOrigin: 'left' }}
            ratingValue={card.review_info.stars}
            ratingCount={1}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <CardWrapper
      size="auto"
      card={card}
      grid={card.layout_state || '1x1'}
    >
      <CardSpace
        selector="pg-review-card-1x2-default"
        type="vertical-full"
        style={{
          padding: 'var(--pg-padding-content)',
        }}
      >
        <div className="pg-card-section">
          {renderProductRating()}
          {card.review_info.product_title && (
            <AppText bold size="l">
              {card.review_info.product_title}
            </AppText>
          )}
        </div>
        <AppDivider size="l" color="dark" />
        <AppText size="m">{`"${card.review_info.review_text}"`}</AppText>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedReviewCardDefault;
