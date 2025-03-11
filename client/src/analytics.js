// @flow
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { v4 as uuid } from 'uuid';

import type { AppConfig } from './entities';

/**
 * General analytics controller abstract base class
 */
export class Analytics {
  organizationId: string;
  environment: string;
  visitorId: string;
  sessionId: string;

  async init(): Promise<void> {
    return Promise.resolve();
  }

  track(
    event: string,
    props: any = {},
  ) {}
}

function storeEventToLocalStorage(event: string, properties: any, appConfig: AppConfig) {
  let events = JSON.parse(window.localStorage.getItem('GAMALON-events') || '[]');
  if (appConfig?.analytics?.pagination?.allowedEvents) {
    if (!appConfig?.analytics?.pagination?.allowedEvents.includes(event)) {
      return;
    }
  }
  if (appConfig?.analytics?.pagination?.trimLingerEvents && event === 'feed linger metrics') {
    events = events.filter((e) => e.event !== 'feed linger metrics');
  }
  events.push({ event, properties });
  window.localStorage.setItem('GAMALON-events', JSON.stringify(events));
}

/**
 * Normal analytics handler for use in production
 */
export class RealAnalytics extends Analytics {
  #appConfig: AppConfig;

  constructor(appConfig: AppConfig) {
    super();
    this.organizationId = appConfig.organizationId;
    this.#appConfig = appConfig;
    this.visitorId = window.localStorage.getItem('GAMALON-visitorId') || '';
    if (!this.visitorId) {
      this.visitorId = uuid();
      window.localStorage.setItem('GAMALON-visitorId', this.visitorId);
      window.sessionStorage.removeItem('GAMALON-sessionId');
    }
    this.sessionId = window.sessionStorage.getItem('GAMALON-sessionId') || '';
    if (!this.sessionId) {
      this.sessionId = uuid();
      window.sessionStorage.setItem('GAMALON-sessionId', this.sessionId);
    }
  }

  async init(): Promise<void> {
    Promise.resolve();
  }

  #globalProps(): {
    organization_id: string,
    environment: string,
    visitor_id: string,
    session_id: string,
    sessionId: string,
    } {
    return {
      organization_id: this.organizationId,
      environment: this.environment,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      sessionId: this.sessionId,
    };
  }

  /**
   * @param {string} event - Event
   * @param {string} props - Optional event props
   */
  track(
    event: string,
    props: any = {},
  ) {
    const properties: any = {
      ...this.#globalProps(),
      ...props,
    };
    storeEventToLocalStorage(event, properties, this.#appConfig);
  }
}
