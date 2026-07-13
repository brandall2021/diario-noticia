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
    const articles = await api.getLatestArticles(8);
    return articles;
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
