export interface ReviewItemDTO {
  id: string;
  author_name: string;
  rating_val: number;
  created_at: string;
  content: string;
  tag_label?: string;
  photo_urls?: string[];
}

export interface GiftReviewsDTO {
  average_rating: number;
  total_count: number;
  source_platform?: string;
  top_highlights?: string[];
  reviews_list: ReviewItemDTO[];
}

export interface GiftDTO {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  product_url: string;
  merchant: string | null;
  category: string | null;
  // Existing internal fields
  tags_list?: string[];
  ai_reason?: string;
  reviews_data?: GiftReviewsDTO;
}

export interface RecommendationResponseDTO {
  quiz_run_id: string;
  engine_version: string;
  featured_gift: GiftDTO;
  gifts: GiftDTO[];
  debug?: any | null;
}