
import { QuizAnswers, Gift, UserProfile, CalendarEvent, User, RecommendationsResponse, TeamMember, RecommendationSession } from '../domain/types';
import { mapGiftDTOToGift, mapRecommendationsResponse } from '../mappers/gift';
import { MockServer } from './mock/server';
import { analytics } from '../utils/analytics';

const API_BASE = (() => {
    try {
        return (import.meta as any).env?.VITE_API_BASE || 'https://api.giftyai.ru';
    } catch {
        return 'https://api.giftyai.ru';
    }
})();

interface ApiFetchOptions extends RequestInit {
    skipErrorLog?: boolean;
}

const parseBudget = (input: string): number => {
  if (!input) return 5000; // Default reasonable budget
  const val = parseInt(input.replace(/[^\d]/g, ''), 10);
  return isNaN(val) ? 5000 : val;
};

// Mapper for GUTG Responses to Domain Types
const mapSessionResponse = (data: any): RecommendationSession => {
    // 1. Normalize State (API might return lowercase 'branching')
    const rawState = data.state || 'BRANCHING';
    const state = rawState.toUpperCase() as any;

    return {
        session_id: data.session_id,
        state: state, // BRANCHING, SHOWING_HYPOTHESES, DEEP_DIVE, DEAD_END
        selected_topic: data.selected_topic,
        language: data.language,
        
        // Map Probe (Question)
        current_probe: data.current_probe ? {
            question: data.current_probe.question || data.current_probe.text,
            subtitle: data.current_probe.subtitle,
            options: Array.isArray(data.current_probe.options) 
                ? data.current_probe.options.map((opt: any) => {
                    // Handle case where options are just strings
                    if (typeof opt === 'string') {
                        return {
                            id: opt,
                            label: opt,
                            icon: '👉' // Default icon if none provided
                        };
                    }
                    // Handle object structure
                    return {
                        id: opt.id || opt.text || opt.value, 
                        label: opt.text || opt.label || opt.value,
                        icon: opt.icon, 
                        description: opt.description
                    };
                  })
                : []
        } : undefined,

        // Map Hypotheses (Strategies)
        current_hypotheses: Array.isArray(data.current_hypotheses) 
            ? data.current_hypotheses.map((h: any) => ({
                id: h.id,
                title: h.title,
                gutgType: h.type || h.primary_gap || 'Strategy',
                description: h.reasoning || h.description, // Mapping reasoning to description for UI
                previewGifts: Array.isArray(h.preview_products) 
                    ? h.preview_products.map((p: any) => mapGiftDTOToGift(p)) 
                    : []
              })) 
            : undefined,

        // Map Final Products
        deep_dive_products: Array.isArray(data.deep_dive_products) 
            ? data.deep_dive_products.map((p: any) => mapGiftDTOToGift(p)) 
            : undefined
    };
};

