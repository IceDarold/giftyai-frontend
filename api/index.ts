
import { QuizAnswers, Gift, UserProfile, CalendarEvent, User, TeamMember, RecommendationSession, DialogueHypothesis, RecommendationTrack } from '../domain/types';
import { mapGiftDTOToGift } from '../mappers/gift';
import { MockServer } from './mock/server';

const API_BASE = (() => {
    try {
        return (import.meta as any).env?.VITE_API_BASE || 'https://api.giftyai.ru';
    } catch {
        return 'https://api.giftyai.ru';
    }
})();

const isMockEnabled = () => localStorage.getItem('gifty_use_mock_data') === 'true';

let globalLogger: ((log: any) => void) | null = null;
export const setGlobalLogger = (logger: any) => { globalLogger = logger; };

const logRequest = (method: string, endpoint: string, payload?: any) => {
    if (globalLogger) {
        globalLogger({ method, endpoint, payload, type: 'request' });
    }
};

interface ApiFetchOptions extends RequestInit {
    skipErrorLog?: boolean;
}

export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const method = options.method || 'GET';
  
  logRequest(method, endpoint, options.body ? JSON.parse(options.body as string) : undefined);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 204) return null;
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    if (!response.ok) {
        throw new Error(data?.detail || data?.error?.message || `API Error: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  auth: {
    getMe: async (): Promise<User | null> => {
        // --- BACKDOOR FOR TESTING ---
        if (localStorage.getItem('gifty_auth_token') === 'demo_admin') {
            return {
                id: 'admin_user',
                name: 'Александр (Admin)',
                email: 'admin123@test.test',
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                bio: 'Тестовый аккаунт администратора',
                telegram_connected: true
            };
        }
        // ----------------------------
        try { return await apiFetch('/auth/me', { skipErrorLog: true }); } catch (e) { return null; }
    },
    logout: async () => {
        localStorage.removeItem('gifty_auth_token');
        return apiFetch('/auth/logout', { method: 'POST' });
    },
    getLoginUrl: (provider: string, returnTo: string) =>
        `${API_BASE}/auth/${provider}/start?redirect_url=${encodeURIComponent(returnTo)}`
  },
  gifts: {
    getById: async (id: string): Promise<Gift> => {
      try {
        const dto = await apiFetch(`/gifts/${id}`, { skipErrorLog: true });
        return mapGiftDTOToGift(dto);
      } catch (e) {
        return mapGiftDTOToGift(await MockServer.getGiftById(id));
      }
    },
    getMany: async (ids: string[]): Promise<Gift[]> => {
      logRequest('GET', `/gifts/batch?ids=${ids.join(',')}`);
      const dtos = await MockServer.getGiftsByIds(ids);
      return dtos.map(mapGiftDTOToGift);
    },
    list: async (params?: { limit?: number; tag?: string; category?: string }): Promise<Gift[]> => {
        try {
            const query = new URLSearchParams();
            if (params?.limit) query.append('limit', params.limit.toString());
            const dtos = await apiFetch(`/gifts?${query.toString()}`, { skipErrorLog: true });
            return dtos.map(mapGiftDTOToGift);
        } catch (e) {
            return (await MockServer.getGifts(params)).map(mapGiftDTOToGift);
        }
    }
  },
  gutg: {
      init: async (answers: any): Promise<RecommendationSession> => {
          // --- Mapping logic to match backend strict schema ---
          
          // Map relationship labels to backend enums
          const relMapping: Record<string, string> = {
              'Партнер': 'partner',
              'Друг': 'friend',
              'Коллега': 'colleague',
              'Ребенок': 'child',
              'Родитель': 'relative',
              'Родственник': 'relative',
              'Бабушка/Дед': 'relative',
              'Брат/Сестра': 'relative'
          };

          // Map goal labels to backend enums
          const goalMapping: Record<string, string> = {
              'impress': 'impress',
              'care': 'care',
              'check': 'protocol',
              'protocol': 'protocol',
              'apology': 'apology',
              'joke': 'joke',
              'growth': 'growth'
          };

          const mappedPayload = {
              recipient_age: parseInt(answers.age) || 30,
              budget: answers.budget ? parseInt(answers.budget.replace(/[^0-9]/g, '')) : null,
              deadline_days: answers.deadline ? parseInt(answers.deadline) : 7,
              effort_level: answers.effortLevel || "low",
              gifting_goal: goalMapping[answers.goal] || "care",
              interests: answers.interests ? answers.interests.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              interests_description: answers.interests || "",
              language: "ru",
              occasion: answers.occasion || "",
              recipient_gender: answers.recipientGender || "unisex",
              relationship: relMapping[answers.relationship] || "unknown",
              session_mode: answers.sessionMode || "thoughtful"
          };

          if (isMockEnabled()) {
              logRequest('POST', '/recommendations/init', mappedPayload);
              await new Promise(r => setTimeout(r, 1000));
              return MockServer.getGUTGSession();
          }

          return await apiFetch('/recommendations/init', { 
              method: 'POST', 
              body: JSON.stringify(mappedPayload) 
          });
      },
      interact: async (sessionId: string, action: string, value: string): Promise<RecommendationSession> => {
          logRequest('POST', '/recommendations/interact', { session_id: sessionId, action, value });
          if (isMockEnabled()) {
              await new Promise(r => setTimeout(r, 600));
              if (action === 'answer_probe') return MockServer.getGUTGSession('TRACKS');
              if (action === 'like_hypothesis') return MockServer.getGUTGSession('FEED');
              if (action === 'load_more_hypotheses') return MockServer.getGUTGSession('LOAD_MORE');
              return MockServer.getGUTGSession('TRACKS');
          }
          return await apiFetch('/recommendations/interact', { 
              method: 'POST', 
              body: JSON.stringify({ session_id: sessionId, action, value }) 
          });
      },
      react: async (hypothesisId: string, reaction: 'like' | 'dislike' | 'shortlist'): Promise<void> => {
          logRequest('POST', `/recommendations/hypothesis/${hypothesisId}/react`, { reaction });
          if (isMockEnabled()) return;
          return await apiFetch(`/recommendations/hypothesis/${hypothesisId}/react`, {
              method: 'POST',
              body: JSON.stringify({ reaction })
          });
      },
      getProducts: async (hypothesisId: string): Promise<Gift[]> => {
          logRequest('GET', `/recommendations/hypothesis/${hypothesisId}/products`);
          if (isMockEnabled()) {
              const dtos = await MockServer.getGifts({ limit: 10 });
              return dtos.map(mapGiftDTOToGift);
          }
          const dtos = await apiFetch(`/recommendations/hypothesis/${hypothesisId}/products`);
          return dtos.map(mapGiftDTOToGift);
      }
  },
  wishlist: {
    getAll: async (): Promise<string[]> => {
        try { return await apiFetch('/wishlist'); } catch (e) { return MockServer.getWishlist(); }
    },
    add: async (id: string): Promise<void> => {
        try { await apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ gift_id: id }) }); } 
        catch (e) { await MockServer.addToWishlist(id); }
    },
    remove: async (id: string): Promise<void> => {
        try { await apiFetch(`/wishlist/${id}`, { method: 'DELETE' }); } 
        catch (e) { await MockServer.removeFromWishlist(id); }
    }
  },
  user: {
    get: async (): Promise<UserProfile> => {
        try { return await apiFetch('/users/me/profile'); } catch (e) { return MockServer.getUserProfile(); }
    },
    update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        try { return await apiFetch('/users/me/profile', { method: 'PATCH', body: JSON.stringify(data) }); } 
        catch (e) { return MockServer.updateUserProfile(data); }
    },
    addEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
        try { return await apiFetch('/users/me/events', { method: 'POST', body: JSON.stringify(event) }); } 
        catch (e) { return MockServer.addEvent(event); }
    },
    removeEvent: async (id: string): Promise<void> => {
        try { await apiFetch(`/users/me/events/${id}`, { method: 'DELETE' }); } 
        catch (e) { return MockServer.removeEvent(id); }
    }
  },
  public: {
    team: {
        list: async (): Promise<TeamMember[]> => {
            try { return await apiFetch('/public/team'); } catch (e) { return MockServer.getTeam(); }
        }
    },
    investorContact: { create: async (data: any) => apiFetch('/public/investor-contact', { method: 'POST', body: JSON.stringify(data) }) },
    partnerContact: { create: async (data: any) => apiFetch('/public/partner-contact', { method: 'POST', body: JSON.stringify(data) }) }
  }
};
