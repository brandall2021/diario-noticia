# Phase 4: Frontend Portal Público Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, responsive public-facing news portal using Next.js 14+ with App Router and Tailwind CSS, consuming the Diario Noticia backend API.

**Architecture:** Next.js 14+ App Router with server components where possible, Tailwind CSS for styling, SWR/React Query for data fetching. The portal includes homepage, article pages, category pages, search, and user authentication.

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS, SWR, next-auth (optional for future), Lucide React icons

## Global Constraints
- Use Next.js 14+ App Router (not Pages Router)
- Server Components by default, Client Components only when needed
- Tailwind CSS for all styling (no CSS modules)
- Mobile-first responsive design
- SEO optimized with proper meta tags
- Accessible (WCAG 2.1 AA)
- Spanish language support (primary)
- Commit after each task

---

## File Structure

### Phase 4 Files

| File | Responsibility |
|------|----------------|
| `apps/web/` | Next.js application root |
| `apps/web/package.json` | Dependencies |
| `apps/web/next.config.js` | Next.js configuration |
| `apps/web/tailwind.config.ts` | Tailwind configuration |
| `apps/web/tsconfig.json` | TypeScript configuration |
| `apps/web/app/layout.tsx` | Root layout with providers |
| `apps/web/app/page.tsx` | Homepage |
| `apps/web/app/globals.css` | Global styles |
| `apps/web/lib/api.ts` | API client utilities |
| `apps/web/lib/types.ts` | TypeScript interfaces |
| `apps/web/components/Header.tsx` | Site header/navigation |
| `apps/web/components/Footer.tsx` | Site footer |
| `apps/web/components/ArticleCard.tsx` | Article preview card |
| `apps/web/components/CategoryBadge.tsx` | Category badge component |
| `apps/web/app/articulo/[slug]/page.tsx` | Article detail page |
| `apps/web/app/categoria/[slug]/page.tsx` | Category listing page |
| `apps/web/app/buscar/page.tsx` | Search page |
| `apps/web/app/login/page.tsx` | Login page |
| `apps/web/app/registro/page.tsx` | Registration page |

---

## Tasks

### Task 1: Project Setup

**Files:**
- Create: `apps/web/` directory structure
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`

**Interfaces:**
- Consumes: Backend API at `http://localhost:3000`
- Produces: Running Next.js dev server

- [ ] **Step 1: Create Next.js project directory**

```bash
mkdir -p apps/web
```

- [ ] **Step 2: Create package.json**

```json
// apps/web/package.json
{
  "name": "diario-noticia-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "swr": "^2.2.4",
    "lucide-react": "^0.344.0",
    "date-fns": "^3.3.1",
    "date-fns-tz": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 3: Create next.config.js**

```javascript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/diario-noticia/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create tsconfig.json**

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
// apps/web/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create globals.css**

```css
/* apps/web/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .container-custom {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }
}
```

- [ ] **Step 8: Create layout.tsx**

