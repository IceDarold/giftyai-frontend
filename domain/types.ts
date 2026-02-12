
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  tag?: string;
  photos?: string[];
}

export interface GiftReviews {
  rating: number;
  count: number;
  source?: string;
  highlights?: string[];
  items: ReviewItem[];
}

export interface Gift {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  productUrl: string;
  merchant: string | null;
  category: string | null;
  tags?: string[];
  reason?: string;
  reviews?: GiftReviews;
}

export interface RecommendationsResponse {
  quizRunId: string;
  engineVersion: string;
  featuredGift: Gift;
  gifts: Gift[];
  debug?: any | null;
  requestPayload?: any;
  serverError?: any;
}

export type RecipientGender = 'male' | 'female' | 'unisex';

export interface QuizAnswers {
  name: string;
  ageGroup: string;
  recipientGender: RecipientGender | null;
  occasion: string;
  relationship: string;
  vibe: string;
  city: string;
  
  // New Deep Profile Fields
  roles: string[]; 
  roleConfidence: 'sure' | 'guessing';
  archetype: string;
  selfWorth: string;
  conversationTopics: string;
  topicDuration: 'long_term' | 'temporary';
  painPoints: string[];
  painStyle: 'endurer' | 'optimizer';
  riskyTopics: boolean;

  effortLevel?: string;
  idealWeekend?: string;
  materialAttitude?: string;

  interests: string;
  budget: string;
  exclude?: string;
}

export type StepId = 'name' | 'age' | 'gender' | 'occasion' | 'relationship' | 'vibe' | 'city' | 'roles' | 'archetype' | 'topics' | 'pain' | 'interests' | 'budget';

export interface FilterState {
  budget: string;
  category: string;
  marketplace: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  personName: string;
  relationship: string;
}

export interface UserProfile {
  name: string;
  avatarEmoji: string;
  level: string;
  events: CalendarEvent[];
}

export interface BlogContentBlock {
  type: 'paragraph' | 'h2' | 'quote' | 'list';
  text?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorAvatar: string;
  featured?: boolean;
  content: BlogContentBlock[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string | null;
  linkedin_url: string | null;
  photo_public_id: string | null;
  sort_order?: number;
}

// --- GUTG Dialogue Types (Updated for Real API) ---

export interface DialogueProbeOption {
    id: string;
    label: string;
    // API might return icon, if not we fallback
    icon?: string; 
    description?: string;
}

export interface DialogueHypothesis {
    id: string;
    title: string;
    gutgType: string; // 'Mirror' | 'Optimizer' | 'Anchor' | 'Catalyst'
    description: string; // The reasoning from AI
    previewGifts: Gift[];
}

export type GUTGState = 'BRANCHING' | 'SHOWING_HYPOTHESES' | 'DEEP_DIVE' | 'DEAD_END';

export interface RecommendationSession {
    session_id: string;
    state: GUTGState;
    selected_topic?: string;
    language?: string;
    current_probe?: {
        question: string;
        subtitle?: string;
        options: DialogueProbeOption[];
    };
    current_hypotheses?: DialogueHypothesis[];
    deep_dive_products?: Gift[];
}
