export const track = (event: string, data?: Record<string, any>) => {
  // In a real app, this would send data to GA4, Mixpanel, etc.
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, data);
  }
};