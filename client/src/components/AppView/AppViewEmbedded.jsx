// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';

import { ConfigContext } from '../../context';
import { useCardFeedController } from '../../controllers/FeedController/feedControllerHook';
import FeedPortal from '../FeedPortal/FeedPortal';
import AppEmbeddedWrapper from './AppEmbeddedWrapper';
import AppNotifications from '../AppNotifications/AppNotifications';

/**
 * Renders PG "embedded" app view.
 * @returns {React.Node} Rendered content
 */
function AppViewEmbedded(): Node {
  const appConfig = useContext(ConfigContext);
  const { controller, state } = useCardFeedController(appConfig);

  return (
    <AppEmbeddedWrapper>
      <FeedPortal state={state} controller={controller} />
      <AppNotifications />
    </AppEmbeddedWrapper>
  );
}

export default AppViewEmbedded;
