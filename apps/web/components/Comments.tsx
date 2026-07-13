'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment } from '@/lib/types';

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      const data = await api.getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createComment({
        content: newComment,
        articleId,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
      });
      setNewComment('');
      setGuestName('');
      setGuestEmail('');
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse py-8 text-center text-gray-500">Cargando comentarios...</div>;
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <MessageSquare className="h-5 w-5" />
        Comentarios ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={4}
          required
          className="w-full rounded-lg border px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Tu correo (opcional)"
            className="rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Publicar comentario'}
        </button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No hay comentarios aún. Sé el primero en comentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium">
                    {comment.author
                      ? `${comment.author.firstName} ${comment.author.lastName}`
                      : comment.guestName || 'Anónimo'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-primary-600">
                  <ThumbsUp className="h-4 w-4" />
                  {comment._count?.likes || 0}
                </button>
                <button className="flex items-center gap-1 hover:text-red-600">
                  <Flag className="h-4 w-4" />
                  Reportar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
