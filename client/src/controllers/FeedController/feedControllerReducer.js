/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import type { AppFeedState } from '../../entities';

export default produce((draft: AppFeedState, action) => {
  switch (action.type) {
    case 'addFeedCards': {
      draft.pagination = false;
      draft.feed.feedCards = draft.feed.feedCards.concat(action.feedCards);
      break;
    }
    case 'setFeedCards': {
      draft.loading = false;
      draft.feed = {
        feedCards: action.feedCards,
        feedId: action.feedId,
        feedSource: action.feedSource,
      };
      break;
    }
    case 'toggleLoading':
      draft.loading = action.loading;
      break;
    case 'togglePagination':
      draft.pagination = action.loading;
      break;
    default:
      break;
  }
});
