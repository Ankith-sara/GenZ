import type { AnalyticsEvent, AnalyticsEventName } from "./analytics.types";

export class AnalyticsService {
  /**
   * Tracks an application domain business event.
   * Can be hooked to Vercel Analytics, PostHog, or custom metrics pipelines.
   */
  static trackEvent(
    name: AnalyticsEventName,
    properties?: Record<string, string | number | boolean | null>,
    userId?: string
  ): AnalyticsEvent {
    const eventRecord: AnalyticsEvent = {
      event: name,
      properties: properties || {},
      userId,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Analytics] Tracked event "${name}":`, properties);
    }

    return eventRecord;
  }
}
