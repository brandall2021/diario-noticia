# Diario Noticia - Sistema de Gestión de Noticias Digitales

Sistema web moderno, responsive y escalable para la gestión y publicación de noticias digitales.

## Requisitos Previos

- Docker >= 24.0
- Docker Compose v2+
- Node.js >= 20.x (para desarrollo local)
- pnpm >= 8.x

## Inicio Rápido

### Desarrollo

```bash
# Clonar repositorio
git clone <repository-url>
cd diario-noticia

# Iniciar servicios de infraestructura
docker compose -f docker-compose.dev.yml up -d

# Instalar dependencias del API
cd apps/api
pnpm install

# Ejecutar migraciones
pnpm prisma migrate dev

# Sembrar datos iniciales
pnpm prisma db seed

# Iniciar API en desarrollo
pnpm run start:dev
```

### Producción

```bash
# Construir y ejecutar todo
docker compose up -d --build

# Ejecutar migraciones
docker compose exec api pnpm prisma migrate deploy
```

## Servicios

| Servicio        | Puerto |
|-----------------|--------|
| API             | 3001   |
| PostgreSQL      | 5432   |
| Redis           | 6379   |
| MinIO Console   | 9001   |
| Elasticsearch   | 9200   |
| Nginx           | 80/443 |

## Documentación API

Una vez iniciado, acceder a Swagger: http://localhost:3001/docs

## Licencia

Propietario - Todos los derechos reservados
