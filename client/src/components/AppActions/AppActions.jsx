// @flow
import React from 'react';
import type { Node } from 'react';

import type { AppFeedState } from '../../entities';
import type { ChatController } from '../../ChatController';
import AppBannerInteractive from '../AppBanner/AppBannerInteractive';
import { clearUrlParams } from '../FeedPortal/util';

type AppActionsProps = {
  state: AppFeedState,
  controller: ChatController,
};

function AppActions({ state, controller }: AppActionsProps): Node {
  const { actionCalls } = state;

  const handleCloseBanner = () => {
    controller.callbacks.callToAction({ type: 'clear_action_calls' });
  };

  const lastAction = actionCalls[actionCalls.length - 1];
  if (lastAction && lastAction.type === 'interactive_message') {
    return (
      <AppBannerInteractive
        onCloseBanner={() => {
          handleCloseBanner();
          clearUrlParams(['coupon']);
        }}
      >
        {lastAction.text}
      </AppBannerInteractive>
    );
  }
  return null;
}

export default AppActions;
