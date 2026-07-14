type EventProperties = Record<string, string | number | boolean>;

class Analytics {
  private enabled: boolean;
  private endpoint: string;

  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    this.endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
  }

  async track(event: string, properties?: EventProperties) {
    if (!this.enabled) return;

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  pageView(path: string, title?: string) {
    this.track('page_view', { path, ...(title !== undefined && { title }) });
  }

  articleView(slug: string, title: string, category?: string) {
    this.track('article_view', { slug, title, ...(category !== undefined && { category }) });
  }

  search(query: string, resultsCount: number) {
    this.track('search', { query, resultsCount });
  }

  newsletterSubscribe(email: string) {
    this.track('newsletter_subscribe', { email });
  }

  commentSubmit(articleId: string) {
    this.track('comment_submit', { articleId });
  }

  share(method: string, url: string) {
    this.track('share', { method, url });
  }
}

export const analytics = new Analytics();
