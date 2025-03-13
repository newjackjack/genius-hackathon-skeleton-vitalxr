// @flow
import {
  useReducer,
  useCallback,
  useMemo,
} from 'react';

import type { AppFeedState, ServerBehavior } from '../../entities';

import feedControllerReducer from './feedControllerReducer';
import { Analytics } from '../../analytics';
import { ChatController } from '../../ChatController';
import { FeedCardController } from './FeedCardController';

const getInitialState = (): AppFeedState => ({
  feed: {
    feedId: '',
    feedSource: '',
    feedCards: [],
  },
  loading: true,
  pagination: false,
});

export type UseCardFeedControllerProps = {
  organizationId: string,
  serverURL: string,
  analytics: Analytics,
  serverBehavior: ?ServerBehavior,
};

export type UseCardFeedControllerReturn = {
  state: AppFeedState,
  controller: ChatController,
};

/**
 * Card controllers state & callback wrapper hook.
 * The wrapper uses the reducer pattern to update state
 * and handle the callback events.
 */
export function useCardFeedController({
  organizationId,
  serverURL,
  analytics,
  serverBehavior,
}: UseCardFeedControllerProps): UseCardFeedControllerReturn {
  const [state, dispatch] = useReducer(feedControllerReducer, getInitialState());
  const initControllerCallbacks = useCallback((instance: ChatController) => {
    instance.on('visitorMessage', () => {
      dispatch({ type: 'toggleLoading', loading: true });
    });
    instance.on('loading', (loading) => {
      dispatch({ type: 'toggleLoading', loading });
    });
    instance.on('botMessage', (message) => {
      if (message.type === 'bot_message_pagination') {
        dispatch({
          type: 'addFeedCards',
          feedCards: message.cards,
        });
      } else if (message.type === 'bot_message' && message.cards) {
        dispatch({
          type: 'setFeedCards',
          feedCards: message.cards,
          feedId: message.id,
          feedSource: message.cards[0]?.source_id,
        });
      }
    });
    instance.on('pagination', (loading) => {
      dispatch({ type: 'togglePagination', loading });
    });
  }, []);
  const serverBehaviorJson = JSON.stringify(serverBehavior || null);
  const controller = useMemo(() => {
    const controllerInstance = new FeedCardController(
      organizationId,
      serverURL,
      analytics,
      JSON.parse(serverBehaviorJson),
    );
    initControllerCallbacks(controllerInstance);
    return controllerInstance;
  }, [
    organizationId,
    serverURL,
    initControllerCallbacks,
    serverBehaviorJson,
    analytics,
  ]);
  if (controller.status.state === 'initial') {
    controller.initState();
  }
  return { controller, state };
}
