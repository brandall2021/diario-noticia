import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white font-serif">Diario Noticia</h3>
            <p className="mt-4 text-sm">
              Tu fuente de noticias confiable. Información veraz, actual y balanceada las 24 horas.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Secciones</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categoria/politica" className="hover:text-white">Política</Link></li>
              <li><Link href="/categoria/economia" className="hover:text-white">Economía</Link></li>
              <li><Link href="/categoria/sociedad" className="hover:text-white">Sociedad</Link></li>
              <li><Link href="/categoria/deportes" className="hover:text-white">Deportes</Link></li>
              <li><Link href="/categoria/espectaculos" className="hover:text-white">Espectáculos</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/quienes-somos" className="hover:text-white">Quiénes somos</Link></li>
              <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
              <li><Link href="/trabaja-con-nosotros" className="hover:text-white">Trabaja con nosotros</Link></li>
              <li><Link href="/publicidad" className="hover:text-white">Publicidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@dianoticia.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Ciudad, País</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
