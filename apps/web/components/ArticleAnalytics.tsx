'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface Props {
  slug: string;
  title: string;
  category?: string;
}

export default function ArticleAnalytics({ slug, title, category }: Props) {
  useEffect(() => {
    analytics.articleView(slug, title, category);
  }, [slug, title, category]);

  return null;
}
