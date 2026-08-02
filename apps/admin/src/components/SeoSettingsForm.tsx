'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

export default function SeoSettingsForm() {
  const [settings, setSettings] = useState({
    siteTitle: 'Diario Noticia',
    siteDescription: 'Tu fuente de noticias confiable',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    robotsTxt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSeoSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error loading SEO settings:', err);
      setError('No se pudieron cargar los ajustes de SEO');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updateSeoSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving SEO settings:', err);
      setError('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configuración SEO</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Título del sitio</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descripción del sitio</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Imagen Open Graph</label>
            <input
              type="url"
              value={settings.ogImage}
              onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Twitter / X handle</label>
            <input
              type="text"
              value={settings.twitterHandle}
              onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
              placeholder="@diarionoticia"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Google Analytics ID</label>
            <input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">robots.txt</label>
            <textarea
              value={settings.robotsTxt}
              onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
              rows={3}
              className={`${inputClass} font-mono text-xs`}
              placeholder="User-agent: *"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-600">Cambios guardados</p>}
    </div>
  );
}
