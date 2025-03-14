// @flow
import { v4 as uuid } from 'uuid';
import type { VisitorMessage, ServerBehavior } from '../../entities';
import { ChatController } from '../../ChatController';
import { Analytics } from '../../analytics';
import { getServerUrl } from '../utils';

function authHeader(): string {
  return `Bearer ${window.GAMALON.access_token}`;
}
export class FeedCardController extends ChatController {
  #serverUrlBase: string;
  #status: { state: string };
  pagination: { page: number, status: string, empty: boolean };

  constructor(
    organizationId: string,
    serverUrlBase: string,
    analytics: Analytics,
    serverBehavior: ?ServerBehavior,
  ) {
    super(organizationId, analytics, serverBehavior);
    this.#serverUrlBase = serverUrlBase;
    this.#status = { state: 'initial' };
    this.pagination = { page: 1, status: 'loaded', empty: false };
    this.initFeedEvents();
  }

  get serverURL(): string {
    return getServerUrl(
      this.#serverUrlBase,
      this.organizationId,
      this.sessionId,
    );
  }

  get status(): { state: string } {
    return this.#status;
  }

  initFeedEvents(): void {
    const handleFeedEvent = (event: CustomEvent) => {
      if (event.detail.type === 'reset-pagination-state') {
        this.pagination.page = 1;
        this.pagination.status = 'loaded';
        this.pagination.empty = false;
      } else if (event.detail.type === 'pg-next-page') {
        this.paginate();
      }
    };
    window.addEventListener('pg-feed-event', handleFeedEvent);
  }

  /**
   * Handles the pagination of the feed
   */
  paginate(): void {
    if (this.pagination.status === 'loaded' && !this.pagination.empty) {
      this.pagination.status = 'loading';
      this.pagination.page += 1;
      this.#status.state = 'pagination';
      this.callbacks.pagination(true);

      /**
       * if there are events in local storage, send them to the server
       */
      const events = JSON.parse(localStorage.getItem('GAMALON-events') || '[]');
      localStorage.setItem('GAMALON-events', '[]');
      fetch(this.serverURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader(),
        },
        body: JSON.stringify({
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
            Authorization: authHeader(),
          },
          body: JSON.stringify({
            page: 1,
            batch_count: 10,
          }),
        })
          .then((response) => response.text())
          .then((cardPayload) => {
            if (cardPayload) {
              const payload = JSON.parse(cardPayload);
              console.log(payload.cards);
              this.callbacks.botMessage({
                type: 'bot_message',
                id: uuid(),
                cards: payload.cards,
              });
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader(),
      },
      body: JSON.stringify(message),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload) {
          this.callbacks.botMessage({
            type: 'bot_message',
            id: uuid(),
            cards: payload.cards,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
