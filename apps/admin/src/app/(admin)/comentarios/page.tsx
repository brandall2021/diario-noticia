'use client';

import { useState, useEffect } from 'react';
import { Check, X, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment, CommentStatus } from '@/lib/types';

const statusTabs: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: CommentStatus.PENDING },
  { label: 'Aprobado', value: CommentStatus.APPROVED },
  { label: 'Rechazado', value: CommentStatus.REJECTED },
  { label: 'Spam', value: CommentStatus.SPAM },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SPAM: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  SPAM: 'Spam',
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(CommentStatus.PENDING);

  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await api.getComments({ status: activeTab || undefined, limit: 100 });
      setComments(response.data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (comment: Comment, status: CommentStatus) => {
    try {
      const updated = await api.updateCommentStatus(comment.id, status);
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, status: updated.status } : c)));
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error al actualizar el comentario');
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
      try {
        await api.deleteComment(comment.id);
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error al eliminar el comentario');
      }
    }
  };

  const getAuthorName = (comment: Comment) => {
    if (comment.author) return `${comment.author.firstName} ${comment.author.lastName}`;
    return comment.guestName || 'Anónimo';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moderación de comentarios</h1>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Cargando...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No se encontraron comentarios</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{getAuthorName(comment)}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[comment.status]}`}>
                      {statusLabels[comment.status]}
                    </span>
                  </div>
                  {comment.article && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      en: {comment.article.title}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-700">{comment.content}</p>
              <div className="flex gap-2">
                {comment.status !== CommentStatus.APPROVED && (
                  <button
                    onClick={() => handleStatusChange(comment, CommentStatus.APPROVED)}
                    className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    <Check className="h-3 w-3" />
                    Aprobar
                  </button>
                )}
                {comment.status !== CommentStatus.REJECTED && (
                  <button
                    onClick={() => handleStatusChange(comment, CommentStatus.REJECTED)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                    Rechazar
                  </button>
                )}
                {comment.status !== CommentStatus.SPAM && (
                  <button
                    onClick={() => handleStatusChange(comment, CommentStatus.SPAM)}
                    className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Spam
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment)}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
