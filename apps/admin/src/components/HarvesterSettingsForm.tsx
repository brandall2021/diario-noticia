'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  RefreshCw,
  Save,
  Eye,
  ExternalLink,
  Rss,
} from 'lucide-react';
import { api } from '@/lib/api';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

interface Source {
  id: string;
  name: string;
  feedUrl: string;
  websiteUrl?: string | null;
  categoryId?: string | null;
  fetchIntervalMinutes: number;
  maxItemsPerRun: number;
  autoPublish: boolean;
  enabled: boolean;
  lastFetchedAt?: string | null;
  lastItemAt?: string | null;
  category?: { id: string; name: string; slug: string } | null;
}

interface Log {
  id: string;
  sourceName: string;
  status: string;
  itemsFound: number;
  itemsImported: number;
  itemsSkipped: number;
  error?: string | null;
  startedAt: string;
}

const emptyForm = {
  name: '',
  feedUrl: '',
  websiteUrl: '',
  categoryId: '',
  fetchIntervalMinutes: 60,
  maxItemsPerRun: 5,
  autoPublish: false,
};

export default function HarvesterSettingsForm() {
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [runningSourceId, setRunningSourceId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    try {
      const [src, cat, lg] = await Promise.all([
        api.getHarvestSources(),
        api.getCategories(),
        api.getHarvestLogs(10),
      ]);
      setSources(src || []);
      setCategories((cat || []).map((c: any) => ({ id: c.id, name: c.name })));
      setLogs(lg || []);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las fuentes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveSource = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (!form.name.trim() || !form.feedUrl.trim()) {
        throw new Error('Nombre y URL del feed son obligatorios');
      }
      await api.createHarvestSource({
        ...form,
        categoryId: form.categoryId || null,
        websiteUrl: form.websiteUrl || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la fuente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (source: Source, field: 'enabled' | 'autoPublish') => {
    try {
      await api.updateHarvestSource(source.id, { [field]: !source[field] });
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, [field]: !s[field] } : s)),
      );
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la fuente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta fuente?')) return;
    try {
      await api.deleteHarvestSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la fuente');
    }
  };

  const handleRun = async (id: string) => {
    setRunningSourceId(id);
    setError(null);
    try {
      const result = await api.runHarvesterSource(id);
      alert(
        `Cosecha completada.\nEncontrados: ${result.itemsFound}\nImportados: ${result.itemsImported}\nOmitidos: ${result.itemsSkipped}`,
      );
      await load();
    } catch (err: any) {
      setError(err?.message || 'Error al cosechar');
    } finally {
      setRunningSourceId(null);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    setError(null);
    try {
      const result = await api.runHarvesterAll();
      alert(`Cosecha completada en ${result.sourcesProcessed} fuentes`);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Error al cosechar');
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleTest = async (source: Source) => {
    try {
      const result = await api.testHarvesterSource(source.id);
      if (result.ok) {
        const sample = (result.sample || [])
          .map((i: any) => `• ${i.title}`)
          .join('\n');
        alert(
          `Feed OK: ${result.feedTitle}\nArtículos disponibles: ${result.totalItems}\n\n${sample}`,
        );
      } else {
        alert(`Error al leer el feed: ${result.error}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al probar el feed');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Cosechador de noticias</h2>
            <p className="mt-1 text-sm text-gray-500">
              Agrega feeds RSS/Atom de fuentes externas. Los artículos se cosechan, se procesan
              con IA (si configuraste la API key) y quedan en revisión.
            </p>
          </div>
          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isRunningAll ? 'Cosechando...' : 'Cosechar todas ahora'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {sources.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              <Rss className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              No hay fuentes configuradas. Agregá un feed RSS para empezar.
            </div>
          )}

          {sources.map((source) => (
            <div key={source.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{source.name}</h3>
                    {source.category && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {source.category.name}
                      </span>
                    )}
                    {source.autoPublish && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Auto-publish
                      </span>
                    )}
                  </div>
                  <a
                    href={source.feedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500 hover:text-primary-600"
                  >
                    {source.feedUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-1 text-xs text-gray-400">
                    Cada {source.fetchIntervalMinutes} min · máx {source.maxItemsPerRun} por
                    cosecha
                    {source.lastFetchedAt
                      ? ` · último fetch: ${new Date(source.lastFetchedAt).toLocaleString()}`
                      : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleTest(source)}
                    title="Probar feed"
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRun(source.id)}
                    disabled={runningSourceId === source.id}
                    title="Cosechar ahora"
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${runningSourceId === source.id ? 'animate-spin' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    title="Eliminar"
                    className="rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={() => handleToggle(source, 'enabled')}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  Activa
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={source.autoPublish}
                    onChange={() => handleToggle(source, 'autoPublish')}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  Publicar automáticamente
                </label>
              </div>
            </div>
          ))}
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Agregar fuente
          </button>
        )}

        {showForm && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Nueva fuente</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: BBC Mundo"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URL del feed RSS/Atom
                </label>
                <input
                  type="text"
                  value={form.feedUrl}
                  onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
                  placeholder="https://feeds.bbci.co.uk/mundo/rss.xml"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Sitio web (opcional)
                </label>
                <input
                  type="text"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://www.bbc.com/mundo"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Categoría por defecto
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Automática (según IA)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Intervalo de cosecha (min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={form.fetchIntervalMinutes}
                  onChange={(e) =>
                    setForm({ ...form, fetchIntervalMinutes: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Máx. artículos por cosecha
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxItemsPerRun}
                  onChange={(e) => setForm({ ...form, maxItemsPerRun: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSaveSource}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar fuente'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Últimas cosechas</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay cosechas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="py-2 pr-4">Fuente</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4 text-right">Encontrados</th>
                  <th className="py-2 pr-4 text-right">Importados</th>
                  <th className="py-2 pr-4 text-right">Omitidos</th>
                  <th className="py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-800">{log.sourceName}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          log.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-600">{log.itemsFound}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">{log.itemsImported}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">{log.itemsSkipped}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
