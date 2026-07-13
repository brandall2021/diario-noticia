import { Clock, Edit, Trash2 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  status: 'publicado' | 'borrador' | 'programado';
  date: string;
  views: number;
}

const recentArticles: Article[] = [
  { id: 1, title: 'Los nuevos cambios en la economía nacional', status: 'publicado', date: '2026-07-12', views: 1243 },
  { id: 2, title: 'Entrevista exclusiva con el ministro de educación', status: 'publicado', date: '2026-07-11', views: 892 },
  { id: 3, title: 'Deportes: Resumen de la jornada semanal', status: 'borrador', date: '2026-07-10', views: 0 },
  { id: 4, title: 'Tecnología: Inteligencia Artificial en la educación', status: 'programado', date: '2026-07-14', views: 0 },
  { id: 5, title: 'Cultura: Festival de cine independiente', status: 'publicado', date: '2026-07-09', views: 567 },
];

const statusStyles: Record<string, string> = {
  publicado: 'bg-green-100 text-green-800',
  borrador: 'bg-yellow-100 text-yellow-800',
  programado: 'bg-blue-100 text-blue-800',
};

export default function RecentArticles() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Artículos recientes</h2>
        <a href="/articles" className="text-sm text-primary-600 hover:text-primary-700">
          Ver todos
        </a>
      </div>
      <div className="space-y-3">
        {recentArticles.map((article) => (
          <div
            key={article.id}
            className="flex items-center justify-between rounded-md border border-gray-100 p-3 hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {article.title}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.date}
                </span>
                {article.views > 0 && <span>{article.views} vistas</span>}
              </div>
            </div>
            <div className="ml-3 flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[article.status]}`}
              >
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
              <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <Edit className="h-4 w-4" />
              </button>
              <button className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
