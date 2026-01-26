import { GiftDTO, GiftReviewsDTO, ReviewItemDTO, RecommendationResponseDTO } from '../api/dto/types';
import { Gift, GiftReviews, ReviewItem, RecommendationsResponse } from '../domain/types';

const mapReviewItem = (dto: ReviewItemDTO): ReviewItem => ({
  id: dto.id,
  author: dto.author_name,
  rating: dto.rating_val,
  date: dto.created_at,
  text: dto.content,
  tag: dto.tag_label,
  photos: dto.photo_urls,
});

const mapReviews = (dto: GiftReviewsDTO): GiftReviews => ({
  rating: dto.average_rating,
  count: dto.total_count,
  source: dto.source_platform,
  highlights: dto.top_highlights,
  items: dto.reviews_list.map(mapReviewItem),
});

export const mapGiftDTOToGift = (dto: GiftDTO): Gift => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  price: dto.price,
  currency: dto.currency || 'RUB',
  imageUrl: dto.image_url,
  productUrl: dto.product_url,
  merchant: dto.merchant,
  category: dto.category,
  tags: dto.tags_list,
  reason: dto.ai_reason,
  reviews: dto.reviews_data ? mapReviews(dto.reviews_data) : undefined,
});

export const mapRecommendationsResponse = (dto: RecommendationResponseDTO): RecommendationsResponse => ({
  quizRunId: dto.quiz_run_id,
  engineVersion: dto.engine_version,
  featuredGift: mapGiftDTOToGift(dto.featured_gift),
  gifts: dto.gifts.map(mapGiftDTOToGift),
  debug: dto.debug,
});