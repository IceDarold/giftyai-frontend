import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PostHogProvider } from 'posthog-js/react';

// Safely access env variables
const getEnv = (key: string): string | undefined => {
  try {
    return (import.meta as any).env?.[key];
  } catch (e) {
    return undefined;
  }
};

const posthogKey = getEnv('VITE_PUBLIC_POSTHOG_KEY');
const posthogHost = getEnv('VITE_PUBLIC_POSTHOG_HOST') || 'https://us.i.posthog.com';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const RootComponent = () => {
  // Only wrap in Provider if we have a key. Otherwise, just render App.
  if (posthogKey) {
    return (
      <PostHogProvider 
        apiKey={posthogKey}
        options={{ 
          api_host: posthogHost,
          autocapture: false, // Disabled per TZ
          capture_pageview: false, // We will track manually in App.tsx
          persistence: 'localStorage'
        }}
      >
        <App />
      </PostHogProvider>
    );
  }
  
  return <App />;
};

root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);