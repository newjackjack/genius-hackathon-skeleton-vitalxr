// @flow
import type {
  FeedTracker,
  MetricDuration,
  MetricConstructor,
} from '../../entities';

function generateHeatMapColor(index: number, length: number) {
  // Generate a color from blue to red based on the index and total length
  if (length <= 1) return '#ff0000';

  const startColor = { r: 0, g: 0, b: 255 };
  const endColor = { r: 255, g: 0, b: 0 };
  const ratio = index / (length - 1);

  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export default class FeedMetricsController {
  feedObserver: IntersectionObserver | null;
  enabled: boolean;
  durations: Map<string, MetricDuration>;
  intervalRef: any;
  thresholds: Array<number>;
  heatmap: boolean;
  color_heatmap: boolean;
  interval: number;
  pageVisibe: boolean;
  onUpdate: (
    durations: Map<string, MetricDuration>,
    type: 'action' | 'ping'
  ) => void;

  constructor() {
    this.feedObserver = null;
    this.enabled = false;
    this.durations = new Map();
    this.intervalRef = null;
    this.pageVisibe = true;
    this.thresholds = [0.3, 0.7];
    this.heatmap = false;
    this.color_heatmap = false;
    this.interval = 10000;
    this.onUpdate = () => {};
  }

  setupIntersectionObserver(config: MetricConstructor): IntersectionObserver | null {
    if (!this.enabled && config.enabled) {
      this.feedObserver = new IntersectionObserver(
        (entries: Array<IntersectionObserverEntry>) => {
          this.trackIntersectionEntries(entries);
        },
        {
          root: null,
          threshold: config.thresholds,
        },
      );
      this.enabled = config.enabled;
      this.thresholds = config.thresholds;
      this.heatmap = config.heatmap;
      this.color_heatmap = config.color_heatmap;
      this.interval = config.interval;
      this.onUpdate = config.onUpdate;
      this.trackPageVisibility();
      this.trackIntersectionPing();
    }
    return this.feedObserver;
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

  updateTargetElementColor(key: string, index: number, total: number) {
    const duration: ?MetricDuration = this.durations.get(key);
    if (duration) {
      const { target } = duration;
      if (target) {
        const color = generateHeatMapColor(index, total);
        const cardWrapperContent = target.querySelector('.card-wrapper-content');
        const cardWrapperProduct = target.querySelector('.pg-card-product');

        if (cardWrapperContent) {
          cardWrapperContent.setAttribute('style', `background-color: ${color} !important;`);
        }
        if (cardWrapperProduct) {
          cardWrapperProduct.setAttribute('style', `background-color: ${color} !important;`);
        }
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

        if (this.color_heatmap) {
          const sortedDurations = Array.from(this.durations.entries()).sort(
            ([, a], [, b]) => b.totalTime - a.totalTime,
          );
          sortedDurations.forEach(([key], index) => {
            this.updateTargetElementColor(key, index, sortedDurations.length);
          });
        }
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
    related_card_id?: string,
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
  event_type: string,
};

/**
 * Format the linger data and generate the metrics event payload
 */
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
      };
    }
  });
  return {
    payload,
    event_type: type,
  };
}
