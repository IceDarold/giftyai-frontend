
import { MOCK_DB_GIFTS } from './data';
import { GiftDTO, RecommendationResponseDTO } from '../dto/types';
import { QuizAnswers, Gift, UserProfile, CalendarEvent, TeamMember, RecommendationSession, DialogueHypothesis, RecommendationTrack } from '../../domain/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const toDTO = (gift: Gift): GiftDTO => ({
  id: gift.id,
  title: gift.title,
  description: gift.description || null,
  price: gift.price || null,
  currency: gift.currency || 'RUB',
  image_url: gift.imageUrl || null,
  product_url: gift.productUrl || `https://market.yandex.ru/search?text=${encodeURIComponent(gift.title)}`,
  merchant: gift.merchant || 'Market',
  category: gift.category || null,
  tags_list: gift.tags,
  ai_reason: gift.reason,
  reviews_data: gift.reviews ? {
    average_rating: gift.reviews.rating,
    total_count: gift.reviews.count,
    source_platform: gift.reviews.source,
    top_highlights: gift.reviews.highlights,
    reviews_list: gift.reviews.items.map(r => ({
      id: r.id,
      author_name: r.author,
      rating_val: r.rating,
      created_at: r.date,
      content: r.text,
      tag_label: r.tag,
      photo_urls: r.photos
    }))
  } : undefined
});

const DEFAULT_PROFILE: UserProfile = {
  name: 'Друг',
  avatarEmoji: '😎',
  level: 'Новичок',
  events: []
};

const MOCK_TEAM: TeamMember[] = [
  { name: 'Александр', role: 'CEO', bio: 'AI Visionary', linkedin_url: '#', photo_public_id: null },
  { name: 'Елизавета', role: 'CTO', bio: 'Tech Lead', linkedin_url: '#', photo_public_id: null }
];

const GET_MOCK_TRACKS = (): RecommendationTrack[] => [
    {
        topicId: 't_vibe',
        topicName: 'Вайб',
        title: 'Эстетика момента',
        status: 'ready',
        hypotheses: [
            { id: 'h_est_1', title: 'Утренний гедонизм', gutgType: 'Mirror', description: 'Вещи для тех, кто превращает завтрак в ритуал. Красивая посуда, редкий кофе.', previewGifts: [MOCK_DB_GIFTS[20], MOCK_DB_GIFTS[21], MOCK_DB_GIFTS[16], MOCK_DB_GIFTS[10]] },
            { id: 'h_est_2', title: 'Мягкий вечер', gutgType: 'Anchor', description: 'Создаем уютное убежище от внешнего мира. Свет, текстиль, ароматы.', previewGifts: [MOCK_DB_GIFTS[5], MOCK_DB_GIFTS[31], MOCK_DB_GIFTS[13], MOCK_DB_GIFTS[18]] }
        ]
    },
    {
        topicId: 't_tech',
        topicName: 'Гаджеты',
        title: 'Умный комфорт',
        status: 'ready',
        hypotheses: [
            { id: 'h_tech_1', title: 'Цифровой дзен', gutgType: 'Optimizer', description: 'Девайсы, которые убирают лишнее трение в жизни. Порядок и эффективность.', previewGifts: [MOCK_DB_GIFTS[22], MOCK_DB_GIFTS[27], MOCK_DB_GIFTS[23], MOCK_DB_GIFTS[14]] }
        ]
    }
];

export const MockServer = {
  async getGifts(params?: { limit?: number; tag?: string; category?: string }): Promise<GiftDTO[]> {
    await delay(300);
    let results = [...MOCK_DB_GIFTS];
    if (params?.limit) results = results.slice(0, params.limit);
    return results.map(toDTO);
  },

  async getGiftsByIds(ids: string[]): Promise<GiftDTO[]> {
    return MOCK_DB_GIFTS.filter(g => ids.includes(g.id)).map(toDTO);
  },

  async getGiftById(id: string): Promise<GiftDTO> {
    const gift = MOCK_DB_GIFTS.find(g => g.id === id);
    if (!gift) throw new Error("Gift not found");
    return toDTO(gift);
  },

  async getWishlist(): Promise<string[]> {
    const stored = localStorage.getItem('gifty_wishlist');
    return stored ? JSON.parse(stored) : [];
  },

  async addToWishlist(giftId: string): Promise<void> {
    const stored = localStorage.getItem('gifty_wishlist');
    const list: string[] = stored ? JSON.parse(stored) : [];
    if (!list.includes(giftId)) {
        list.push(giftId);
        localStorage.setItem('gifty_wishlist', JSON.stringify(list));
    }
  },

  async removeFromWishlist(giftId: string): Promise<void> {
    const stored = localStorage.getItem('gifty_wishlist');
    const list: string[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem('gifty_wishlist', JSON.stringify(list.filter(id => id !== giftId)));
  },

  async getUserProfile(): Promise<UserProfile> {
    const stored = localStorage.getItem('gifty_profile');
    return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
  },

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
     const current = await this.getUserProfile();
     const updated = { ...current, ...data };
     localStorage.setItem('gifty_profile', JSON.stringify(updated));
     return updated;
  },

  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const profile = await this.getUserProfile();
    const newEvent = { ...event, id: Date.now().toString() };
    await this.updateUserProfile({ events: [...profile.events, newEvent] });
    return newEvent;
  },

  async removeEvent(id: string): Promise<void> {
    const profile = await this.getUserProfile();
    await this.updateUserProfile({ events: profile.events.filter(e => e.id !== id) });
  },

  async getGUTGSession(variant: 'BRANCHING' | 'TRACKS' | 'FEED' | 'DEAD_END' | 'REFINE' = 'BRANCHING'): Promise<RecommendationSession> {
    await delay(500);
    
    if (variant === 'BRANCHING') {
        return {
          session_id: 'mock_session_probe',
          state: 'BRANCHING',
          current_probe: {
            question: 'Что для получателя важнее всего в вещах?',
            subtitle: 'Это поможет мне выбрать правильный вектор поиска',
            options: [
              { id: 'opt_util', label: 'Польза и удобство', icon: '⚙️', description: 'Главное чтобы работало' },
              { id: 'opt_aest', label: 'Эстетика и стиль', icon: '🎨', description: 'Важно как выглядит' },
              { id: 'opt_wow', label: 'Вау-эффект', icon: '✨', description: 'Хочу удивить' }
            ]
          }
        } as any;
    }

    if (variant === 'REFINE') {
        return {
            session_id: 'mock_session_refine',
            state: 'SHOWING_HYPOTHESES', // Keeps showing results
            tracks: GET_MOCK_TRACKS(),
            current_probe: {
                question: 'Как насчет виниловых проигрывателей?',
                subtitle: 'Я заметил интерес к музыке. Это актуально?',
                options: [
                    { id: 'yes', label: 'Да, он обожает винил', icon: '💿' },
                    { id: 'no', label: 'Нет, предпочитает цифру', icon: '📱' }
                ]
            }
        } as any;
    }

    if (variant === 'TRACKS') {
        return {
            session_id: 'mock_session_tracks',
            state: 'SHOWING_HYPOTHESES',
            tracks: GET_MOCK_TRACKS()
        } as any;
    }

    if (variant === 'FEED') {
        return {
            session_id: 'mock_session_feed',
            state: 'DEEP_DIVE',
            deep_dive_products: MOCK_DB_GIFTS.slice(0, 10)
        } as any;
    }

    return {
        session_id: 'mock_session_dead',
        state: 'DEAD_END'
    } as any;
  },

  async getTeam(): Promise<TeamMember[]> {
      return MOCK_TEAM;
  }
};
