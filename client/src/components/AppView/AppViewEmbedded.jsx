// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';

import { ConfigContext, DesignContext } from '../../context';
import { useCardFeedController } from '../../controllers/FeedController/feedControllerHook';
import FeedPortal from '../FeedPortal/FeedPortal';
import AppEmbeddedWrapper from './AppEmbeddedWrapper';
import AppNotifications from '../AppNotifications/AppNotifications';
import { useSourceTracker } from '../AppTracking/sourceTracker';

/**
 * Renders PG "embedded" app view.
 * @returns {React.Node} Rendered content
 */
function AppViewEmbedded(): Node {
  const appConfig = useContext(ConfigContext);
  const design = useContext(DesignContext);
  const { controller, state } = useCardFeedController(appConfig);
  useSourceTracker({
    enabled: design.tracking.source.enabled,
    rules: design.tracking.source.rules,
    analytics: controller.analytics,
  });

  return (
    <AppEmbeddedWrapper>
      <FeedPortal state={state} controller={controller} />
      <AppNotifications />
    </AppEmbeddedWrapper>
  );
}

export default AppViewEmbedded;