```tsx
// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Diario Noticia - Tu fuente de noticias confiable',
  description: 'Noticias de última hora, análisis, opiniones y más en Diario Noticia',
  keywords: ['noticias', 'diario', 'actualidad', 'periódico'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Create page.tsx (placeholder)**

```tsx
// apps/web/app/page.tsx
export default function Home() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold">Bienvenido a Diario Noticia</h1>
      <p className="mt-4 text-gray-600">Portal en construcción...</p>
    </div>
  );
}
```

- [ ] **Step 10: Install dependencies and test**

```bash
cd apps/web && npm install && npm run dev
```

Expected: Next.js dev server starts on port 3001

- [ ] **Step 11: Commit**

```bash
git add apps/web
git commit -m "feat(web): initialize Next.js project with Tailwind CSS"
```

---

### Task 2: API Client & Types

**Files:**
- Create: `apps/web/lib/api.ts`
- Create: `apps/web/lib/types.ts`

**Interfaces:**
- Consumes: Backend API
- Produces: API client functions, TypeScript interfaces

- [ ] **Step 1: Create TypeScript types**

```typescript
// apps/web/lib/types.ts
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
  content: any;
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
  metadata?: any;
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
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
```

- [ ] **Step 2: Create API client**

```typescript
// apps/web/lib/api.ts'
import { Article, Category, Tag, Comment, PaginatedResponse, User } from './types';

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // Articles
  async getArticles(params?: {
    categoryId?: string;
    tagSlug?: string;
    status?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
  }): Promise<PaginatedResponse<Article>> {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.tagSlug) searchParams.set('tagSlug', params.tagSlug);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.featured) searchParams.set('featured', 'true');

    const query = searchParams.toString();
    return this.request(`/news${query ? `?${query}` : ''}`);
  }

  async getArticle(slug: string): Promise<Article> {
    return this.request(`/news/slug/${slug}`);
  }

  async getFeaturedArticles(): Promise<Article[]> {
    return this.request('/news?featured=true&limit=5');
  }

  async getLatestArticles(limit: number = 10): Promise<PaginatedResponse<Article>> {
    return this.request(`/news?status=PUBLISHED&limit=${limit}`);
  }

  async getArticlesByCategory(
    categorySlug: string,
    limit: number = 12,
  ): Promise<PaginatedResponse<Article>> {
    return this.request(`/news?categorySlug=${categorySlug}&limit=${limit}`);
  }

  async searchArticles(
    query: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<Article>> {
    return this.request(`/news?search=${encodeURIComponent(query)}&limit=${limit}`);
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

  async getArticlesByTag(
    tagSlug: string,
    limit: number = 12,
  ): Promise<PaginatedResponse<Article>> {
    return this.request(`/news?tagSlug=${tagSlug}&limit=${limit}`);
  }

  // Comments
  async getArticleComments(
    articleId: string,
    limit: number = 20,
  ): Promise<Comment[]> {
    return this.request(`/comments?articleId=${articleId}&limit=${limit}`);
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
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
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
  }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/profile');
  }

  // Newsletter
  async subscribeNewsletter(email: string, name?: string): Promise<any> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib
git commit -m "feat(web): add API client and TypeScript types"
```

---

### Task 3: Core Components (Header, Footer, ArticleCard)

**Files:**
- Create: `apps/web/components/Header.tsx`
- Create: `apps/web/components/Footer.tsx`
- Create: `apps/web/components/ArticleCard.tsx`
- Create: `apps/web/components/CategoryBadge.tsx`

**Interfaces:**
- Consumes: API client, types
- Produces: Reusable UI components

- [ ] **Step 1: Create Header component**

```tsx
// apps/web/components/Header.tsx'
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b py-2 text-sm text-gray-600">
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex items-center gap-4">
            <Link href="/suscripcion" className="hover:text-primary-600">Suscripciones</Link>
            <Link href="/login" className="hover:text-primary-600">Iniciar sesión</Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600 font-serif">Diario Noticia</h1>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar noticias..."
                className="w-64 rounded-full border px-4 py-2 pl-10 text-sm focus:border-primary-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
            >
              <User className="h-4 w-4" />
              <span>Mi cuenta</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="border-t py-3">
          <ul className="flex items-center gap-6 overflow-x-auto text-sm font-medium">
            <li><Link href="/categoria/politica" className="hover:text-primary-600">Política</Link></li>
            <li><Link href="/categoria/economia" className="hover:text-primary-600">Economía</Link></li>
            <li><Link href="/categoria/sociedad" className="hover:text-primary-600">Sociedad</Link></li>
            <li><Link href="/categoria/deportes" className="hover:text-primary-600">Deportes</Link></li>
            <li><Link href="/categoria/espectaculos" className="hover:text-primary-600">Espectáculos</Link></li>
            <li><Link href="/categoria/tecnologia" className="hover:text-primary-600">Tecnología</Link></li>
            <li><Link href="/categoria/salud" className="hover:text-primary-600">Salud</Link></li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white py-4">
          <div className="container-custom">
            <input
              type="text"
              placeholder="Buscar noticias..."
              className="w-full rounded-full border px-4 py-2 pl-10 text-sm mb-4"
            />
            <ul className="space-y-3">
              <li><Link href="/categoria/politica" className="block py-2">Política</Link></li>
              <li><Link href="/categoria/economia" className="block py-2">Economía</Link></li>
              <li><Link href="/categoria/sociedad" className="block py-2">Sociedad</Link></li>
              <li><Link href="/categoria/deportes" className="block py-2">Deportes</Link></li>
              <li><Link href="/categoria/espectaculos" className="block py-2">Espectáculos</Link></li>
              <li><Link href="/categoria/tecnologia" className="block py-2">Tecnología</Link></li>
              <li><Link href="/categoria/salud" className="block py-2">Salud</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Create Footer component**

```tsx
// apps/web/components/Footer.tsx'
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white font-serif">Diario Noticia</h3>
            <p className="mt-4 text-sm">
              Tu fuente de noticias confiable. Información veraz, actual y balanceada las 24 horas.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Secciones</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categoria/politica" className="hover:text-white">Política</Link></li>
              <li><Link href="/categoria/economia" className="hover:text-white">Economía</Link></li>
              <li><Link href="/categoria/sociedad" className="hover:text-white">Sociedad</Link></li>
              <li><Link href="/categoria/deportes" className="hover:text-white">Deportes</Link></li>
              <li><Link href="/categoria/espectaculos" className="hover:text-white">Espectáculos</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/quienes-somos" className="hover:text-white">Quiénes somos</Link></li>
              <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
              <li><Link href="/trabaja-con-nosotros" className="hover:text-white">Trabaja con nosotros</Link></li>
              <li><Link href="/publicidad" className="hover:text-white">Publicidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@dianoticia.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Ciudad, País</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create ArticleCard component**

```tsx
// apps/web/components/ArticleCard.tsx'
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MessageSquare } from 'lucide-react';
import { Article } from '@/lib/types';
import CategoryBadge from './CategoryBadge';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (variant === 'featured') {
    return (
      <Link href={`/articulo/${article.slug}`} className="group">
        <article className="relative overflow-hidden rounded-lg bg-gray-900">
          {article.media?.[0]?.url && (
            <div className="relative h-96">
              <Image
                src={article.media[0].url}
                alt={article.media[0].alt || article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {article.category && (
              <CategoryBadge category={article.category} className="mb-3" />
            )}
            <h2 className="text-2xl font-bold font-serif line-clamp-2">{article.title}</h2>
            {article.subtitle && (
              <p className="mt-2 text-gray-300 line-clamp-2">{article.subtitle}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>{article.author.firstName} {article.author.lastName}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTimeMinutes} min
              </span>
              {article._count?.comments && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {article._count.comments}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/articulo/${article.slug}`} className="group">
        <article className="flex gap-4">
          {article.media?.[0]?.url && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={article.media[0].url}
                alt={article.media[0].alt || article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary-600">
              {article.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/articulo/${article.slug}`} className="group">
      <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
        {article.media?.[0]?.url && (
          <div className="relative h-48">
            <Image
              src={article.media[0].url}
              alt={article.media[0].alt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          {article.category && (
            <CategoryBadge category={article.category} className="mb-2" />
          )}
          <h3 className="font-bold line-clamp-2 group-hover:text-primary-600">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{article.author.firstName} {article.author.lastName}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTimeMinutes} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 4: Create CategoryBadge component**

```tsx
// apps/web/components/CategoryBadge.tsx'
import Link from 'next/link';
import { Category } from '@/lib/types';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export default function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${className}`}
      style={{
        backgroundColor: category.color ? `${category.color}20` : '#eff6ff',
        color: category.color || '#2563eb',
      }}
    >
      {category.name}
    </Link>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components
git commit -m "feat(web): add Header, Footer, ArticleCard, and CategoryBadge components"
```

---

### Task 4: Homepage

**Files:**
- Modify: `apps/web/app/page.tsx`
- Create: `apps/web/components/NewsletterForm.tsx`

**Interfaces:**
- Consumes: API client, ArticleCard component
- Produces: Fully functional homepage

- [ ] **Step 1: Create NewsletterForm component**

```tsx
// apps/web/components/NewsletterForm.tsx'
'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.subscribeNewsletter(email);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Error al suscribirse. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold text-green-800">¡Suscrito!</h3>
        <p className="mt-2 text-sm text-green-700">
          Gracias por suscribirte a nuestro newsletter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-primary-50 p-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary-600" />
        <div>
          <h3 className="text-lg font-semibold">Suscríbete a nuestro newsletter</h3>
          <p className="text-sm text-gray-600">Recibe las noticias más importantes en tu correo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          required
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Suscribiendo...' : 'Suscribir'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update homepage with real data**

```tsx
// apps/web/app/page.tsx'
import { Suspense } from 'react';
import api from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import NewsletterForm from '@/components/NewsletterForm';

async function getFeaturedArticles() {
  try {
    const articles = await api.getFeaturedArticles();
    return articles;
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

async function getLatestArticles() {
  try {
    const response = await api.getLatestArticles(8);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

export default async function HomePage() {
  const [featuredArticles, latestArticles] = await Promise.all([
    getFeaturedArticles(),
    getLatestArticles(),
  ]);

  return (
    <div className="container-custom py-8">
      {/* Featured Article */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <ArticleCard article={featuredArticles[0]} variant="featured" />
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <section>
            <h2 className="mb-6 text-2xl font-bold">Últimas noticias</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Newsletter */}
          <NewsletterForm />

          {/* More featured articles */}
          {featuredArticles.length > 1 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Destacados</h3>
              <div className="space-y-4">
                {featuredArticles.slice(1, 4).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Test the homepage**

Run: `npm run dev`
Navigate to: `http://localhost:3001`
Expected: Homepage loads with articles (or shows empty state if no articles)

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/page.tsx apps/web/components/NewsletterForm.tsx
git commit -m "feat(web): implement homepage with articles and newsletter"
```

---

### Task 5: Article Detail Page

**Files:**
- Create: `apps/web/app/articulo/[slug]/page.tsx`
- Create: `apps/web/components/Comments.tsx`

**Interfaces:**
- Consumes: API client, ArticleCard, types
- Produces: Article detail page with comments

- [ ] **Step 1: Create Comments component**

```tsx
// apps/web/components/Comments.tsx'
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment } from '@/lib/types';

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      const data = await api.getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createComment({
        content: newComment,
        articleId,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
      });
      setNewComment('');
      setGuestName('');
      setGuestEmail('');
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse py-8 text-center text-gray-500">Cargando comentarios...</div>;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <MessageSquare className="h-5 w-5" />
        Comentarios ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={4}
          required
          className="w-full rounded-lg border px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Tu correo (opcional)"
            className="rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Publicar comentario'}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No hay comentarios aún. Sé el primero en comentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium">
                    {comment.author
                      ? `${comment.author.firstName} ${comment.author.lastName}`
                      : comment.guestName || 'Anónimo'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-primary-600">
                  <ThumbsUp className="h-4 w-4" />
                  {comment._count?.likes || 0}
                </button>
                <button className="flex items-center gap-1 hover:text-red-600">
                  <Flag className="h-4 w-4" />
                  Reportar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create article detail page**

```tsx
// apps/web/app/articulo/[slug]/page.tsx'
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Share2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import CategoryBadge from '@/components/CategoryBadge';
import Comments from '@/components/Comments';
import ArticleCard from '@/components/ArticleCard';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await api.getArticle(params.slug);
    return {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      openGraph: {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        images: article.ogImage ? [article.ogImage] : [],
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [`${article.author.firstName} ${article.author.lastName}`],
      },
    };
  } catch {
    return { title: 'Artículo no encontrado' };
  }
}

export default async function ArticlePage({ params }: Props) {
  let article;
  try {
    article = await api.getArticle(params.slug);
  } catch {
    notFound();
  }

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get related articles (same category)
  let relatedArticles = [];
  if (article.category) {
    try {
      const response = await api.getArticlesByCategory(article.category.slug, 4);
      relatedArticles = (response.data || []).filter((a) => a.id !== article.id).slice(0, 3);
    } catch {
      // Ignore error
    }
  }

  return (
    <div className="container-custom py-8">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          {article.category && (
            <CategoryBadge category={article.category} className="mb-4" />
          )}
          <h1 className="text-3xl font-bold font-serif md:text-4xl">{article.title}</h1>
          {article.subtitle && (
            <p className="mt-4 text-xl text-gray-600">{article.subtitle}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTimeMinutes} min de lectura
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.viewCount} vistas
            </span>
            <button className="flex items-center gap-1 hover:text-primary-600">
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {article.author.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.firstName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <span className="font-medium">{article.author.firstName} {article.author.lastName}</span>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {article.media?.[0]?.url && (
          <div className="relative mb-8 h-96 overflow-hidden rounded-lg">
            <Image
              src={article.media[0].url}
              alt={article.media[0].alt || article.title}
              fill
              className="object-cover"
              priority
            />
            {article.media[0].caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-sm text-white">
                {article.media[0].caption}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Render article content - assuming JSON format from Tiptap/ProseMirror */}
          {typeof article.content === 'object' && article.content.content ? (
            <div dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />
          ) : (
            <p>{article.content}</p>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <span className="text-sm font-medium text-gray-600">Etiquetas: </span>
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        {article.allowComments && (
          <Comments articleId={article.id} />
        )}
      </article>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="mx-auto mt-12 max-w-4xl border-t pt-8">
          <h2 className="mb-6 text-2xl font-bold">Noticias relacionadas</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function renderContent(content: any): string {
  // Simple renderer for ProseMirror/Tiptap JSON content
  // In production, use a proper renderer like @tiptap/react
  if (!content?.content) return '';

  return content.content
    .map((node: any) => {
      if (node.type === 'paragraph') {
        const text = node.content
          ?.map((inline: any) => inline.text || '')
          .join('') || '';
        return `<p>${text}</p>`;
      }
      if (node.type === 'heading') {
        const text = node.content
          ?.map((inline: any) => inline.text || '')
          .join('') || '';
        const level = node.attrs?.level || 2;
        return `<h${level}>${text}</h${level}>`;
      }
      if (node.type === 'image') {
        return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`;
      }
      return '';
    })
    .join('');
}
```

- [ ] **Step 3: Test article page**

Run: `npm run dev`
Navigate to: `http://localhost:3001/articulo/<some-slug>`
Expected: Article detail page loads with content, comments, related articles

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/articulo apps/web/components/Comments.tsx
git commit -m "feat(web): implement article detail page with comments"
```

---

### Task 6: Category & Search Pages

**Files:**
- Create: `apps/web/app/categoria/[slug]/page.tsx`
- Create: `apps/web/app/buscar/page.tsx`
- Create: `apps/web/components/Pagination.tsx`

**Interfaces:**
- Consumes: API client, ArticleCard
- Produces: Category listing and search pages

- [ ] **Step 1: Create Pagination component**

```tsx
// apps/web/components/Pagination.tsx'
'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2),
  );

  return (
    <nav className="flex items-center justify-center gap-2 py-8">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
      )}

      {showPages[0] > 1 && (
        <>
          <Link
            href={`${baseUrl}?page=1`}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            1
          </Link>
          {showPages[0] > 2 && <span className="px-2">...</span>}
        </>
      )}

      {showPages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`rounded-lg border px-3 py-2 text-sm ${
            page === currentPage
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}

      {showPages[showPages.length - 1] < totalPages && (
        <>
          {showPages[showPages.length - 1] < totalPages - 1 && (
            <span className="px-2">...</span>
          )}
          <Link
            href={`${baseUrl}?page=${totalPages}`}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Create category page**

```tsx
// apps/web/app/categoria/[slug]/page.tsx'
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const category = await api.getCategory(params.slug);
    return {
      title: `${category.name} - Diario Noticia`,
      description: category.description || `Noticias de ${category.name}`,
    };
  } catch {
    return { title: 'Categoría no encontrada' };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  let category;
  try {
    category = await api.getCategory(params.slug);
  } catch {
    notFound();
  }

  let articles = [];
  let total = 0;

  try {
    const response = await api.getArticlesByCategory(params.slug, limit);
    // Adjust for pagination
    articles = response.data || [];
    total = response.total || 0;
  } catch {
    // Ignore error
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-custom py-8">
      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No hay artículos en esta categoría aún.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/categoria/${params.slug}`}
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create search page**

```tsx
// apps/web/app/buscar/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await api.searchArticles(searchQuery);
      setArticles(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="container-custom py-8">
      <h1 className="mb-8 text-3xl font-bold">Buscar noticias</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, contenido, etiquetas..."
              className="w-full rounded-lg border py-3 pl-12 pr-4 text-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary-600 px-8 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Buscando...</div>
      ) : !hasSearched ? (
        <div className="py-12 text-center text-gray-500">
          Ingresa un término para buscar noticias.
        </div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No se encontraron resultados para &quot;{query}&quot;.
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-600">
            {articles.length} resultado{articles.length !== 1 ? 's' : ''} para &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add Suspense boundary for search page**

```tsx
// apps/web/app/buscar/page.tsx - wrap with Suspense
import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-custom py-8 text-center">Cargando...</div>}>
      <SearchContent />
    </Suspense>
  );
}
```

Note: Move the client component to a separate file `SearchContent.tsx`

- [ ] **Step 5: Test pages**

Run: `npm run dev`
Navigate to: `http://localhost:3001/categoria/politica`
Navigate to: `http://localhost:3001/buscar?q=noticia`
Expected: Pages load correctly with articles

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/categoria apps/web/app/buscar apps/web/components/Pagination.tsx
git commit -m "feat(web): implement category and search pages"
```

---

### Task 7: Auth Pages (Login & Register)

**Files:**
- Create: `apps/web/app/login/page.tsx`
- Create: `apps/web/app/registro/page.tsx`
- Create: `apps/web/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: API client, auth context
- Produces: Login and registration pages

- [ ] **Step 1: Create AuthContext**

```tsx
// apps/web/contexts/AuthContext.tsx'
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const userData = await api.getProfile();
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        api.setToken(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    localStorage.setItem('token', response.token);
    api.setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.register(data);
    localStorage.setItem('token', response.token);
    api.setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

- [ ] **Step 2: Wrap layout with AuthProvider**

```tsx
// apps/web/app/layout.tsx'
import { AuthProvider } from '@/contexts/AuthContext';

// ... in the body
<body className="font-sans antialiased">
  <AuthProvider>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </AuthProvider>
</body>
```

- [ ] **Step 3: Create login page**

```tsx
// apps/web/app/login/page.tsx'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-medium text-primary-600 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create register page**

```tsx
// apps/web/app/registro/page.tsx'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Apellido</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full rounded-lg border px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Test auth flow**

Run: `npm run dev`
Navigate to: `http://localhost:3001/registro`
Navigate to: `http://localhost:3001/login`
Test registration and login flow

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/login apps/web/app/registro apps/web/contexts
git commit -m "feat(web): implement login and registration pages with auth context"
```

---

### Task 8: Final Verification & Progress Update

**Files:**
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: All Phase 4 tasks
- Produces: Verified frontend, updated progress

- [ ] **Step 1: Run build verification**

```bash
cd apps/web && npm run build
```

Expected: Build completes without errors

- [ ] **Step 2: Manual testing checklist**

- [ ] Homepage loads with articles
- [ ] Article detail page renders correctly
- [ ] Category page shows filtered articles
- [ ] Search functionality works
- [ ] Login/Register pages functional
- [ ] Newsletter subscription works
- [ ] Comments section displays and allows posting
- [ ] Responsive design on mobile
- [ ] Navigation works correctly

- [ ] **Step 3: Update progress.md**

Add Phase 4 tasks to the progress ledger.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "docs: complete Phase 4 verification and update progress"
```
