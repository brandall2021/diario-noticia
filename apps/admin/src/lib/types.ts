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
  content: Record<string, unknown>;
  excerpt?: string;
  status: ArticleStatus;
  isFeatured: boolean;
  isSticky: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  category?: Category;
  tags: Tag[];
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
  sortOrder: number;
  isActive: boolean;
  _count?: {
    articles: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  author?: User;
  guestName?: string;
  guestEmail?: string;
  _count?: {
    likes: number;
    replies: number;
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
