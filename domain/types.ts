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
  // Legacy support or internal UI scoring
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
  // Enhanced debug info
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
  interests: string;
  budget: string;
  exclude?: string;
}

export type StepId = 'name' | 'age' | 'gender' | 'occasion' | 'relationship' | 'vibe' | 'city' | 'interests' | 'budget';

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