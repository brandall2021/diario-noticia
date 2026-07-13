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
