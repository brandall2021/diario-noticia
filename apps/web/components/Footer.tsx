export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="container-custom py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
