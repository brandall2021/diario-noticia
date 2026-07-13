import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-700">
          Diario Noticia
        </Link>
        <nav className="flex gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">Inicio</Link>
          <Link href="/noticias" className="hover:text-primary-600">Noticias</Link>
          <Link href="/opinion" className="hover:text-primary-600">Opinión</Link>
        </nav>
      </div>
    </header>
  );
}
