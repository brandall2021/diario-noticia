import { PrismaClient, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions
  const permissions = [
    // Users module
    { module: 'users', action: 'create' },
    { module: 'users', action: 'read' },
    { module: 'users', action: 'update' },
    { module: 'users', action: 'delete' },
    // Articles module
    { module: 'articles', action: 'create' },
    { module: 'articles', action: 'read' },
    { module: 'articles', action: 'update' },
    { module: 'articles', action: 'delete' },
    { module: 'articles', action: 'publish' },
    { module: 'articles', action: 'approve' },
    // Categories module
    { module: 'categories', action: 'create' },
    { module: 'categories', action: 'read' },
    { module: 'categories', action: 'update' },
    { module: 'categories', action: 'delete' },
    // Media module
    { module: 'media', action: 'create' },
    { module: 'media', action: 'read' },
    { module: 'media', action: 'update' },
    { module: 'media', action: 'delete' },
    // Comments module
    { module: 'comments', action: 'read' },
    { module: 'comments', action: 'moderate' },
    { module: 'comments', action: 'delete' },
    // Advertising module
    { module: 'advertising', action: 'create' },
    { module: 'advertising', action: 'read' },
    { module: 'advertising', action: 'update' },
    { module: 'advertising', action: 'delete' },
    // Settings module
    { module: 'settings', action: 'read' },
    { module: 'settings', action: 'update' },
    // Analytics module
    { module: 'analytics', action: 'read' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((p) =>
      prisma.permission.upsert({
        where: { module_action: p },
        update: {},
        create: p,
      }),
    ),
  );

  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create roles with permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: {
        connect: createdPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const editorGeneralRole = await prisma.role.upsert({
    where: { name: 'EDITOR_GENERAL' },
    update: {},
    create: {
      name: 'EDITOR_GENERAL',
      description: 'General Editor - can approve and publish',
      permissions: {
        connect: createdPermissions
          .filter((p) => !['settings', 'users'].includes(p.module))
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Editor - can edit and approve articles',
      permissions: {
        connect: createdPermissions
          .filter((p) =>
            ['articles', 'categories', 'media', 'comments', 'analytics'].includes(p.module) &&
            !['delete', 'settings'].includes(p.action),
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const journalistRole = await prisma.role.upsert({
    where: { name: 'JOURNALIST' },
    update: {},
    create: {
      name: 'JOURNALIST',
      description: 'Journalist - can create and edit own articles',
      permissions: {
        connect: createdPermissions
          .filter((p) =>
            p.module === 'articles' &&
            ['create', 'read', 'update'].includes(p.action),
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const writerRole = await prisma.role.upsert({
    where: { name: 'WRITER' },
    update: {},
    create: {
      name: 'WRITER',
      description: 'Writer - can create articles',
      permissions: {
        connect: createdPermissions
          .filter(
            (p) =>
              (p.module === 'articles' && ['create', 'read'].includes(p.action)) ||
              (p.module === 'media' && p.action === 'read'),
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const subscriberRole = await prisma.role.upsert({
    where: { name: 'SUBSCRIBER' },
    update: {},
    create: {
      name: 'SUBSCRIBER',
      description: 'Subscriber - registered user with premium access',
      permissions: {
        connect: createdPermissions
          .filter(
            (p) =>
              p.module === 'articles' && p.action === 'read',
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const readerRole = await prisma.role.upsert({
    where: { name: 'READER' },
    update: {},
    create: {
      name: 'READER',
      description: 'Reader - basic visitor role',
      permissions: {
        connect: createdPermissions
          .filter(
            (p) =>
              p.module === 'articles' && p.action === 'read',
          )
          .map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Created roles');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@diario-noticia.com' },
    update: {},
    create: {
      email: 'admin@diario-noticia.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Created admin user');

  // Create categories
  const categories = [
    { name: 'Política', slug: 'politica', color: '#1E40AF', icon: 'government' },
    { name: 'Economía', slug: 'economia', color: '#059669', icon: 'chart' },
    { name: 'Deportes', slug: 'deportes', color: '#DC2626', icon: 'trophy' },
    { name: 'Sociedad', slug: 'sociedad', color: '#7C3AED', icon: 'people' },
    { name: 'Cultura', slug: 'cultura', color: '#DB2777', icon: 'palette' },
    { name: 'Tecnología', slug: 'tecnologia', color: '#2563EB', icon: 'cpu' },
    { name: 'Ciencia', slug: 'ciencia', color: '#0891B2', icon: 'science' },
    { name: 'Salud', slug: 'salud', color: '#16A34A', icon: 'heart' },
    { name: 'Internacional', slug: 'internacional', color: '#9333EA', icon: 'globe' },
    { name: 'Espectáculos', slug: 'espectaculos', color: '#F59E0B', icon: 'star' },
  ];

  const createdCategories = await Promise.all(
    categories.map((c, index) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { ...c, sortOrder: index },
      }),
    ),
  );

  console.log('✅ Created categories');

  // Create sample article
  await prisma.article.upsert({
    where: { slug: 'bienvenido-al-diario-noticia' },
    update: {},
    create: {
      title: 'Bienvenido al Diario Noticia',
      slug: 'bienvenido-al-diario-noticia',
      subtitle: 'Tu fuente confiable de noticias',
      bajada: 'Este es el primer artículo del sistema Diario Noticia.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Bienvenido a Diario Noticia, un sistema de gestión de noticias digital construido con las últimas tecnologías.',
              },
            ],
          },
        ],
      },
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: createdCategories[0].id,
    },
  });

  console.log('✅ Created sample article');

  // Create system configs
  const configs = [
    { key: 'site.name', value: 'Diario Noticia', group: 'general' },
    { key: 'site.description', value: 'Tu fuente confiable de noticias', group: 'general' },
    { key: 'site.url', value: 'http://localhost:3000', group: 'general' },
    { key: 'comments.moderation', value: true, group: 'comments' },
    { key: 'articles.perPage', value: 12, group: 'pagination' },
  ];

  await Promise.all(
    configs.map((c) =>
      prisma.systemConfig.upsert({
        where: { key: c.key },
        update: { value: c.value },
        create: c,
      }),
    ),
  );

  console.log('✅ Created system configs');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
