import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-custom py-8 text-center">Cargando...</div>}>
      <SearchContent />
    </Suspense>
  );
}
