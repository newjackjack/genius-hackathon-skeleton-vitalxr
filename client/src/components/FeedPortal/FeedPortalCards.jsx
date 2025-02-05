// @flow
import React from 'react';
import type { Node } from 'react';

import type {
  AddToCartCB,
  FeedCard,
  SuggestionButton,
  CardFeedState,
} from '../../entities';

import {
  FeedProductCard,
  FeedQuestionRevealCard,
  FeedQuestionCardDefault,
  FeedFacetCard,
  FeedTextInputCard,
  FeedReviewCard,
  FeedReviewCardDefault,
  FeedCustomerServiceCard,
  FeedSocialContentCard,
  FeedBlogCard,
  FeedProductDescriptionCard,
  FeedProductSummaryCard,
  FeedProductImageCard,
  FeedVideoCard,
  FeedCouponCard,
  FeedProductVariantCard,
  FeedGreetingCard,
  FeedComparisonCard,
  FeedBannerCard,
  FeedMerchVideoCard,
  FeedMerchReviewCard,
  FeedMerchQaCard,
  FeedStoryCard,
} from '../FeedCards';

import FeedPortalBanner from './FeedPortalBanner';
import FeedPaginationTrigger from './FeedPaginationTrigger';

import { FeedCardTracker } from './feedTracker';

// $FlowIgnore
import './feedPortalCards.scss';
import { useShowFilterOptions } from '../../hooks';
import { getPortalClassName } from './util';

type FeedCardsProps = {
  feed: CardFeedState,
  pagination: boolean,
  onCardSelect: (FeedCard) => void | Promise<void>,
  onFacetSelect: (
    feedCard: FeedCard,
    facet: SuggestionButton
  ) => void | Promise<void>,
  onCardInputSubmit: (
    feedCard: FeedCard,
    inputValue: string
  ) => void | Promise<void>,
  onAddToCart: AddToCartCB,
  onAddCoupon: (feedCard: FeedCard) => void | Promise<void>,
};

function FeedCards({
  feed,
  pagination,
  onCardSelect,
  onFacetSelect,
  onCardInputSubmit,
  onAddToCart,
  onAddCoupon,
}: FeedCardsProps): Node {
  const { feedCards } = feed;
  const { visible } = useShowFilterOptions(feedCards);

  return (
    <div className={getPortalClassName()}>
      <FeedPortalBanner />
      <FeedCardTracker>
        {feedCards.map((card) => {
          if (card.type === 'merch_card_video') {
            return <FeedMerchVideoCard key={card.render_key} card={card} />;
          }
          if (card.type === 'merch_card_review') {
            return <FeedMerchReviewCard key={card.render_key} card={card} />;
          }
          if (card.type === 'merch_card_qa') {
            return <FeedMerchQaCard key={card.render_key} card={card} />;
          }
          if (card.type === 'storycard') {
            return <FeedStoryCard key={card.render_key} card={card} />;
          }
          if (card.type === 'banner_card') {
            return <FeedBannerCard key={card.render_key} card={card} />;
          }
          if (card.type === 'product_detail_card') {
            return (
              <FeedProductCard
                key={card.render_key}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          if (card.type === 'question_answer_default_card') {
            return <FeedQuestionCardDefault key={card.render_key} card={card} />;
          }
          if (card.type === 'question_answer_reveal_card') {
            return <FeedQuestionRevealCard key={card.render_key} card={card} />;
          }
          if (card.type === 'facet_value_card' && !visible) {
            return (
              <FeedFacetCard
                key={card.render_key}
                card={card}
                onFacetSelect={onFacetSelect}
              />
            );
          }
          if (card.type === 'text_input_card') {
            return (
              <FeedTextInputCard
                key={card.render_key}
                card={card}
                onCardInputSubmit={onCardInputSubmit}
              />
            );
          }
          if (card.type === 'review_card') {
            return <FeedReviewCard key={card.render_key} card={card} />;
          }
          if (card.type === 'review_default_card') {
            return <FeedReviewCardDefault key={card.render_key} card={card} />;
          }
          if (card.type === 'customer_service_card') {
            return <FeedCustomerServiceCard key={card.render_key} card={card} />;
          }
          if (card.type === 'social_content_card') {
            return <FeedSocialContentCard key={card.render_key} card={card} />;
          }
          if (card.type === 'blog_card') {
            return <FeedBlogCard key={card.render_key} card={card} />;
          }
          if (card.type === 'product_summary_card') {
            return (
              <FeedProductSummaryCard
                key={card.render_key}
                card={card}
                onAddToCart={onAddToCart}
              />
            );
          }
          if (card.type === 'product_description_card') {
            return <FeedProductDescriptionCard key={card.render_key} card={card} />;
          }
          if (card.type === 'product_image_card') {
            return <FeedProductImageCard key={card.render_key} card={card} />;
          }
          if (card.type === 'video_card') {
            return <FeedVideoCard key={card.render_key} card={card} />;
          }
          if (card.type === 'coupon_card') {
            return (
              <FeedCouponCard
                key={card.render_key}
                card={card}
                onAddCoupon={onAddCoupon}
              />
            );
          }
          if (card.type === 'variant_group_card') {
            return (
              <FeedProductVariantCard
                key={card.render_key}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          if (card.type === 'introduction_card') {
            return <FeedGreetingCard key={card.render_key} card={card} />;
          }
          if (card.type === 'comparison_card') {
            return (
              <FeedComparisonCard
                key={card.render_key}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          return null;
        })}
      </FeedCardTracker>
      <FeedPaginationTrigger loading={pagination} />
    </div>
  );
}

const areEqual = (
  prevProps: FeedCardsProps,
  nextProps: FeedCardsProps,
): boolean => {
  if (prevProps.feed !== nextProps.feed) return false;
  if (prevProps.pagination !== nextProps.pagination) return false;
  return true;
};

// $FlowIgnore
export default React.memo<FeedCardsProps>(FeedCards, areEqual);
