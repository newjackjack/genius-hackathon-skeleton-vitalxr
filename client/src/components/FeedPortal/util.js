/* eslint-disable no-param-reassign */
// @flow
import { produce } from 'immer';
import type {
  HeaderCard,
  ProductSummaryCard,
  FeedCard,
  FeedSortOption,
  Product,
  CardFeedState,
  AppMerchantConfig,
  AppGridConfig,
} from '../../entities';
import { getHeaderContentType } from '../../utils/componentUtils';

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

function getProductAttribute(product: Product, attrName: string): any {
  if (product.attributes) {
    const attr = product.attributes.find((a) => a.name === attrName);
    if (attr) {
      return attr.value;
    }
  }
  return null;
}

type SortDataResult =
  | { sortable: false, product: null }
  | { sortable: true, product: Product };

function getSortData(card: FeedCard): SortDataResult {
  if (card.type === 'product_detail_card' && card.product) {
    return {
      sortable: true,
      product: card.product,
    };
  }
  if (card.type === 'variant_group_card') {
    const firsttKey = Object.keys(card.variants_info)[0];
    if (firsttKey && card.variants_info[firsttKey].product) {
      return {
        sortable: true,
        product: card.variants_info[firsttKey].product,
      };
    }
  }
  return {
    sortable: false,
    product: null,
  };
}

type GetSortedFeedReturn = {
  sortedCards: Array<FeedCard>,
  showSort: boolean,
};

export function getSortedFeed(
  feedCards: Array<FeedCard>,
  sortOption: FeedSortOption,
): GetSortedFeedReturn {
  const { headerCard } = getPortalData(feedCards);
  if (headerCard) {
    if (getHeaderContentType(headerCard) === 'cart') {
      return {
        sortedCards: feedCards,
        showSort: false,
      };
    }
  }

  if (!sortOption || sortOption === 'featured') {
    return {
      sortedCards: feedCards,
      showSort: true,
    };
  }

  if (sortOption === 'best-selling') {
    const sortedCards = produce(feedCards, (draft) => {
      draft.sort((a, b) => {
        const sortA = getSortData(a);
        const sortB = getSortData(b);

        if (!sortA.sortable && !sortB.sortable) return 0;
        if (!sortA.sortable) return 1;
        if (!sortB.sortable) return -1;

        const attrA = getProductAttribute(sortA.product, 'Usf');
        const attrB = getProductAttribute(sortB.product, 'Usf');
        if (attrA === null || attrB === null) return 0;
        if (attrA === 'Bestseller' && attrB === 'Bestseller') return 0;
        if (attrA === 'Bestseller') return -1;
        if (attrB === 'Bestseller') return 1;
        return 0;
      });
    });
    return {
      sortedCards,
      showSort: true,
    };
  }

  if (sortOption === 'newest-to-oldest' || sortOption === 'oldest-to-newest') {
    const sortedCards = produce(feedCards, (draft) => {
      draft.sort((a, b) => {
        const sortA = getSortData(a);
        const sortB = getSortData(b);

        if (!sortA.sortable && !sortB.sortable) return 0;
        if (!sortA.sortable) return 1;
        if (!sortB.sortable) return -1;

        if (
          sortA.product.created_at === null
          && sortB.product.created_at === null
        ) { return 0; }
        if (sortA.product.created_at === null) return -1;
        if (sortB.product.created_at === null) return 1;

        const dateA = Date.parse(sortA.product.created_at);
        const dateB = Date.parse(sortB.product.created_at);

        if (sortOption === 'newest-to-oldest') {
          return dateB - dateA;
        }
        return dateA - dateB;
      });
    });
    return {
      sortedCards,
      showSort: true,
    };
  }

  if (sortOption === 'price-low-to-high' || sortOption === 'price-high-to-low') {
    const sortedCards = produce(feedCards, (draft) => {
      draft.sort((a, b) => {
        const sortA = getSortData(a);
        const sortB = getSortData(b);

        if (!sortA.sortable && !sortB.sortable) return 0;
        if (!sortA.sortable) return 1;
        if (!sortB.sortable) return -1;

        const attrA = getProductAttribute(sortA.product, 'price');
        const attrB = getProductAttribute(sortB.product, 'price');
        if (attrA === null || attrB === null) return 0;

        const priceValueA = parseFloat(attrA);
        const priceValueB = parseFloat(attrB);

        if (Number.isNaN(priceValueA) || Number.isNaN(priceValueB)) return 0;
        if (sortOption === 'price-low-to-high') {
          return priceValueA > priceValueB ? 1 : -1;
        }
        return priceValueB > priceValueA ? 1 : -1;
      });
    });
    return {
      sortedCards,
      showSort: true,
    };
  }

  if (sortOption === 'a-to-z' || sortOption === 'z-to-a') {
    const sortedCards = produce(feedCards, (draft) => {
      draft.sort((a, b) => {
        const sortA = getSortData(a);
        const sortB = getSortData(b);

        if (!sortA.sortable && !sortB.sortable) return 0;
        if (!sortA.sortable) return 1;
        if (!sortB.sortable) return -1;

        if (sortOption === 'a-to-z') {
          return sortA.product.title.localeCompare(sortB.product.title);
        }
        return sortB.product.title.localeCompare(sortA.product.title);
      });
    });
    return {
      sortedCards,
      showSort: true,
    };
  }
  return {
    sortedCards: feedCards,
    showSort: true,
  };
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

function appendSequenceLinks(feed: CardFeedState): CardFeedState {
  return produce(feed, (draft) => {
    for (let i = 0; i < draft.feedCards.length; i += 1) {
      const cardPrev: FeedCard = draft.feedCards[i - 1];
      const card: FeedCard = draft.feedCards[i];
      const sequencePrev = getCardSequence(cardPrev);
      const sequence = getCardSequence(card);
      if (sequence !== sequencePrev) {
        // $FlowIgnore
        card.start_link = true;
        // $FlowIgnore
        cardPrev.end_link = true;
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
