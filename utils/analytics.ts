import posthog from 'posthog-js';

export const track = (event: string, data?: Record<string, any>) => {
  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, data);
  }
  // Send to PostHog
  posthog.capture(event, data);
};
