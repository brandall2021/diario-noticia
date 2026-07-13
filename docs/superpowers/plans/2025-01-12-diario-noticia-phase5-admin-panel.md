# Phase 5: Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive admin dashboard for managing all aspects of Diario Noticia, including articles, users, comments, media, newsletters, and system settings.

**Architecture:** Separate Next.js 14+ application with its own design system. Protected routes with JWT authentication. Dashboard layout with sidebar navigation. CRUD operations for all entities with real-time updates.

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS, SWR, React Hook Form, Zod, Recharts (for analytics)

## Global Constraints
- Separate app from public portal (port 3002)
- All routes protected (redirect to login if not authenticated)
- Role-based access (Admin, Editor, Journalist)
- Responsive sidebar navigation
- Form validation with React Hook Form + Zod
- Charts/analytics dashboard
- Commit after each task

---

## File Structure

### Phase 5 Files

| File | Responsibility |
|------|----------------|
| `apps/admin/` | Admin application root |
| `apps/admin/package.json` | Dependencies |
| `apps/admin/app/layout.tsx` | Admin layout with sidebar |
| `apps/admin/app/page.tsx` | Dashboard overview |
| `apps/admin/app/login/page.tsx` | Admin login |
| `apps/admin/app/articulos/page.tsx` | Articles list |
| `apps/admin/app/articulos/nuevo/page.tsx` | Create article |
| `apps/admin/app/articulos/[id]/editar/page.tsx` | Edit article |
| `apps/admin/app/categorias/page.tsx` | Categories management |
| `apps/admin/app/usuarios/page.tsx` | Users management |
| `apps/admin/app/comentarios/page.tsx` | Comments moderation |
| `apps/admin/app/media/page.tsx` | Media library |
| `apps/admin/app/newsletter/page.tsx` | Newsletter subscribers |
| `apps/admin/app/suscripciones/page.tsx` | Subscriptions management |
| `apps/admin/app/configuracion/page.tsx` | System settings |
| `apps/admin/components/Sidebar.tsx` | Navigation sidebar |
| `apps/admin/components/Header.tsx` | Admin header |
| `apps/admin/components/DataTable.tsx` | Reusable data table |
- Create: `apps/admin/components/Modal.tsx` | Reusable modal
- Create: `apps/admin/components/StatsCard.tsx` | Statistics card
- Create: `apps/admin/lib/api.ts` | Admin API client
- Create: `apps/admin/lib/validations.ts` | Zod schemas

---

## Tasks

### Task 1: Project Setup

