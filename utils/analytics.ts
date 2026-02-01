import posthog from 'posthog-js';

// --- Session Management for Quiz ---
const STORAGE_KEY_SESSION = 'gifty_quiz_session_id';

export const generateQuizSessionId = (): string => {
  const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
  return sessionId;
};

export const getQuizSessionId = (): string | undefined => {
  return sessionStorage.getItem(STORAGE_KEY_SESSION) || undefined;
};

// --- Base Tracker ---
export const track = (event: string, properties?: Record<string, any>) => {
  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties);
  }
  
  // Send to PostHog safely
  try {
    posthog.capture(event, properties);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics capture skipped:', e);
    }
  }
};

// --- Specific Event Helpers (TZ Compliance) ---

export const analytics = {
  pageView: (pageName: string, url: string) => {
    track('page_viewed', {
      page_name: pageName,
      page_url: url,
      referrer: document.referrer || 'direct'
    });
  },

  quizStarted: (entryPoint: string) => {
    const sessionId = generateQuizSessionId();
    track('quiz_started', {
      entry_point: entryPoint,
      session_id: sessionId
    });
  },

  quizStepCompleted: (stepNumber: number, questionId: string, answer: any, timeSpent: number) => {
    track('quiz_step_completed', {
      step_number: stepNumber,
      question_id: questionId,
      answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
      session_id: getQuizSessionId(),
      time_spent_seconds: Math.round(timeSpent)
    });
  },

  quizCompleted: (totalSteps: number, totalDuration: number) => {
    track('quiz_completed', {
      session_id: getQuizSessionId(),
      total_steps: totalSteps,
      total_duration_seconds: Math.round(totalDuration),
      quality_score: 1.0 // Placeholder
    });
  },

  resultsShown: (count: number) => {
    track('results_shown', {
      session_id: getQuizSessionId(),
      results_count: count,
      algorithm_version: 'v1.0'
    });
  },

  giftClicked: (gift: any, rank: number, source: string) => {
    track('gift_clicked', {
      product_id: gift.id,
      product_name: gift.title,
      merchant: gift.merchant || 'Unknown',
      price: gift.price,
      currency: gift.currency || 'RUB',
      rank: rank,
      session_id: getQuizSessionId(),
      category: gift.category || 'General',
      source_page: source
    });
  },

  error: (error: any, context: string) => {
    track('error_occurred', {
      error_type: error.name || 'unknown_error',
      error_message: error.message || String(error),
      page_name: window.location.pathname,
      stack_trace: error.stack?.substring(0, 500),
      context: context
    });
  },
  
  // Auth
  identify: (userId: string, traits: Record<string, any>) => {
    try { posthog.identify(userId, traits); } catch(e) {}
  },
  
  reset: () => {
    try { posthog.reset(); } catch(e) {}
  }
};