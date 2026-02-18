
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio?: string | null;
  birth_date?: string | null; // ISO Date string
  telegram_connected?: boolean;
  quiz_results?: any;
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

export interface Friend {
    friend: User; // Backend wrapper structure
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
  age: number;
  recipientGender: RecipientGender | null;
  occasion: string;
  relationship: string;
  vibe: string;
  city: string;
  roles: string[]; 
  roleConfidence: 'sure' | 'guessing';
  archetype: string;
  selfWorth: string;
  conversationTopics: string;
  topicDuration: 'long_term' | 'temporary';
  painPoints: string[];
  painStyle: 'endurer' | 'optimizer';
  riskyTopics: boolean;
  effortLevel?: 'no_effort' | 'low' | 'medium' | 'high';
  deadline?: number; 
  goal?: string; 
  interests: string;
  budget: string;
  exclude?: string;
}

export interface DialogueProbeOption {
    id: string;
    label: string;
    icon?: string; 
    description?: string;
}

export interface DialogueHypothesis {
    id: string;
    title: string;
    primary_gap: string; // 'the_mirror' | 'the_optimizer' | 'the_anchor' | 'the_catalyst'
    description: string;
    preview_products: Gift[];
}

export interface RecommendationTrack {
    topic_id: string;
    topic_name: string;
    title: string;
    status: 'ready' | 'pending' | 'failed';
    preview_text?: string;
    hypotheses: DialogueHypothesis[];
}

export type GUTGState = 'BRANCHING' | 'SHOWING_HYPOTHESES' | 'DEEP_DIVE' | 'DEAD_END';

export interface RecommendationSession {
    session_id: string;
    state: GUTGState;
    selected_topic?: string;
    tracks?: RecommendationTrack[];
    current_probe?: {
        question: string;
        subtitle?: string;
        options: DialogueProbeOption[];
    };
    deep_dive_products?: Gift[];
    topic_hints?: { id: string; title: string; description: string }[];
}

export interface UserProfile {
    name: string;
    avatarEmoji: string;
    level: string;
    events: CalendarEvent[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    personName?: string;
    relationship?: string;
}

export interface TeamMember {
    name: string;
    role: string;
    bio: string;
    linkedin_url: string | null;
    photo_public_id: string | null;
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
    content: BlogContentBlock[];
    featured?: boolean;
}
