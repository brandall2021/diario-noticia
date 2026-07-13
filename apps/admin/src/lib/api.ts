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

  async createArticle(data: Partial<Article>): Promise<Article> {
    return this.request('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: Partial<Article>): Promise<Article> {
    return this.request(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string): Promise<void> {
    return this.request(`/news/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request('/categories');
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.request('/tags');
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<void> {
    return this.request(`/tags/${id}`, { method: 'DELETE' });
  }

  // Comments
  async getComments(params?: {
    status?: string;
    articleId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Comment>> {
    const searchParams = this.buildSearchParams({
      status: params?.status,
      articleId: params?.articleId,
      page: params?.page,
      limit: params?.limit,
    });

    const query = searchParams.toString();
    return this.request(`/comments${query ? `?${query}` : ''}`);
  }

  async updateCommentStatus(id: string, status: string): Promise<Comment> {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const searchParams = this.buildSearchParams({
      page: params?.page,
      limit: params?.limit,
    });

    const query = searchParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/me', { method: 'POST' });
  }
}

export const api = new ApiClient(API_URL);
export default api;
