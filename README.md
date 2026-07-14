# Diario Noticia - Sistema de Gestión de Noticias Digitales

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

Sistema web moderno, responsive y escalable para la gestión y publicación de noticias digitales. Incluye portal público, panel de administración, integración con IA y herramientas de SEO.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Docker](#-docker)
- [Desarrollo](#-desarrollo)
- [Despliegue con Dokploy](#-despliegue-con-dokploy)
- [API Documentation](#-api-documentation)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Troubleshooting](#-troubleshooting)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Portal Público
- ✅ Homepage con noticias destacadas y recientes
- ✅ Páginas de detalle de artículos con comentarios
- ✅ Navegación por categorías y etiquetas
- ✅ Búsqueda de contenido
- ✅ Sistema de autenticación (login/registro)
- ✅ Suscripción a newsletter
- ✅ Diseño responsive mobile-first
- ✅ SEO optimizado (meta tags, structured data)

### Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ Gestión de noticias (CRUD completo)
- ✅ Gestión de categorías y etiquetas
- ✅ Moderación de comentarios
- ✅ Gestión de usuarios
- ✅ Biblioteca multimedia con drag-and-drop
- ✅ Gestión de newsletter
- ✅ Configuración del sistema

### Backend API
- ✅ 47+ endpoints RESTful
- ✅ Autenticación JWT con roles (ADMIN, EDITOR, AUTHOR, SUBSCRIBER)
- ✅ Upload de archivos con MinIO
- ✅ Búsqueda全文 con Elasticsearch
- ✅ Cacheo con Redis
- ✅ Integración con OpenAI para IA
- ✅ Generación de RSS y sitemap
- ✅ Tracking de analytics

### Infraestructura
- ✅ Docker Compose para desarrollo
- ✅ PostgreSQL como base de datos principal
- ✅ Redis para cacheo y colas de mensajes
- ✅ MinIO para almacenamiento de objetos
- ✅ Elasticsearch para búsqueda full-text

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
│                    (Nginx / Traefik)                        │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌───────────────────────┐       ┌───────────────────────┐
│    Portal Público     │       │   Panel Admin         │
│    (Next.js :3000)    │       │   (Next.js :3002)     │
└───────────────────────┘       └───────────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS :3001)                │
│                    ┌─────────────────────┐                  │
│                    │   JWT Auth Guard    │                  │
│                    │   Rate Limiting     │                  │
│                    │   CORS              │                  │
│                    └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │    MinIO     │
│    :5432     │    │    :6379     │    │   :9000      │
└──────────────┘    └──────────────┘    └──────────────┘
                              │
                              ▼
                    ┌──────────────┐
                    │ Elasticsearch│
                    │    :9200     │
                    └──────────────┘
```

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.x | Framework React con SSR/SSG |
| React | 18.x | Librería de interfaces |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Framework CSS utility-first |
| Lucide React | latest | Iconos |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| NestJS | 10.x | Framework Node.js escalable |
| Prisma | 5.x | ORM type-safe |
| TypeScript | 5.x | Tipado estático |
| JWT | - | Autenticación |
| class-validator | - | Validación de DTOs |

### Base de Datos & Cache
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| PostgreSQL | 15 | Base de datos relacional |
| Redis | 7.x | Cacheo y sesiones |
| Elasticsearch | 8.x | Búsqueda full-text |

### Almacenamiento
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| MinIO | latest | Almacenamiento de objetos (S3-compatible) |

### DevOps
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Docker | 24.x | Contenedores |
| Docker Compose | 2.x | Orquestación |
| Dokploy | latest | Despliegue en la nube |

---

## 📦 Requisitos Previos

### Para Desarrollo Local
- **Docker** >= 24.0 ([Instalar Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** v2+ ([Instalar Compose](https://docs.docker.com/compose/install/))
- **Node.js** >= 20.x ([Instalar Node](https://nodejs.org/))
- **pnpm** >= 8.x ([Instalar pnpm](https://pnpm.io/installation))
- **Git** ([Instalar Git](https://git-scm.com/))

### Para Despliegue (Dokploy)
- Servidor VPS (mínimo 2GB RAM, 2 vCPU)
- Docker instalado
- Dominio configurado (opcional)
- Certificado SSL (Let's Encrypt automático con Dokploy)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/brandall2021/diario-noticia.git
cd diario-noticia
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables
nano .env
```

### 3. Iniciar Servicios de Infraestructura

```bash
docker compose -f docker-compose.dev.yml up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- MinIO (puerto 9000/9001)
- Elasticsearch (puerto 9200)

### 4. Instalar Dependencias del API

```bash
cd apps/api
pnpm install
```

### 5. Ejecutar Migraciones

```bash
pnpm prisma migrate dev
```

### 6. Sembrar Datos Iniciales

```bash
pnpm prisma db seed
```

### 7. Iniciar API en Desarrollo

```bash
pnpm run start:dev
```

### 8. Instalar y Ejecutar Frontend

```bash
# En otra terminal
cd apps/web
pnpm install
pnpm run dev
```

### 9. Instalar y Ejecutar Admin

```bash
# En otra terminal
cd apps/admin
pnpm install
pnpm run dev
```

---

## ⚙️ Configuración del Entorno

### Variables de Entorno Principales

```bash
# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL="postgresql://diario_user:diario_password@localhost:5432/diario_noticia?schema=public"

# ============================================
# REDIS
# ============================================
REDIS_URL="redis://localhost:6379"

# ============================================
# JWT / AUTENTICACIÓN
# ============================================
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_EXPIRATION="7d"

# ============================================
# MINIO (Almacenamiento de Archivos)
# ============================================
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="diario-noticia"
MINIO_USE_SSL=false

# ============================================
# ELASTICSEARCH
# ============================================
ELASTICSEARCH_NODE="http://localhost:9200"

# ============================================
# OPENAI (Integración IA)
# ============================================
OPENAI_API_KEY="sk-tu-api-key-de-openai"

# ============================================
# FRONTEND URLS
# ============================================
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3002"
API_URL="http://localhost:3001"

# ============================================
# CORREO ELECTRÓNICO (Newsletter)
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-de-app"
SMTP_FROM="Diario Noticia <noticias@diario-noticia.com>"

# ============================================
# ANALYTICS
# ============================================
ANALYTICS_ENABLED=true
```

### Generar JWT_SECRET Seguro

```bash
openssl rand -base64 32
```

---

## 🐳 Docker

### Desarrollo

```bash
# Iniciar solo infraestructura (Postgres, Redis, MinIO, Elasticsearch)
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Detener
docker compose -f docker-compose.dev.yml down
```

### Producción

```bash
# Construir y ejecutar todo
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

### Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| API | 3001 | Backend NestJS |
| Web | 3000 | Portal público Next.js |
| Admin | 3002 | Panel administración Next.js |
| PostgreSQL | 5432 | Base de datos |
| Redis | 6379 | Cache |
| MinIO | 9000/9001 | Almacenamiento archivos |
| Elasticsearch | 9200 | Búsqueda |
| Nginx | 80/443 | Reverse proxy |

---

## 🌐 Despliegue con Dokploy

[Dokploy](https://dokploy.com/) es una plataforma de despliegue open-source similar a Vercel/Heroku pero self-hosted.

### 1. Instalar Dokploy en tu Servidor

```bash
# SSH a tu servidor
ssh root@tu-servidor

# Instalar Dokploy
curl -s https://dokploy.com/install.sh | bash
```

Accede a `https://tu-ip:3000` para configurar Dokploy.

### 2. Configurar Proyecto en Dokploy

#### Paso 1: Crear Proyecto
1. En Dokploy, ve a **Projects** → **Create Project**
2. Nombre: `diario-noticia`
3. Descripción: `Sistema de gestión de noticias digitales`

#### Paso 2: Configurar Aplicación API
1. Dentro del proyecto, crea una **Application**
2. Nombre: `api`
3. **Source**: Conecta tu repositorio GitHub
   - Repository: `brandall2021/diario-noticia`
   - Branch: `master`
   - Build Pack: **Dockerfile**
   - Dockerfile Path: `apps/api/Dockerfile`
4. **Ports**: `3001`
5. **Environment Variables**: Copia todas las variables del `.env` (ver [Configuración del Entorno](#configuración-del-entorno))

#### Paso 3: Configurar Aplicación Web
1. Crea otra **Application**
2. Nombre: `web`
3. **Source**: Mismo repositorio
   - Build Pack: **Dockerfile**
   - Dockerfile Path: `apps/web/Dockerfile`
4. **Ports**: `3000`
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
   ```

#### Paso 4: Configurar Aplicación Admin
1. Crea otra **Application**
2. Nombre: `admin`
3. **Source**: Mismo repositorio
   - Build Pack: **Dockerfile**
   - Dockerfile Path: `apps/admin/Dockerfile`
4. **Ports**: `3002`
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
   ```

### 3. Configurar Base de Datos

#### Opción A: PostgreSQL en Dokploy
1. Ve a **Databases** → **Create Database**
2. Tipo: **PostgreSQL**
3. Nombre: `diario-noticia-db`
4. Dokploy te dará las credenciales → úsalas en las variables de entorno de la API

#### Opción B: PostgreSQL Externo (RDS, Supabase, etc.)
- Simplemente usa la URL de conexión en `DATABASE_URL`

### 4. Configurar Redis

#### Opción A: Redis en Dokploy
1. Ve a **Databases** → **Create Database**
2. Tipo: **Redis**
3. Nombre: `diario-noticia-redis`
4. Usa la URL proporcionada en `REDIS_URL`

#### Opción B: Redis Externo (Upstash, Redis Cloud, etc.)
- Usa la URL externa en `REDIS_URL`

### 5. Configurar Dominio y SSL

1. En cada aplicación, ve a **Domains**
2. Agrega tu dominio:
   - API: `api.tu-dominio.com`
   - Web: `tu-dominio.com`
   - Admin: `admin.tu-dominio.com`
3. Dokploy configura **Let's Encrypt SSL** automáticamente

### 6. Variables de Entorno para Producción

```bash
# ============================================
# BASE DE DATOS (Dokploy te da estas credenciales)
# ============================================
DATABASE_URL="postgresql://usuario:password@dokploy-postgresql:5432/diario_noticia"

# ============================================
# REDIS (Dokploy te da estas credenciales)
# ============================================
REDIS_URL="redis://:password@dokploy-redis:6379"

# ============================================
# JWT
# ============================================
JWT_SECRET="genera-un-seguro-con-openssl-rand-base64-32"
JWT_EXPIRATION="7d"

# ============================================
# MINIO (Puedes usar S3 de AWS como alternativa)
# ============================================
MINIO_ENDPOINT="minio.tu-dominio.com"
MINIO_PORT=443
MINIO_ACCESS_KEY="tu-access-key"
MINIO_SECRET_KEY="tu-secret-key"
MINIO_BUCKET="diario-noticia"
MINIO_USE_SSL=true

# O usar AWS S3:
# AWS_S3_BUCKET="tu-bucket"
# AWS_ACCESS_KEY_ID="tu-key"
# AWS_SECRET_ACCESS_KEY="tu-secret"
# AWS_REGION="us-east-1"

# ============================================
# ELASTICSEARCH (Puedes usar Elastic Cloud)
# ============================================
ELASTICSEARCH_NODE="https://tu-cluster.es.us-east-1.aws.found.io"
ELASTICSEARCH_API_KEY="tu-api-key"

# O self-hosted en Dokploy

# ============================================
# OPENAI
# ============================================
OPENAI_API_KEY="sk-tu-api-key"

# ============================================
# URLs PÚBLICAS
# ============================================
FRONTEND_URL="https://tu-dominio.com"
ADMIN_URL="https://admin.tu-dominio.com"
API_URL="https://api.tu-dominio.com"

# ============================================
# SMTP (Gmail, SendGrid, Mailgun, etc.)
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-de-app"
SMTP_FROM="Diario Noticia <noticias@tu-dominio.com>"
```

### 7. Configurar GitHub Actions (CI/CD)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Dokploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy API
        uses: Dokploy/dokploy-deploy@v1
        with:
          token: ${{ secrets.DOKPLOY_TOKEN }}
          application: api
      
      - name: Deploy Web
        uses: Dokploy/dokploy-deploy@v1
        with:
          token: ${{ secrets.DOKPLOY_TOKEN }}
          application: web
      
      - name: Deploy Admin
        uses: Dokploy/dokploy-deploy@v1
        with:
          token: ${{ secrets.DOKPLOY_TOKEN }}
          application: admin
```

### 8. Migraciones en Producción

Configura un **Service** o **Cron Job** en Dokploy para ejecutar migraciones:

```bash
# Comando de migración
npx prisma migrate deploy
```

O ejecuta manualmente desde la terminal de Dokploy.

### Arquitectura en Dokploy

```
                    ┌─────────────────┐
                    │     Dokploy     │
                    │   (Dashboard)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   API App     │   │   Web App     │   │  Admin App    │
│  (NestJS)     │   │  (Next.js)    │   │  (Next.js)    │
│   Port 3001   │   │   Port 3000   │   │   Port 3002   │
└───────┬───────┘   └───────────────┘   └───────────────┘
        │
        ├──────────────────┬──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  PostgreSQL   │   │     Redis     │   │ Elasticsearch │
│   (Dokploy)   │   │   (Dokploy)   │   │  (External)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 📚 API Documentation

### Endpoints Principales

Una vez iniciado el API, accede a Swagger UI:
```
http://localhost:3001/docs
```

### Autenticación

```bash
# Login
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

# Registro
POST /api/auth/register
{
  "email": "nuevo@ejemplo.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

### Noticias

```bash
# Obtener todas las noticias
GET /api/articles?page=1&limit=10&status=PUBLISHED

# Obtener noticia por slug
GET /api/articles/:slug

# Crear noticia (requiere AUTH)
POST /api/articles
{
  "title": "Título de la noticia",
  "content": {...},
  "categoryId": "uuid",
  "status": "DRAFT"
}

# Actualizar noticia (requiere AUTH)
PUT /api/articles/:id

# Eliminar noticia (requiere AUTH)
DELETE /api/articles/:id
```

### Categorías

```bash
# Obtener categorías
GET /api/categories

# Crear categoría (requiere AUTH)
POST /api/categories
{
  "name": "Política",
  "slug": "politica",
  "description": "Noticias de política"
}
```

### Comentarios

```bash
# Obtener comentarios de un artículo
GET /api/articles/:articleId/comments

# Crear comentario (requiere AUTH)
POST /api/comments
{
  "articleId": "uuid",
  "content": "Excelente artículo"
}
```

### Búsqueda

```bash
# Búsqueda全文
GET /api/search?q=término+de+búsqueda&category=politica
```

---

## 📁 Estructura del Proyecto

```
diario-noticia/
├── apps/
│   ├── api/                          # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Schema de base de datos
│   │   │   └── seed.ts               # Datos iniciales
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Autenticación
│   │   │   │   ├── users/            # Usuarios
│   │   │   │   ├── articles/         # Noticias
│   │   │   │   ├── categories/       # Categorías
│   │   │   │   ├── tags/             # Etiquetas
│   │   │   │   ├── media/            # Multimedia
│   │   │   │   ├── comments/         # Comentarios
│   │   │   │   ├── newsletter/       # Newsletter
│   │   │   │   ├── subscriptions/    # Suscripciones
│   │   │   │   ├── seo/              # Sitemap, robots.txt
│   │   │   │   ├── rss/              # Feed RSS
│   │   │   │   ├── ai/               # Integración OpenAI
│   │   │   │   └── search/           # Búsqueda Elasticsearch
│   │   │   ├── common/
│   │   │   │   ├── guards/           # Auth guards
│   │   │   │   ├── decorators/       # Custom decorators
│   │   │   │   ├── filters/          # Exception filters
│   │   │   │   ├── interceptors/     # Logging, etc.
│   │   │   │   └── services/
│   │   │   │       └── cache.service.ts
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                          # Portal Público Next.js
│   │   ├── app/
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── articulo/
│   │   │   │   └── [slug]/page.tsx   # Detalle de artículo
│   │   │   ├── categoria/
│   │   │   │   └── [slug]/page.tsx   # Página de categoría
│   │   │   ├── buscar/page.tsx       # Búsqueda
│   │   │   ├── login/page.tsx        # Login
│   │   │   └── registro/page.tsx     # Registro
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── Comments.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── SEOHead.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # API client
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── structuredData.ts     # JSON-LD
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── admin/                        # Panel Admin Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout
│       │   │   ├── page.tsx          # Redirect a dashboard
│       │   │   ├── login/page.tsx    # Login admin
│       │   │   └── (admin)/
│       │   │       ├── layout.tsx    # Admin layout con sidebar
│       │   │       ├── dashboard/page.tsx
│       │   │       ├── articulos/
│       │   │       │   ├── page.tsx
│       │   │       │   ├── nuevo/page.tsx
│       │   │       │   └── [id]/editar/page.tsx
│       │   │       ├── categorias/
│       │   │       │   ├── page.tsx
│       │   │       │   ├── nueva/page.tsx
│       │   │       │   └── [id]/editar/page.tsx
│       │   │       ├── usuarios/page.tsx
│       │   │       ├── comentarios/page.tsx
│       │   │       ├── media/page.tsx
│       │   │       ├── newsletter/page.tsx
│       │   │       └── configuracion/page.tsx
│       │   ├── components/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── DataTable.tsx
│       │   │   ├── ArticleForm.tsx
│       │   │   ├── FileUpload.tsx
│       │   │   └── StatsCard.tsx
│       │   └── lib/
│       │       ├── api.ts
│       │       └── types.ts
│       ├── Dockerfile
│       ├── next.config.js
│       ├── package.json
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── postgres/
│       └── init.sql
│
├── docs/
│   └── superpowers/
│       └── plans/                    # Planes de implementación
│
├── docker-compose.yml                # Producción
├── docker-compose.dev.yml            # Desarrollo
├── .env.example                      # Variables de entorno ejemplo
├── .gitignore
└── README.md
```

---

## 🔧 Scripts Disponibles

### API (apps/api)

```bash
# Desarrollo
pnpm run start:dev          # Iniciar en desarrollo con hot-reload
pnpm run start:debug        # Iniciar con debug
pnpm run start:prod         # Iniciar en producción

# Build
pnpm run build              # Construir para producción

# Testing
pnpm run test               # Ejecutar tests
pnpm run test:watch         # Tests en watch mode
pnpm run test:cov           # Tests con cobertura
pnpm run test:e2e           # Tests end-to-end

# Linting
pnpm run lint               # Ejecutar ESLint
pnpm run lint:fix           # Auto-fix linting

# Database
pnpm prisma migrate dev     # Crear migración
pnpm prisma migrate deploy  # Aplicar migraciones
pnpm prisma db seed         # Sembrar datos
pnpm prisma studio          # Abrir Prisma Studio (UI)
pnpm prisma generate        # Generar cliente Prisma
```

### Web (apps/web)

```bash
pnpm run dev                # Iniciar en desarrollo
pnpm run build              # Construir para producción
pnpm run start              # Iniciar producción
pnpm run lint               # Ejecutar ESLint
```

### Admin (apps/admin)

```bash
pnpm run dev                # Iniciar en desarrollo (puerto 3002)
pnpm run build              # Construir para producción
pnpm run start              # Iniciar producción
pnpm run lint               # Ejecutar ESLint
```

### Docker

```bash
# Desarrollo
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml logs -f

# Producción
docker compose up -d
docker compose down
docker compose logs -f
docker compose ps
```

---

## 🐛 Troubleshooting

### Problema: No se conecta a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.dev.yml ps

# Verificar logs
docker compose -f docker-compose.dev.yml logs postgres

# Reiniciar
docker compose -f docker-compose.dev.yml restart postgres
```

### Problema: Migraciones fallan

```bash
# Resetear base de datos (ELIMINA TODOS LOS DATOS)
cd apps/api
pnpm prisma migrate reset

# Aplicar migraciones
pnpm prisma migrate dev

# Sembrar datos
pnpm prisma db seed
```

### Problema: MinIO no funciona

```bash
# Verificar MinIO
docker compose -f docker-compose.dev.yml logs minio

# Acceder a consola MinIO
# http://localhost:9001
# Usuario: minioadmin
# Password: minioadmin
```

### Problema: Puerto en uso

```bash
# Verificar qué usa el puerto
lsof -i :3001

# Matar el proceso
kill -9 <PID>
```

### Problema: Elasticsearch no inicia

```bash
# Verificar memoria del sistema (necesita ~1GB)
docker compose -f docker-compose.dev.yml logs elasticsearch

# Si es problema de memoria, ajusta en docker-compose.dev.yml:
# environment:
#   - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
```

### Problema: Dokploy no construye el Dockerfile

1. Verifica que el Dockerfile existe en la ruta correcta
2. Revisa los logs de build en Dokploy
3. Asegúrate de que el repositorio tiene los permisos correctos

### Problema: SSL no funciona en Dokploy

1. Verifica que el dominio apunta al servidor
2. Dokploy usa Let's Encrypt - espera unos minutos
3. Verifica en Dokploy → Domains → SSL Status

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add nueva feature'`)
4. Push a la branch (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

### Convenciones de Commit

```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
style:    Formato (no afecta el código)
refactor: Refactorización
test:     Tests
chore:    Mantenimiento
```

---

## 📄 Licencia

Propietario - Todos los derechos reservados

© 2024 Diario Noticia. No se permite la reproducción total o parcial sin autorización.

---

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/brandall2021/diario-noticia/issues)
- **Email:** soporte@diario-noticia.com

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework backend
- [Next.js](https://nextjs.org/) - Framework frontend
- [Prisma](https://www.prisma.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Dokploy](https://dokploy.com/) - Plataforma de despliegue
