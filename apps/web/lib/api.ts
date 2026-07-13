import {
  Article,
  Category,
  Tag,
  Comment,
  PaginatedResponse,
  User,
  ApiResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  private buildSearchParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    return searchParams;
  }

  // Articles
  async getArticles(params?: {
    search?: string;
    categoryId?: string;
    subcategoryId?: string;
    tag?: string;
    authorId?: string;
    status?: string;
    isFeatured?: boolean;
    isSticky?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Article>> {
    const searchParams = this.buildSearchParams({
      search: params?.search,
      categoryId: params?.categoryId,
      subcategoryId: params?.subcategoryId,
      tag: params?.tag,
      authorId: params?.authorId,
      status: params?.status,
      isFeatured: params?.isFeatured,
      isSticky: params?.isSticky,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      page: params?.page,
      limit: params?.limit,
    });

    const query = searchParams.toString();
    return this.request(`/news${query ? `?${query}` : ''}`);
  }

  async getArticle(slug: string): Promise<Article> {
    return this.request(`/news/slug/${slug}`);
  }

  async getFeaturedArticles(limit: number = 5): Promise<Article[]> {
    return this.request(`/news/featured?limit=${limit}`);
  }

  async getLatestArticles(limit: number = 10): Promise<Article[]> {
    return this.request(`/news/latest?limit=${limit}`);
  }

  async getMostReadArticles(limit: number = 10): Promise<Article[]> {
    return this.request(`/news/most-read?limit=${limit}`);
  }

  async getRelatedArticles(articleId: string, limit: number = 5): Promise<Article[]> {
    return this.request(`/news/${articleId}/related?limit=${limit}`);
  }

  async getArticlesByCategory(
    categoryId: string,
    limit: number = 12,
    page: number = 1,
  ): Promise<PaginatedResponse<Article>> {
    const searchParams = this.buildSearchParams({ categoryId, limit, page });
    return this.request(`/news?${searchParams.toString()}`);
  }

  async searchArticles(
    query: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<PaginatedResponse<Article>> {
    const searchParams = this.buildSearchParams({ search: query, limit, page });
    return this.request(`/news?${searchParams.toString()}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request(`/categories/slug/${slug}`);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.request('/tags');
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    return this.request(`/tags/popular?limit=${limit}`);
  }

  async getArticlesByTag(
    tagSlug: string,
    limit: number = 12,
    page: number = 1,
  ): Promise<PaginatedResponse<Article>> {
    const searchParams = this.buildSearchParams({ tag: tagSlug, limit, page });
    return this.request(`/news?${searchParams.toString()}`);
  }

  // Comments
  async getArticleComments(
    articleId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Comment[]> {
    const searchParams = this.buildSearchParams({ articleId, limit, offset });
    return this.request(`/comments?${searchParams.toString()}`);
  }

  async createComment(data: {
    content: string;
    articleId: string;
    parentId?: string;
    guestName?: string;
    guestEmail?: string;
  }): Promise<Comment> {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/me', { method: 'POST' });
  }

  // Newsletter
  async subscribeNewsletter(email: string, name?: string): Promise<ApiResponse<unknown>> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
