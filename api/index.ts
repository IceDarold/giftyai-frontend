import { QuizAnswers, Gift, UserProfile, CalendarEvent, User, RecommendationsResponse } from '../domain/types';
import { mapGiftDTOToGift, mapRecommendationsResponse } from '../mappers/gift';
import { MockServer } from './mock/server';
import { GiftDTO } from './dto/types';

const API_BASE = 'https://gifty-backend-lg4a.onrender.com';

// Add a flag to options to control error logging
interface ApiFetchOptions extends RequestInit {
    skipErrorLog?: boolean;
}

const parseBudget = (input: string): number => {
  if (!input) return 0;
  // Strictly parse integer from string, assuming input is already cleaned or simple number
  const val = parseInt(input.replace(/[^\d]/g, ''), 10);
  return isNaN(val) ? 0 : val;
};

export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const method = options.method || 'GET';

  console.groupCollapsed(`🚀 [API] ${method} ${endpoint}`);
  if (options.body) {
    try {
        console.log('📦 Body:', JSON.parse(options.body as string));
    } catch {
        console.log('📦 Body:', options.body);
    }
  }
  console.groupEnd();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials || 'include',
    });

    if (response.status === 204) {
        return null;
    }

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
             console.warn(`❌ [API Error] ${response.status} ${endpoint}`, data);
        }
        // Extract useful error message if possible
        const msg = data?.error?.message || data?.detail || (data?.error ? JSON.stringify(data.error) : `API Error: ${response.statusText}`);
        // Attach full data to error object for debug extraction
        const error = new Error(msg);
        (error as any).details = data; 
        throw error;
    }
    
    console.groupCollapsed(`✅ [API] ${response.status} ${endpoint}`);
    console.log('📦 Data:', data);
    console.groupEnd();

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
            // Skip error log for auth check as it often fails for guests or network issues
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
        console.log(`Using mock for gift ${id}`);
        const dto = await MockServer.getGiftById(id);
        return mapGiftDTOToGift(dto);
      }
    },
    getMany: async (ids: string[]): Promise<Gift[]> => {
      try {
          const query = new URLSearchParams();
          ids.forEach(id => query.append('ids', id));
          
          // Throw immediately to force mock usage until backend batch endpoint is confirmed
          throw new Error("Batch fetch optimized to mock");
      } catch (e) {
          const dtos = await MockServer.getGiftsByIds(ids);
          return dtos.map(mapGiftDTOToGift);
      }
    },
    list: async (params?: { limit?: number; tag?: string; category?: string }): Promise<Gift[]> => {
      try {
        const query = new URLSearchParams();
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.tag) query.append('tag', params.tag);
        if (params?.category) query.append('category', params.category);

        const dtos = await apiFetch(`/api/v1/gifts?${query.toString()}`, { skipErrorLog: true });
        
        // Fallback to mock if API returns empty array (assuming DB might be cold)
        if (Array.isArray(dtos) && dtos.length > 0) {
            return dtos.map(mapGiftDTOToGift);
        }
        throw new Error("Empty list from API, fallback to mock");
      } catch (e) {
        console.log(`Using mock for gifts list (${JSON.stringify(params)})`);
        const dtos = await MockServer.getGifts(params);
        return dtos.map(mapGiftDTOToGift);
      }
    },
    getSimilar: async (id: string): Promise<Gift[]> => {
        const dtos = await MockServer.getSimilarGifts(id);
        return dtos.map(mapGiftDTOToGift);
    }
  },
  recommendations: {
    create: async (answers: QuizAnswers): Promise<RecommendationsResponse> => {
      // 1. Prepare Interests Array
      let interestsArray: string[] = [];
      if (answers.interests && typeof answers.interests === 'string') {
          // Split by comma, dot, or semicolon to handle various inputs
          interestsArray = answers.interests
            .split(/[,.;]+/)
            .map(i => i.trim())
            .filter(i => i.length > 0);
      }
      // Spec requires non-empty optional array, but let's provide a fallback to be safe/helpful
      if (interestsArray.length === 0) interestsArray = ['general'];

      // 2. Prepare Gender
      let gender: 'male' | 'female' | 'unisex' = 'unisex';
      if (answers.recipientGender === 'male') gender = 'male';
      if (answers.recipientGender === 'female') gender = 'female';

      // 3. Age Parsing (Allow 0)
      let age = parseInt(answers.ageGroup);
      if (isNaN(age)) age = 30; // Default only if NaN

      // 4. Construct Payload strictly matching spec
      const payload = {
        recipient_age: age,
        recipient_gender: gender,
        relationship: answers.relationship || 'partner',
        occasion: answers.occasion || 'birthday',
        vibe: answers.vibe || 'cozy',
        interests: interestsArray,
        interests_description: answers.interests || '', // Pass original string for context
        exclude_categories: answers.exclude ? answers.exclude.split(', ') : [],
        budget: parseBudget(answers.budget),
        city: answers.city || 'Moscow',
        top_n: 30, // OPTIMIZATION: Increased to 50
        debug: true
      };

      try {
        // Direct API call
        const response = await apiFetch('/api/v1/recommendations/generate', {
            method: 'POST',
            body: JSON.stringify(payload),
            credentials: 'omit', // Important: Avoid sending cookies to prevent CORS 400 on public endpoint
            skipErrorLog: false 
        });
        const mapped = mapRecommendationsResponse(response);
        return { ...mapped, requestPayload: payload };
      } catch (e) {
        console.warn("Recommendation API failed, using mock", e);
        const mockDto = await MockServer.getRecommendations(answers);
        const mapped = mapRecommendationsResponse(mockDto);
        return { ...mapped, requestPayload: payload, serverError: (e as any).message };
      }
    }
  },
  wishlist: {
    getAll: async (): Promise<string[]> => {
        try {
            const items = await apiFetch('/api/v1/wishlist', { skipErrorLog: true });
            if (Array.isArray(items)) {
                return items.map((i: any) => typeof i === 'string' ? i : i.gift_id);
            }
            return [];
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
  }
};