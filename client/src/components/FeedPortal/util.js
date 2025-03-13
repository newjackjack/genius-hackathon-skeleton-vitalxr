/* eslint-disable no-param-reassign */
// @flow
import { produce } from 'immer';
import type {
  HeaderCard,
  ProductSummaryCard,
  FeedCard,
  CardFeedState,
  AppMerchantConfig,
  AppGridConfig,
} from '../../entities';

type getPortalDataReturn = {
  headerCard: ?HeaderCard,
  summaryCard: ?ProductSummaryCard,
};

export function getPortalData(feedCards: Array<FeedCard>): getPortalDataReturn {
  const result: getPortalDataReturn = {
    headerCard: null,
    summaryCard: null,
  };
  if (feedCards.length !== 0) {
    feedCards.forEach((card) => {
      if (card.type === 'header_card') {
        result.headerCard = card;
      }
      if (card.type === 'product_summary_card') {
        result.summaryCard = card;
      }
    });
  }
  return result;
}

export function clearUrlParams(params: Array<string>): void {
  if (params.length !== 0) {
    const currentURL = new URL(window.location.href);
    for (let i = 0; i < params.length; i += 1) {
      currentURL.searchParams.delete(params[i]);
    }
    if (window.history.replaceState) {
      window.history.replaceState(null, '', currentURL.href);
    }
  }
}

export function clearUtmParams(): void {
  clearUrlParams(['utm_term', 'pid']);
}

type GetBannerAttributes = {
  image: string,
  title: string,
  description: string,
};

export function getBannerAttributes(
  defaults: GetBannerAttributes,
): GetBannerAttributes {
  const currentURL = new URL(window.location.href);
  return {
    image: currentURL.searchParams.get('pg_hero_image') || defaults.image || '',
    title: currentURL.searchParams.get('pg_hero_title') || defaults.title || '',
    description:
      currentURL.searchParams.get('pg_hero_description')
      || defaults.description
      || '',
  };
}

export function getPortalClassName(): string {
  if (navigator.appVersion.indexOf('Win') === -1) {
    return 'pg-portal-feed pg-no-scroll-bar';
  }
  return 'pg-portal-feed';
}

function getCardSequence(card: FeedCard): string {
  if (
    card?.type === 'product_detail_card'
    || card?.type === 'variant_group_card'
  ) {
    return card.id;
  }
  if (card?.related_card_id) {
    return card.related_card_id;
  }
  return '';
}

function isValidPair(card: FeedCard, cardPrev: FeedCard): boolean {
  return (
    card
    && cardPrev
    && card.type !== 'social_content_card'
    && cardPrev.type !== 'social_content_card'
  );
}

function appendSequenceLinks(feed: CardFeedState): CardFeedState {
  return produce(feed, (draft) => {
    for (let i = 0; i < draft.feedCards.length; i += 1) {
      const cardPrev: FeedCard = draft.feedCards[i - 1];
      const card: FeedCard = draft.feedCards[i];
      if (isValidPair(card, cardPrev)) {
        const sequencePrev = getCardSequence(cardPrev);
        const sequence = getCardSequence(card);
        if (sequence !== sequencePrev) {
          // $FlowIgnore
          card.start_link = true;
          // $FlowIgnore
          cardPrev.end_link = true;
        }
      }
    }
  });
}

function appendGridLinks(
  feed: CardFeedState,
  grid: AppGridConfig,
): CardFeedState {
  if (grid?.mobile?.columns === 2) {
    return produce(feed, (draft) => {
      let count = 0;
      for (let i = 0; i < draft.feedCards.length; i += 1) {
        const card = draft.feedCards[i];
        if (card && card.layout_state === '1x1') {
          count += 1;
          const cardNext: FeedCard = draft.feedCards[i + 1];
          if (cardNext && cardNext.layout_state === '1x2') {
            if (count % 2 !== 0) {
              // $FlowIgnore
              card.two_col_empty = true;
              count = 0;
            }
          }
        }
      }
    });
  }
  return feed;
}

export function getFormattedFeed(
  feed: CardFeedState,
  config: AppMerchantConfig,
  grid: AppGridConfig,
): CardFeedState {
  if (config.enabled && config.mode === 'settings') {
    const injectionCards = [
      {
        index: 2,
        card: {
          id: 'merch_card_video_1',
          type: 'merch_card_video',
          source_id: 'HOME',
          render_key: 'merch_card_video_1',
        },
      },
      {
        index: 3,
        card: {
          id: 'merch_card_review_1',
          type: 'merch_card_review',
          source_id: 'HOME',
          render_key: 'merch_card_review_1',
        },
      },
      {
        index: 6,
        card: {
          id: 'merch_card_qa_1',
          type: 'merch_card_qa',
          source_id: 'HOME',
          render_key: 'merch_card_qa_1',
        },
      },
    ];
    const merchFeedCards = [...feed.feedCards];

    for (let i = 0; i < injectionCards.length; i += 1) {
      const { index, card } = injectionCards[i];
      merchFeedCards.splice(index, 0, card);
    }
    return {
      ...feed,
      feedCards: merchFeedCards,
    };
  }
  if (config.sequenceLines) {
    return appendSequenceLinks(feed);
  }
  if (grid.enabled) {
    return appendGridLinks(feed, grid);
  }
  return feed;
}
