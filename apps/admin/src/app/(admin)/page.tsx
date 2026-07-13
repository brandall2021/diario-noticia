import { FileText, Users, MessageSquare, Eye } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import RecentArticles from '@/components/RecentArticles';

export default function DashboardPage() {
  const stats = {
    articles: 156,
    users: 2340,
    comments: 892,
    views: 45678,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Artículos"
          value={stats.articles}
          change={12}
          icon={FileText}
          color="bg-primary-600"
        />
        <StatsCard
          title="Usuarios"
          value={stats.users}
          change={8}
          icon={Users}
          color="bg-green-600"
        />
        <StatsCard
          title="Comentarios"
          value={stats.comments}
          change={-3}
          icon={MessageSquare}
          color="bg-yellow-600"
        />
        <StatsCard
          title="Vistas"
          value={stats.views.toLocaleString()}
          change={23}
          icon={Eye}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentArticles />

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Actividad reciente</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            Gráfico de actividad (próximamente)
          </div>
        </div>
      </div>
    </div>
  );
}
