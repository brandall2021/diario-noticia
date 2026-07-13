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
