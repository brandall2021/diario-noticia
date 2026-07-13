export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  bajada?: string;
  copete?: string;
  content: Record<string, unknown>;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  status: ArticleStatus;
  priority: number;
  isFeatured: boolean;
  isSticky: boolean;
  allowComments: boolean;
  publishedAt?: string;
  expiresAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  shareCount: number;
  readTimeMinutes: number;
  author: User;
  category?: Category;
  subcategory?: Subcategory;
  tags: Tag[];
  media: Media[];
  _count?: {
    comments: number;
  };
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  CORRECTION = 'CORRECTION',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  subcategories?: Subcategory[];
  _count?: {
    articles: number;
  };
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  categoryId: string;
  _count?: {
    articles: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Media {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  caption?: string;
  credit?: string;
  url: string;
  thumbnailUrl?: string;
  blurhash?: string;
  type: MediaType;
  metadata?: Record<string, unknown>;
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  author?: User;
  guestName?: string;
  guestEmail?: string;
  parentId?: string;
  replies?: Comment[];
  _count?: {
    likes: number;
    replies: number;
    reports: number;
  };
}

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPAM = 'SPAM',
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
