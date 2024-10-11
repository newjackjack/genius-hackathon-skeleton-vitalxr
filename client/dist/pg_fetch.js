function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function getSessionsIds() {
  let visitorId = window.localStorage.getItem('GAMALON-visitorId');
  if (!visitorId) {
    visitorId = uuid();
    window.localStorage.setItem('GAMALON-visitorId', visitorId);
    window.sessionStorage.removeItem('GAMALON-sessionId');
  }
  let sessionId = window.sessionStorage.getItem('GAMALON-sessionId');
  if (!sessionId) {
    sessionId = uuid();
    window.sessionStorage.setItem('GAMALON-sessionId', sessionId);
  }
  return { visitorId, sessionId };
}

(function () {
  const storageConfig = window.localStorage.getItem('GAMALON-pg-template-config');
  const configData = storageConfig ? JSON.parse(storageConfig) : {};

  const organization =  configData?.organizationId || 'valuepetsupplies'; // Set the organization
  const socketURL = configData?.socketURL || 'wss://facetchat.dev.gmln.io/ws'; // Set the socket URL
  const server_behavior = configData?.serverBehavior ||  { use_cards: true, expand_single_product: true }; // Set the server behavior
  const { visitorId, sessionId } = getSessionsIds();

  function useREST() {
    let payload = null;
    const handleAppEvent = (event) => {
      if (event.detail.type === 'get-initial-cards' && payload) {
        window.dispatchEvent(
          new CustomEvent('pg-app-event', {
            detail: { type: 'set-initial-cards', payload },
          })
        );
      } else if (event.detail.type === 'initial-state-success') {
        window.removeEventListener('pg-app-event', handleAppEvent);
      }
    };
    window.addEventListener('pg-app-event', handleAppEvent);
    const socketUrl = new URL(socketURL);
    const protocol = socketUrl.protocol === 'wss:' ? 'https' : 'http';
    const port = socketUrl.port ? `:${socketUrl.port}` : '';
    const serverURL = `${protocol}://${socketUrl.hostname}${port}/feed/${organization}/${visitorId}/${sessionId}`;

    if (configData?.design?.pagination?.persistant) {
      const currentURL = new URL(window.location.href);
      if (currentURL.searchParams.has('pg-page')) {
        const page = parseInt(currentURL.searchParams.get('pg-page'), 10);
        server_behavior.lby_options = {
          ...(server_behavior.lby_options || {}),
          vgs_on_page: 80 + (page - 1) * 20,
        }
      }
    }

    fetch(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'visitor_new_session',
        id: uuid(),
        current_url: window.location.href,
        server_behavior,
      }),
    })
      .then((response) => response.text())
      .then((cardPayload) => {
        if (cardPayload) {
          payload = cardPayload;
          window.dispatchEvent(
            new CustomEvent('pg-app-event', {
              detail: { type: 'set-initial-cards', payload },
            })
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  useREST();
})();

function feedPaginationPG() {
  const currentURL = new URL(window.location.href);
  const storageConfig = window.localStorage.getItem('GAMALON-pg-template-config');
  const configData = storageConfig ? JSON.parse(storageConfig) : {};
  const state = { page: 1, status: 'loaded', empty: false };

  if (configData?.design?.pagination?.persistant) {
    if (currentURL.searchParams.has('pg-page')) {
      state.page = parseInt(currentURL.searchParams.get('pg-page'), 10);
    }
  }

  const organization =  configData?.organizationId;
  const socketURL = configData?.socketURL || 'wss://facetchat.dev.gmln.io/ws';

  const hanldePaginationEvent = (event) => {
    if (event.detail.type === 'pg-next-page' && state.status === 'loaded' && !state.empty) {
      state.status = 'loading';
      state.page += 1;
      window.dispatchEvent(
        new CustomEvent('pg-feed-event', {
          detail: { type: 'set-feed-pagination', loading: true },
        })
      );

      if (configData?.design?.pagination?.persistant) {
        currentURL.searchParams.set('pg-page', state.page);
        window.history.replaceState(null, '', currentURL.href);
      } else if (currentURL.searchParams.has('pg-page')) {
        currentURL.searchParams.delete('pg-page');
        window.history.replaceState(null, '', currentURL);
      }

      const socketUrl = new URL(socketURL);
      const protocol = socketUrl.protocol === 'wss:' ? 'https' : 'http';
      const port = socketUrl.port ? `:${socketUrl.port}` : '';
      const { visitorId, sessionId } = getSessionsIds();
      const serverURL = `${protocol}://${socketUrl.hostname}${port}/feed/${organization}/${visitorId}/${sessionId}`;
      const events = JSON.parse(localStorage.getItem('GAMALON-events') || '[]');
      localStorage.setItem('GAMALON-events', '[]');
      fetch(serverURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visitor_new_session',
          id: uuid(),
          current_url: window.location.href,
          server_behavior: configData?.serverBehavior ||  {},
          page: state.page,
          events,
        }),
      })
        .then((response) => response.text())
        .then((cardPayload) => {
          if (cardPayload) {
            const payload = JSON.parse(cardPayload);
            if (payload?.cards?.length < 1) {
              state.empty = true;
            }
            window.dispatchEvent(
              new CustomEvent('pg-feed-event', {
                detail: { type: 'add-feed-cards', payload },
              })
            );
            if (payload?.interactive_message) {
              window.dispatchEvent(
                new CustomEvent('pg-feed-notification', {
                  detail: { text: payload.interactive_message },
                })
              );
            }
          }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          state.status = 'loaded';
        });
    }
  };
  window.addEventListener('pg-pagination-event', hanldePaginationEvent);
}

feedPaginationPG();