**Files:**
- Create: `apps/admin/` directory
- Create: `apps/admin/package.json`
- Create: `apps/admin/next.config.js`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/tsconfig.json`

**Interfaces:**
- Consumes: Backend API
- Produces: Running admin dev server

- [ ] **Step 1: Create package.json**

```json
// apps/admin/package.json
{
  "name": "diario-noticia-admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
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
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "recharts": "^2.12.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
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

- [ ] **Step 2: Create configs (next.config.js, tailwind.config.ts, tsconfig.json, postcss.config.js)**

Similar to Phase 4 but with different port and title.

- [ ] **Step 3: Install dependencies and test**

```bash
cd apps/admin && npm install && npm run dev
```

Expected: Dev server starts on port 3002

- [ ] **Step 4: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): initialize admin panel project"
```

---

### Task 2: Admin Layout & Auth

**Files:**
- Create: `apps/admin/app/layout.tsx`
- Create: `apps/admin/app/login/page.tsx`
- Create: `apps/admin/components/Sidebar.tsx`
- Create: `apps/admin/components/Header.tsx`
- Create: `apps/admin/contexts/AdminAuthContext.tsx`
- Create: `apps/admin/lib/api.ts`

**Interfaces:**
- Consumes: Backend API
- Produces: Protected admin layout

- [ ] **Step 1: Create AdminAuthContext**

```tsx
// apps/admin/contexts/AdminAuthContext.tsx'
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    api.setToken(token);
    try {
      const userData = await api.getProfile();
      // Check if user has admin/editor role
      if (!['ADMIN', 'EDITOR'].includes(userData.role.name)) {
        throw new Error('Unauthorized');
      }
      setUser(userData);
    } catch {
      localStorage.removeItem('admin_token');
      api.setToken(null);
      router.push('/login');
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (!['ADMIN', 'EDITOR'].includes(response.user.role.name)) {
      throw new Error('Acceso no autorizado');
    }
    localStorage.setItem('admin_token', response.token);
    api.setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    api.setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasRole = (...roles: string[]) => {
    return user ? roles.includes(user.role.name) : false;
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
```

- [ ] **Step 2: Create Sidebar component**

```tsx
// apps/admin/components/Sidebar.tsx'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Tags,
  Users,
  MessageSquare,
  Image,
  Mail,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/articulos', label: 'Artículos', icon: FileText },
  { href: '/categorias', label: 'Categorías', icon: Tags },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/comentarios', label: 'Comentarios', icon: MessageSquare },
  { href: '/media', label: 'Media', icon: Image },
  { href: '/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/suscripciones', label: 'Suscripciones', icon: CreditCard },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gray-900 text-white">
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/" className="text-xl font-bold">
          Diario Admin
        </Link>
      </div>

      <nav className="mt-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create admin layout**

```tsx
// apps/admin/app/layout.tsx'
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Diario Admin - Panel de administración',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AdminAuthProvider>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="ml-64 flex-1">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </div>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create login page (standalone layout)**

```tsx
// apps/admin/app/login/page.tsx'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">Panel de Administración</h1>
        
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
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/app/layout.tsx apps/admin/app/login apps/admin/components/Sidebar.tsx apps/admin/contexts
git commit -m "feat(admin): implement admin layout with sidebar and auth"
```

---

### Task 3: Dashboard Overview

**Files:**
- Create: `apps/admin/app/page.tsx`
- Create: `apps/admin/components/StatsCard.tsx`
- Create: `apps/admin/components/RecentArticles.tsx`
- Create: `apps/admin/components/Chart.tsx`

**Interfaces:**
- Consumes: API client
- Produces: Dashboard with statistics

- [ ] **Step 1: Create StatsCard component**

```tsx
// apps/admin/components/StatsCard.tsx'
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={`mt-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard page**

```tsx
// apps/admin/app/page.tsx'
import { FileText, Users, MessageSquare, Eye } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import RecentArticles from '@/components/RecentArticles';

export default function DashboardPage() {
  // In production, fetch from API
  const stats = {
    articles: 156,
    users: 2340,
    comments: 892,
    views: 45678,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Artículos"
          value={stats.articles}
          change={12}
          icon={FileText}
          color="bg-primary-600"
        />
        <StatsCard
          title="Usuarios"
          value={stats.users}
          change={8}
          icon={Users}
          color="bg-green-600"
        />
        <StatsCard
          title="Comentarios"
          value={stats.comments}
          change={-3}
          icon={MessageSquare}
          color="bg-yellow-600"
        />
        <StatsCard
          title="Vistas"
          value={stats.views.toLocaleString()}
          change={23}
          icon={Eye}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentArticles />
        
        {/* Activity chart placeholder */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Actividad reciente</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            Gráfico de actividad (próximamente)
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/app/page.tsx apps/admin/components/StatsCard.tsx apps/admin/components/RecentArticles.tsx
git commit -m "feat(admin): implement dashboard with statistics cards"
```

---

### Task 4: Articles Management

**Files:**
- Create: `apps/admin/app/articulos/page.tsx`
- Create: `apps/admin/app/articulos/nuevo/page.tsx`
- Create: `apps/admin/app/articulos/[id]/editar/page.tsx`
- Create: `apps/admin/components/DataTable.tsx`
- Create: `apps/admin/components/ArticleForm.tsx`

**Interfaces:**
- Consumes: API client, form validation
- Produces: Full article CRUD

- [ ] **Step 1: Create DataTable component**

```tsx
// apps/admin/components/DataTable.tsx'
'use client';

import { ReactNode } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  editPath?: (item: T) => string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  editPath,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700"
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || editPath) && (
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render
                    ? col.render(item)
                    : String((item as any)[col.key])}
                </td>
              ))}
              {(onEdit || onDelete || editPath) && (
                <td className="space-x-2 px-4 py-3 text-right">
                  {editPath && (
                    <Link
                      href={editPath(item)}
                      className="inline-flex items-center text-primary-600 hover:text-primary-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create articles list page**

```tsx
// apps/admin/app/articulos/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { Article, ArticleStatus } from '@/lib/types';

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: 'Borrador',
  IN_REVIEW: 'En revisión',
  CORRECTION: 'Corrección',
  APPROVED: 'Aprobado',
  SCHEDULED: 'Programado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

const statusColors: Record<ArticleStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  CORRECTION: 'bg-orange-100 text-orange-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await api.getArticles({ limit: 100 });
      setArticles(response.data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      // TODO: Implement delete
      console.log('Delete:', article.id);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Título',
      render: (article: Article) => (
        <span className="font-medium line-clamp-1">{article.title}</span>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (article: Article) => article.category?.name || '-',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (article: Article) => (
        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[article.status]}`}>
          {statusLabels[article.status]}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Autor',
      render: (article: Article) => `${article.author.firstName} ${article.author.lastName}`,
    },
    {
      key: 'publishedAt',
      header: 'Publicado',
      render: (article: Article) =>
        article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString('es-ES')
          : '-',
    },
    {
      key: 'viewCount',
      header: 'Vistas',
      render: (article: Article) => article.viewCount.toLocaleString(),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artículos</h1>
        <Link
          href="/articulos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={articles}
          editPath={(article) => `/articulos/${article.id}/editar`}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create ArticleForm component**

```tsx
// apps/admin/components/ArticleForm.tsx'
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Category, Tag, Article } from '@/lib/types';

const articleSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  subtitle: z.string().optional(),
  bajada: z.string().optional(),
  content: z.string().min(1, 'El contenido es requerido'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']),
  isFeatured: z.boolean(),
  allowComments: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: ArticleFormData) => Promise<void>;
}

export default function ArticleForm({ article, onSubmit }: ArticleFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      subtitle: article?.subtitle || '',
      bajada: article?.bajada || '',
      content: typeof article?.content === 'string' ? article.content : '',
      categoryId: article?.categoryId || '',
      tags: article?.tags?.map((t) => t.id) || [],
      status: article?.status || 'DRAFT',
      isFeatured: article?.isFeatured || false,
      allowComments: article?.allowComments ?? true,
    },
  });

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await api.getTags();
      setAvailableTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onFormSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/articulos"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Contenido</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Título *</label>
                <input
                  {...register('title')}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Título del artículo"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Subtítulo</label>
                <input
                  {...register('subtitle')}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Subtítulo opcional"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Bajada</label>
                <textarea
                  {...register('bajada')}
                  rows={2}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="Resumen breve del artículo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Contenido *</label>
                <textarea
                  {...register('content')}
                  rows={15}
                  className="w-full rounded-lg border px-4 py-2 font-mono text-sm"
                  placeholder="Contenido del artículo (soporta HTML)"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Estado</h2>
            <select
              {...register('status')}
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="DRAFT">Borrador</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="PUBLISHED">Publicado</option>
            </select>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isFeatured')} className="rounded" />
                <span className="text-sm">Artículo destacado</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('allowComments')} className="rounded" />
                <span className="text-sm">Permitir comentarios</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Categoría</h2>
            <select
              {...register('categoryId')}
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Etiquetas</h2>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableTags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={tag.id}
                    {...register('tags')}
                    className="rounded"
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create article creation page**

```tsx
// apps/admin/app/articulos/nuevo/page.tsx'
'use client';

import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { api } from '@/lib/api';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await api.request('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    router.push('/articulos');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nuevo artículo</h1>
      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/app/articulos apps/admin/components/DataTable.tsx apps/admin/components/ArticleForm.tsx
git commit -m "feat(admin): implement articles management with CRUD"
```

---

### Task 5: Categories, Users & Comments Management

**Files:**
- Create: `apps/admin/app/categorias/page.tsx`
- Create: `apps/admin/app/usuarios/page.tsx`
- Create: `apps/admin/app/comentarios/page.tsx`

**Interfaces:**
- Consumes: API client, DataTable
- Produces: Management pages

- [ ] **Step 1: Create categories page**

```tsx
// apps/admin/app/categorias/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.request(`/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await api.request('/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#3b82f6' });
      loadCategories();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', color: '#3b82f6' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="mb-2 inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {category._count?.articles || 0} artículos
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(category)} className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create users page**

```tsx
// apps/admin/app/usuarios/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.request('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
              {user.firstName[0]}
            </div>
          )}
          <span className="font-medium">{user.firstName} {user.lastName}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
          {user.role?.name}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (user: User) => (
        user.isActive ? (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <UserCheck className="h-4 w-4" /> Activo
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 text-sm">
            <UserX className="h-4 w-4" /> Inactivo
          </span>
        )
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create comments moderation page**

```tsx
// apps/admin/app/comentarios/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Check, X, Flag, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment, CommentStatus } from '@/lib/types';

const statusConfig: Record<CommentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  SPAM: { label: 'Spam', color: 'bg-gray-100 text-gray-800' },
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CommentStatus | 'ALL'>('PENDING');

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      const response = await api.request(
        `/comments${filter !== 'ALL' ? `?status=${filter}` : ''}`
      );
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (id: string, status: CommentStatus) => {
    try {
      await api.request(`/comments/${id}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadComments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Moderación de comentarios</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SPAM'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'Todos' : statusConfig[status].label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No hay comentarios</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.author
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : comment.guestName || 'Anónimo'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusConfig[comment.status]?.color}`}>
                      {statusConfig[comment.status]?.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                  {comment._count?.reports > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <Flag className="h-4 w-4" />
                      {comment._count.reports} reportes
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(comment.id, 'APPROVED')}
                    className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                    title="Aprobar"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleModerate(comment.id, 'REJECTED')}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Rechazar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleModerate(comment.id, 'SPAM')}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                    title="Marcar como spam"
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/categorias apps/admin/app/usuarios apps/admin/app/comentarios
git commit -m "feat(admin): implement categories, users, and comments management"
```

---

### Task 6: Media Library & Newsletter

**Files:**
- Create: `apps/admin/app/media/page.tsx`
- Create: `apps/admin/app/newsletter/page.tsx`
- Create: `apps/admin/components/FileUpload.tsx`

**Interfaces:**
- Consumes: API client
- Produces: Media library and newsletter management

- [ ] **Step 1: Create FileUpload component**

```tsx
// apps/admin/components/FileUpload.tsx'
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ onUpload, accept = 'image/*' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setPreview(data.url);
      onUpload(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-32 rounded-lg object-cover" />
          <button
            onClick={() => {
              setPreview(null);
              onUpload('');
            }}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isUploading ? (
            <p className="text-sm text-gray-500">Subiendo...</p>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Arrastra un archivo o haz clic para subir
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create media library page**

```tsx
// apps/admin/app/media/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Grid, List, Trash2, Copy } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { api } from '@/lib/api';
import { Media } from '@/lib/types';

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await api.request('/media');
      setMedia(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    loadMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de medios</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded p-2 ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Upload area */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Subir archivos</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {/* Media grid/list */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-lg bg-white shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || item.originalName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="truncate text-sm">{item.originalName}</p>
                <p className="text-xs text-gray-500">{item.type}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="rounded-lg bg-white p-2 text-gray-700 hover:bg-gray-100"
                  title="Copiar URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg bg-white p-2 text-red-600 hover:bg-gray-100"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Archivo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tamaño</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                      <span className="text-sm">{item.originalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.type}</td>
                  <td className="px-4 py-3 text-sm">{(item.size / 1024).toFixed(1)} KB</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create newsletter page**

```tsx
// apps/admin/app/newsletter/page.tsx'
'use client';

import { useState, useEffect } from 'react';
import { Download, Mail, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subsData, statsData] = await Promise.all([
        api.request('/newsletter/subscribers'),
        api.request('/newsletter/stats'),
      ]);
      setSubscribers(Array.isArray(subsData) ? subsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Nombre', 'Estado', 'Fecha'],
      ...subscribers.map((sub) => [
        sub.email,
        sub.name || '',
        sub.isActive ? 'Activo' : 'Inactivo',
        new Date(sub.createdAt).toLocaleDateString('es-ES'),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-2">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total suscriptores</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sub.email}</td>
                  <td className="px-4 py-3 text-sm">{sub.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/media apps/admin/app/newsletter apps/admin/components/FileUpload.tsx
git commit -m "feat(admin): implement media library and newsletter management"
```

---

### Task 7: Final Verification

**Files:**
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: All Phase 5 tasks
- Produces: Verified admin panel, updated progress

- [ ] **Step 1: Run build verification**

```bash
cd apps/admin && npm run build
```

- [ ] **Step 2: Manual testing checklist**

- [ ] Login works with admin credentials
- [ ] Dashboard shows statistics
- [ ] Articles list loads and can create/edit
- [ ] Categories CRUD works
- [ ] Users list displays correctly
- [ ] Comments moderation works
- [ ] Media library upload/list works
- [ ] Newsletter subscribers display
- [ ] Sidebar navigation works
- [ ] Responsive design on mobile

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "docs: complete Phase 5 verification"
```