export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const method = options.method || 'GET';

  console.groupCollapsed(`🚀 [API] ${method} ${endpoint}`);
  if (options.body) console.log('📦 Body:', options.body);
  console.groupEnd();

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
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        console.warn('⚠️ Response is not JSON:', text);
        data = text;
    }

    if (!response.ok) {
        if (!options.skipErrorLog) {
             console.warn(`❌ [API Error] ${response.status}`, data);
             analytics.error(new Error(`API Error ${response.status}`), endpoint);
        }
        throw new Error(data?.detail || data?.error?.message || `API Error: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    if (!options.skipErrorLog) {
        console.warn(`⚠️ [Network] ${endpoint} unreachable`, error);
    }
    throw error;
  }
};

export const api = {
  auth: {
    getMe: async (): Promise<User | null> => {
        try {
            return await apiFetch('/api/v1/auth/me', { skipErrorLog: true });
        } catch (e) {
            return null;
        }
    },
    logout: async () => apiFetch('/api/v1/auth/logout', { method: 'POST' }),
    getLoginUrl: (provider: string, returnTo: string) =>
        `${API_BASE}/api/v1/auth/${provider}/start?redirect_url=${encodeURIComponent(returnTo)}`
  },
  gifts: {
    getById: async (id: string): Promise<Gift> => {
      try {
        const dto = await apiFetch(`/api/v1/gifts/${id}`, { skipErrorLog: true });
        return mapGiftDTOToGift(dto);
      } catch (e) {
        const dto = await MockServer.getGiftById(id);
        return mapGiftDTOToGift(dto);
      }
    },
    getMany: async (ids: string[]): Promise<Gift[]> => {
      // Using mock for batch temporarily
      const dtos = await MockServer.getGiftsByIds(ids);
      return dtos.map(mapGiftDTOToGift);
    },
    list: async (params?: { limit?: number; tag?: string; category?: string }): Promise<Gift[]> => {
        try {
            const query = new URLSearchParams();
            if (params?.limit) query.append('limit', params.limit.toString());
            const dtos = await apiFetch(`/api/v1/gifts?${query.toString()}`, { skipErrorLog: true });
            if (Array.isArray(dtos) && dtos.length > 0) return dtos.map(mapGiftDTOToGift);
            throw new Error("Empty list");
        } catch (e) {
            const dtos = await MockServer.getGifts(params);
            return dtos.map(mapGiftDTOToGift);
        }
    },
    getSimilar: async (id: string): Promise<Gift[]> => {
        const dtos = await MockServer.getSimilarGifts(id);
        return dtos.map(mapGiftDTOToGift);
    }
  },
  gutg: {
      init: async (answers: QuizAnswers): Promise<RecommendationSession> => {
          let gender = 'unisex';
          if (answers.recipientGender === 'male') gender = 'male';
          if (answers.recipientGender === 'female') gender = 'female';

          let age = parseInt(answers.ageGroup);
          if (isNaN(age)) age = 30;

          // Cleaning up interests string to array
          const interestsArray = answers.interests 
            ? answers.interests.split(/[,.;]+/).map(i => i.trim()).filter(Boolean)
            : ['General'];

          const payload = {
              recipient_age: age,
              interests: interestsArray,
              budget: parseBudget(answers.budget),
              language: 'ru',
              // Passing full context for better AI reasoning
              context: {
                  relationship: answers.relationship,
                  occasion: answers.occasion,
                  gender: gender
              }
          };

          const response = await apiFetch('/recommendations/init', {
              method: 'POST',
              body: JSON.stringify(payload)
          });
          return mapSessionResponse(response);
      },
      interact: async (sessionId: string, action: 'answer_probe' | 'like_hypothesis' | 'dislike_hypothesis', value: string): Promise<RecommendationSession> => {
          const response = await apiFetch('/recommendations/interact', {
              method: 'POST',
              body: JSON.stringify({
                  session_id: sessionId,
                  action,
                  value
              })
          });
          return mapSessionResponse(response);
      }
  },
  wishlist: {
    getAll: async (): Promise<string[]> => {
        try {
            const items = await apiFetch('/api/v1/wishlist', { skipErrorLog: true });
            return Array.isArray(items) ? items.map((i: any) => i.gift_id || i) : [];
        } catch (e) {
            return MockServer.getWishlist();
        }
    },
    add: async (id: string): Promise<void> => {
        try {
            await apiFetch('/api/v1/wishlist', {
                method: 'POST',
                body: JSON.stringify({ gift_id: id }),
                skipErrorLog: true
            });
        } catch (e) {
            await MockServer.addToWishlist(id);
        }
    },
    remove: async (id: string): Promise<void> => {
        try {
            await apiFetch(`/api/v1/wishlist/${id}`, { method: 'DELETE', skipErrorLog: true });
        } catch (e) {
            await MockServer.removeFromWishlist(id);
        }
    }
  },
  user: {
    get: async (): Promise<UserProfile> => {
        try {
            return await apiFetch('/api/v1/users/me/profile', { skipErrorLog: true });
        } catch (e) {
            return MockServer.getUserProfile();
        }
    },
    update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            return await apiFetch('/api/v1/users/me/profile', {
                method: 'PATCH',
                body: JSON.stringify(data),
                skipErrorLog: true
            });
        } catch (e) {
            return MockServer.updateUserProfile(data);
        }
    },
    addEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
        try {
            return await apiFetch('/api/v1/users/me/events', {
                method: 'POST',
                body: JSON.stringify(event),
                skipErrorLog: true
            });
        } catch (e) {
            return MockServer.addEvent(event);
        }
    },
    removeEvent: async (id: string): Promise<void> => {
        try {
            await apiFetch(`/api/v1/users/me/events/${id}`, { method: 'DELETE', skipErrorLog: true });
        } catch (e) {
            await MockServer.removeEvent(id);
        }
    }
  },
  public: {
    team: {
        list: async (): Promise<TeamMember[]> => {
            try {
                return await apiFetch('/api/v1/public/team', { skipErrorLog: true });
            } catch (e) {
                return MockServer.getTeam();
            }
        }
    },
    investorContact: {
        create: async (data: any) => {
            return await apiFetch('/api/v1/public/investor-contact', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
    },
    partnerContact: {
        create: async (data: any) => {
            return await apiFetch('/api/v1/public/partner-contact', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
    }
  }
};
