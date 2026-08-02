'use client';

import { useEffect, useState } from 'react';
import { Save, Key, Bot } from 'lucide-react';
import { api } from '@/lib/api';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

export default function AiSettingsForm() {
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    openaiModel: 'gpt-4',
    contentModerationEnabled: true,
    autoGenerateMeta: true,
    autoSuggestTags: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getAiSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error loading AI settings:', err);
      setError('No se pudieron cargar los ajustes de IA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updateAiSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving AI settings:', err);
      setError('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const suggestions = await api.testAiConnection();
      setTestResult(`Conexión exitosa. Sugerencia: ${suggestions[0] || 'OK'}`);
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || 'No se pudo conectar'}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configuración de IA</h2>
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
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold">Configuración de API</h3>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
              placeholder="sk-..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Modelo</label>
            <select
              value={settings.openaiModel}
              onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
              className={inputClass}
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Bot className="h-4 w-4" />
            {isTesting ? 'Probando...' : 'Probar conexión'}
          </button>
          {testResult && (
            <p className={`text-sm ${testResult.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {testResult}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold">Funciones de IA</h3>
          </div>
          {(
            [
              ['contentModerationEnabled', 'Moderación automática', 'Analizar contenido con IA antes de publicar'],
              ['autoGenerateMeta', 'Generar meta descripciones', 'Crear automáticamente meta descripciones SEO'],
              ['autoSuggestTags', 'Sugerir etiquetas', 'Sugerir etiquetas relevantes para artículos'],
            ] as const
          ).map(([key, label, description]) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={Boolean(settings[key])}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-4 text-sm text-green-600">Cambios guardados</p>}
    </div>
  );
}
