'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b py-2 text-sm text-gray-600">
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex items-center gap-4">
            <Link href="/suscripcion" className="hover:text-primary-600">Suscripciones</Link>
            <Link href="/login" className="hover:text-primary-600">Iniciar sesión</Link>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600 font-serif">Diario Noticia</h1>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar noticias..."
                className="w-64 rounded-full border px-4 py-2 pl-10 text-sm focus:border-primary-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
            >
              <User className="h-4 w-4" />
              <span>Mi cuenta</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="border-t py-3">
          <ul className="flex items-center gap-6 overflow-x-auto text-sm font-medium">
            <li><Link href="/categoria/politica" className="hover:text-primary-600">Política</Link></li>
            <li><Link href="/categoria/economia" className="hover:text-primary-600">Economía</Link></li>
            <li><Link href="/categoria/sociedad" className="hover:text-primary-600">Sociedad</Link></li>
            <li><Link href="/categoria/deportes" className="hover:text-primary-600">Deportes</Link></li>
            <li><Link href="/categoria/espectaculos" className="hover:text-primary-600">Espectáculos</Link></li>
            <li><Link href="/categoria/tecnologia" className="hover:text-primary-600">Tecnología</Link></li>
            <li><Link href="/categoria/salud" className="hover:text-primary-600">Salud</Link></li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white py-4">
          <div className="container-custom">
            <input
              type="text"
              placeholder="Buscar noticias..."
              className="w-full rounded-full border px-4 py-2 pl-10 text-sm mb-4"
            />
            <ul className="space-y-3">
              <li><Link href="/categoria/politica" className="block py-2">Política</Link></li>
              <li><Link href="/categoria/economia" className="block py-2">Economía</Link></li>
              <li><Link href="/categoria/sociedad" className="block py-2">Sociedad</Link></li>
              <li><Link href="/categoria/deportes" className="block py-2">Deportes</Link></li>
              <li><Link href="/categoria/espectaculos" className="block py-2">Espectáculos</Link></li>
              <li><Link href="/categoria/tecnologia" className="block py-2">Tecnología</Link></li>
              <li><Link href="/categoria/salud" className="block py-2">Salud</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
