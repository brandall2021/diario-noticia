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
      const data = await api.getMedia();
      setMedia(Array.isArray(data) ? data : []);
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
            <div key={item.id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm">
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
