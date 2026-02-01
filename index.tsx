import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PostHogProvider } from 'posthog-js/react';

const options = {
  api_host: (import.meta as any).env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={(import.meta as any).env.VITE_PUBLIC_POSTHOG_KEY || 'phc_6nurpxpK23p0dfHbnM4tyy7HXL7aCxAt5HtwqSZQ20J'}
      options={options}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);