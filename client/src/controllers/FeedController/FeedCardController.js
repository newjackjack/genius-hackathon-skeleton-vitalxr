// @flow
import { v4 as uuid } from 'uuid';
import type { VisitorMessage, ServerBehavior } from '../../entities';
import { ChatController } from '../../ChatController';
import { Analytics } from '../../analytics';
import { getServerUrl } from '../utils';

export class FeedCardController extends ChatController {
  #socketUrlBase: string;
  #status: { state: string };
  pagination: { page: number, status: string, empty: boolean };

  constructor(
    organizationId: string,
    socketUrlBase: string,
    analytics: Analytics,
    serverBehavior: ?ServerBehavior,
  ) {
    super(organizationId, analytics, serverBehavior);
    this.#socketUrlBase = socketUrlBase;
    this.#status = { state: 'initial' };
    this.pagination = { page: 1, status: 'loaded', empty: false };
    this.initFeedEvents();
  }

  get serverURL(): string {
    return getServerUrl(
      this.#socketUrlBase,
      this.organizationId,
      this.visitorId,
      this.sessionId,
    );
  }

  get status(): { state: string } {
    return this.#status;
  }

  initFeedEvents(): void {
    const handleFeedEvent = (event: CustomEvent) => {
      if (event.detail.type === 'pg-next-page') {
        this.paginate();
      }
    };
    window.addEventListener('pg-feed-event', handleFeedEvent);
  }

  paginate(): void {
    if (this.pagination.status === 'loaded' && !this.pagination.empty) {
      this.pagination.status = 'loading';
      this.pagination.page += 1;
      this.#status.state = 'pagination';
      this.callbacks.pagination(true);

      const events = JSON.parse(localStorage.getItem('GAMALON-events') || '[]');
      fetch(this.serverURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visitor_new_session',
          id: uuid(),
          current_url: window.location.href,
          server_behavior: this.serverBehavior,
          page: this.pagination.page,
          events,
        }),
      })
        .then((response) => response.text())
        .then((cardPayload) => {
          if (cardPayload) {
            const payload = JSON.parse(cardPayload);
            if (payload?.cards?.length < 1) {
              this.pagination.empty = true;
            }
            this.#status.state = 'loaded';
            const nextCards = payload.cards || [];
            if (nextCards.length > 0) {
              this.callbacks.botMessage({
                type: 'bot_message_pagination',
                cards: nextCards,
              });
            } else {
              this.callbacks.pagination(false);
            }
            if (payload?.interactive_message) {
              window.dispatchEvent(
                new CustomEvent('pg-feed-notification', {
                  detail: { text: payload.interactive_message },
                }),
              );
            }
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.pagination.status = 'loaded';
        });
    }
  }

  async initState(): Promise<void> {
    if (this.#status.state === 'initial') {
      this.#status.state = 'loading';
      return new Promise((resolve) => {
        fetch(this.serverURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'visitor_new_session',
            id: uuid(),
            current_url: window.location.href,
            server_behavior: this.serverBehavior,
          }),
        })
          .then((response) => response.text())
          .then((cardPayload) => {
            if (cardPayload) {
              this.callbacks.botMessage(JSON.parse(cardPayload));
              this.#status.state = 'loaded';
              resolve();
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
    return Promise.resolve();
  }

  async _sendVisitorMessage(message: VisitorMessage) {
    this.callbacks.visitorMessage(message);
    fetch(this.serverURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload) {
          this.callbacks.botMessage(payload);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
