// @flow
import React, { useCallback, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { Node } from 'react';

import AppBannerInteractive from '../AppBanner/AppBannerInteractive';

// $FlowIgnore
import './appNotifications.scss';

type MerchNotification = {
  text: string,
  id?: string,
  type: 'toast',
  duration: number,
  dismissed?: boolean,
};

type NotificationItemProps = {
  index: number,
  notification: MerchNotification,
  onDismissNotification: (notification: MerchNotification) => void,
};

function NotificationItem({
  index,
  notification: n,
  onDismissNotification,
}: NotificationItemProps): Node {
  return (
    <div
      className="pg-notification"
      key={n.id}
      style={{
        zIndex: 1000 + index,
        bottom: 20 + index * 60,
      }}
    >
      <AppBannerInteractive
        onCloseBanner={() => {
          onDismissNotification(n);
        }}
      >
        {n.text}
      </AppBannerInteractive>
    </div>
  );
}

export default function AppNotifications(): Node {
  const [notifications, setNotifications] = React.useState<MerchNotification[]>(
    [],
  );

  const dismissNotification = useCallback((notification: MerchNotification) => {
    setNotifications((list) => list.map((n) => {
      if (n.id === notification.id) {
        return { ...n, dismissed: true };
      }
      return n;
    }));
  }, []);

  const dispatch = useCallback(
    (notification: MerchNotification) => {
      const formattedNotification: MerchNotification = {
        ...notification,
        id: uuid(),
        dismissed: false,
      };
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        formattedNotification,
      ]);
      setTimeout(() => {
        dismissNotification(formattedNotification);
      }, notification.duration);
    },
    [dismissNotification],
  );

  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      if (event.detail.text) {
        dispatch({
          text: event.detail.text,
          type: 'toast',
          duration: 8000,
        });
      }
    };
    window.addEventListener('pg-feed-notification', handleMessage);
    return () => {
      window.removeEventListener('pg-feed-notification', handleMessage);
    };
  }, [dispatch]);

  return notifications
    .filter((n) => !n.dismissed)
    .slice(-3)
    .map((n, index) => {
      if (n.type === 'toast') {
        return (
          <NotificationItem
            key={n.id}
            index={index}
            notification={n}
            onDismissNotification={dismissNotification}
          />
        );
      }
      return null;
    });
}
