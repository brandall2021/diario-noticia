'use client';

import { ReactNode } from 'react';
import { Edit, Trash2 } from 'lucide-react';
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
                    : String((item as any)[col.key] ?? '')}
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
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + ((onEdit || onDelete || editPath) ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                No se encontraron registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
