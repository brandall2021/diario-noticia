import { generateSlug } from './slug.helper';

describe('generateSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(generateSlug('Mi Primera Noticia')).toBe('mi-primera-noticia');
  });

  it('strips accents', () => {
    expect(generateSlug('La inflación del país')).toBe('la-inflacion-del-pais');
  });

  it('removes special characters but keeps hyphens', () => {
    expect(generateSlug('Tecnología & IA: el futuro')).toBe('tecnologia-ia-el-futuro');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('  doble   espacio  ')).toBe('doble-espacio');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('-Hola mundo-')).toBe('hola-mundo');
  });

  it('returns empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });
});
