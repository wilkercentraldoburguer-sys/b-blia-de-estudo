/**
 * Normaliza o nome do livro para formato de chave
 * Remove acentos, transforma em minúsculo, remove espaços
 */
export function normalizeBookKey(bookName) {
  if (!bookName) return '';
  
  return bookName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '') // Remove espaços
    .trim();
}

/**
 * Mapeia nomes de livros para suas chaves normalizadas
 */
export const BOOK_KEY_MAP = {
  'joão': 'joao',
  'gênesis': 'genesis',
  '1 joão': '1joao',
  '2 joão': '2joao',
  '3 joão': '3joao',
  '1 samuel': '1samuel',
  '2 samuel': '2samuel',
  '1 reis': '1reis',
  '2 reis': '2reis',
  '1 crônicas': '1cronicas',
  '2 crônicas': '2cronicas',
  '1 coríntios': '1corintios',
  '2 coríntios': '2corintios',
  '1 tessalonicenses': '1tessalonicenses',
  '2 tessalonicenses': '2tessalonicenses',
  '1 timóteo': '1timoteo',
  '2 timóteo': '2timoteo',
  '1 pedro': '1pedro',
  '2 pedro': '2pedro'
};

/**
 * Obtém a chave normalizada do livro
 */
export function getBookKey(bookName) {
  const normalized = normalizeBookKey(bookName);
  return BOOK_KEY_MAP[normalized] || normalized;
}