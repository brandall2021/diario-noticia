'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.subscribeNewsletter(email);
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Error al suscribirse. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold text-green-800">¡Suscrito!</h3>
        <p className="mt-2 text-sm text-green-700">
          Gracias por suscribirte a nuestro newsletter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-primary-50 p-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary-600" />
        <div>
          <h3 className="text-lg font-semibold">Suscríbete a nuestro newsletter</h3>
          <p className="text-sm text-gray-600">Recibe las noticias más importantes en tu correo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          required
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Suscribiendo...' : 'Suscribir'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
