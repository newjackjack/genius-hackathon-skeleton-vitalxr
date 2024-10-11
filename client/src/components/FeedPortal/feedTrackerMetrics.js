// @flow
import { getVariantData } from '../../utils/componentUtils';
import type {
  FeedTracker,
  MetricDuration,
  MetricConstructor,
} from '../../entities';

export default class FeedMetricsController {
  enabled: boolean;
  durations: Map<string, MetricDuration>;
  intervalRef: any;
  thresholds: Array<number>;
  heatmap: boolean;
  interval: number;
  pageVisibe: boolean;
  onUpdate: (
    durations: Map<string, MetricDuration>,
    type: 'action' | 'ping'
  ) => void;

  constructor() {
    this.enabled = false;
    this.durations = new Map();
    this.intervalRef = null;
    this.pageVisibe = true;
    this.thresholds = [0.3, 0.7];
    this.heatmap = false;
    this.interval = 10000;
    this.onUpdate = () => {};
  }

  setupIntersectionObserver(config: MetricConstructor) {
    if (!this.enabled && config.enabled) {
      this.enabled = config.enabled;
      this.thresholds = config.thresholds;
      this.heatmap = config.heatmap;
      this.interval = config.interval;
      this.onUpdate = config.onUpdate;
      this.trackPageVisibility();
      this.trackIntersectionPing();
    }
  }

  updateTargetElement(key: string) {
    if (!this.heatmap) {
      return;
    }
    const duration: ?MetricDuration = this.durations.get(key);
    if (duration) {
      const { target, totalTime } = duration;
      if (target) {
        target.setAttribute('data-time', totalTime.toFixed(2));
      }
    }
  }

  trackDurationMetric(entry: IntersectionObserverEntry): boolean {
    if (this.enabled) {
      const { target, intersectionRatio } = entry;
      const minThreshold = Math.min(...this.thresholds);
      const isIntersecting = intersectionRatio >= minThreshold;
      if (isIntersecting) {
        const timer = this.durations.get(target.id);
        if (!timer) {
          this.durations.set(target.id, {
            startTimestamp: Date.now(),
            totalTime: 0,
            viewportEnterCount: 1,
            visible: true,
            target,
          });
        } else if (!timer.visible) {
          this.durations.set(target.id, {
            ...timer,
            startTimestamp: Date.now(),
            viewportEnterCount: timer.viewportEnterCount + 1,
            visible: true,
          });
        }
        return false;
      }
      const timer = this.durations.get(target.id);
      if (timer) {
        const { startTimestamp: st, totalTime: tt } = timer;
        const visibleTime = (Date.now() - st) / 1000;
        const totalTime = tt + visibleTime;
        this.durations.set(target.id, {
          ...timer,
          totalTime,
          visible: false,
        });
        this.updateTargetElement(target.id);
        return true;
      }
    }
    return false;
  }

  trackIntersectionEntries(entries: Array<IntersectionObserverEntry>) {
    if (this.enabled) {
      let updated = false;
      entries.forEach((entry) => {
        const isUpdated = this.trackDurationMetric(entry);
        if (isUpdated) {
          updated = true;
        }
      });
      if (updated) {
        this.onUpdate(this.durations, 'action');
        if (this.intervalRef) {
          clearInterval(this.intervalRef);
          this.trackIntersectionPing();
        }
      }
    }
  }

  trackIntersectionPing() {
    if (this.enabled && this.interval > 0) {
      this.intervalRef = setInterval(() => {
        if (!this.pageVisibe) {
          return;
        }
        this.durations.forEach((duration: MetricDuration, key: string) => {
          const { visible, totalTime, startTimestamp } = duration;
          if (visible) {
            const durationTime = (Date.now() - startTimestamp) / 1000;
            this.durations.set(key, {
              ...duration,
              startTimestamp: Date.now(),
              totalTime: totalTime + durationTime,
            });
            this.updateTargetElement(key);
          }
        });
        this.onUpdate(this.durations, 'ping');
      }, this.interval);
    }
  }

  trackPageVisibility() {
    if (this.enabled) {
      document.addEventListener('visibilitychange', () => {
        this.pageVisibe = document.visibilityState === 'visible';
        if (this.intervalRef) {
          clearInterval(this.intervalRef);
        }
        this.durations.forEach((duration: MetricDuration, key: string) => {
          this.durations.set(key, {
            ...duration,
            startTimestamp: Date.now(),
          });
        });
        if (this.pageVisibe) {
          this.trackIntersectionPing();
        }
      });
    }
  }

  clearDurations() {
    this.durations.clear();
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }
}

type MetricsEventPayload = {
  [string]: {
    id: string,
    type: string,
    time: number | string,
    enter_count: number,
    product_recommendation_type?: string,
    product?: {
      handle: string,
      product_id: number | string,
      variant_id: number | string,
      product_metadata: {
        [string]: number | string,
      },
    },
  },
};

type MetricsEventResponse = {
  payload: MetricsEventPayload,
  event_type: 'action' | 'ping',
};

export function getMetricsEventPayload(
  durations: Map<string, MetricDuration>,
  feedTracker: FeedTracker,
  type: 'action' | 'ping',
): MetricsEventResponse {
  const payload: MetricsEventPayload = {};
  durations.forEach((duration: MetricDuration, key: string) => {
    const { totalTime, viewportEnterCount } = duration;
    const entry = feedTracker.current.feedTargets.get(key);
    if (entry && entry.card) {
      payload[key] = {
        time: parseFloat(totalTime.toFixed(2)),
        id: entry.card.id,
        type: entry.card.type,
        enter_count: viewportEnterCount,
        product_recommendation_type: entry.card.product_recommendation_type,
      };
      if (entry.card.type === 'product_detail_card' && entry.card.product) {
        payload[key].product = {
          handle: entry.card.product.handle,
          product_id: entry.card.product.product_id,
          variant_id: entry.card.product.variant_id,
          product_metadata: entry.card.product.product_metadata,
        };
      } else if (entry.card.type === 'variant_group_card') {
        const varaintData = getVariantData(entry.card);
        if (varaintData && varaintData.variantProduct) {
          payload[key].product = {
            handle: varaintData.variantProduct.handle,
            product_id: varaintData.variantProduct.product_id,
            variant_id: varaintData.variantProduct.variant_id,
            product_metadata: varaintData.variantProduct.product_metadata,
          };
        }
      }
    }
  });
  return {
    payload,
    event_type: type,
  };
}
