/**
 * Metadados completos da Bíblia
 * Fonte: Estrutura canônica protestante (66 livros)
 */

export const BIBLE_META = {
  version: 'ARA',
  totalBooks: 66,
  totalChapters: 1189,
  books: [
    // ANTIGO TESTAMENTO (39 livros)
    { name: 'Gênesis', key: 'genesis', chapters: 50, testament: 'old' },
    { name: 'Êxodo', key: 'exodo', chapters: 40, testament: 'old' },
    { name: 'Levítico', key: 'levitico', chapters: 27, testament: 'old' },
    { name: 'Números', key: 'numeros', chapters: 36, testament: 'old' },
    { name: 'Deuteronômio', key: 'deuteronomio', chapters: 34, testament: 'old' },
    { name: 'Josué', key: 'josue', chapters: 24, testament: 'old' },
    { name: 'Juízes', key: 'juizes', chapters: 21, testament: 'old' },
    { name: 'Rute', key: 'rute', chapters: 4, testament: 'old' },
    { name: '1 Samuel', key: '1samuel', chapters: 31, testament: 'old' },
    { name: '2 Samuel', key: '2samuel', chapters: 24, testament: 'old' },
    { name: '1 Reis', key: '1reis', chapters: 22, testament: 'old' },
    { name: '2 Reis', key: '2reis', chapters: 25, testament: 'old' },
    { name: '1 Crônicas', key: '1cronicas', chapters: 29, testament: 'old' },
    { name: '2 Crônicas', key: '2cronicas', chapters: 36, testament: 'old' },
    { name: 'Esdras', key: 'esdras', chapters: 10, testament: 'old' },
    { name: 'Neemias', key: 'neemias', chapters: 13, testament: 'old' },
    { name: 'Ester', key: 'ester', chapters: 10, testament: 'old' },
    { name: 'Jó', key: 'jo', chapters: 42, testament: 'old' },
    { name: 'Salmos', key: 'salmos', chapters: 150, testament: 'old' },
    { name: 'Provérbios', key: 'proverbios', chapters: 31, testament: 'old' },
    { name: 'Eclesiastes', key: 'eclesiastes', chapters: 12, testament: 'old' },
    { name: 'Cantares', key: 'cantares', chapters: 8, testament: 'old' },
    { name: 'Isaías', key: 'isaias', chapters: 66, testament: 'old' },
    { name: 'Jeremias', key: 'jeremias', chapters: 52, testament: 'old' },
    { name: 'Lamentações', key: 'lamentacoes', chapters: 5, testament: 'old' },
    { name: 'Ezequiel', key: 'ezequiel', chapters: 48, testament: 'old' },
    { name: 'Daniel', key: 'daniel', chapters: 12, testament: 'old' },
    { name: 'Oséias', key: 'oseias', chapters: 14, testament: 'old' },
    { name: 'Joel', key: 'joel', chapters: 3, testament: 'old' },
    { name: 'Amós', key: 'amos', chapters: 9, testament: 'old' },
    { name: 'Obadias', key: 'obadias', chapters: 1, testament: 'old' },
    { name: 'Jonas', key: 'jonas', chapters: 4, testament: 'old' },
    { name: 'Miquéias', key: 'miqueias', chapters: 7, testament: 'old' },
    { name: 'Naum', key: 'naum', chapters: 3, testament: 'old' },
    { name: 'Habacuque', key: 'habacuque', chapters: 3, testament: 'old' },
    { name: 'Sofonias', key: 'sofonias', chapters: 3, testament: 'old' },
    { name: 'Ageu', key: 'ageu', chapters: 2, testament: 'old' },
    { name: 'Zacarias', key: 'zacarias', chapters: 14, testament: 'old' },
    { name: 'Malaquias', key: 'malaquias', chapters: 4, testament: 'old' },
    
    // NOVO TESTAMENTO (27 livros)
    { name: 'Mateus', key: 'mateus', chapters: 28, testament: 'new' },
    { name: 'Marcos', key: 'marcos', chapters: 16, testament: 'new' },
    { name: 'Lucas', key: 'lucas', chapters: 24, testament: 'new' },
    { name: 'João', key: 'joao', chapters: 21, testament: 'new' },
    { name: 'Atos', key: 'atos', chapters: 28, testament: 'new' },
    { name: 'Romanos', key: 'romanos', chapters: 16, testament: 'new' },
    { name: '1 Coríntios', key: '1corintios', chapters: 16, testament: 'new' },
    { name: '2 Coríntios', key: '2corintios', chapters: 13, testament: 'new' },
    { name: 'Gálatas', key: 'galatas', chapters: 6, testament: 'new' },
    { name: 'Efésios', key: 'efesios', chapters: 6, testament: 'new' },
    { name: 'Filipenses', key: 'filipenses', chapters: 4, testament: 'new' },
    { name: 'Colossenses', key: 'colossenses', chapters: 4, testament: 'new' },
    { name: '1 Tessalonicenses', key: '1tessalonicenses', chapters: 5, testament: 'new' },
    { name: '2 Tessalonicenses', key: '2tessalonicenses', chapters: 3, testament: 'new' },
    { name: '1 Timóteo', key: '1timoteo', chapters: 6, testament: 'new' },
    { name: '2 Timóteo', key: '2timoteo', chapters: 4, testament: 'new' },
    { name: 'Tito', key: 'tito', chapters: 3, testament: 'new' },
    { name: 'Filemom', key: 'filemom', chapters: 1, testament: 'new' },
    { name: 'Hebreus', key: 'hebreus', chapters: 13, testament: 'new' },
    { name: 'Tiago', key: 'tiago', chapters: 5, testament: 'new' },
    { name: '1 Pedro', key: '1pedro', chapters: 5, testament: 'new' },
    { name: '2 Pedro', key: '2pedro', chapters: 3, testament: 'new' },
    { name: '1 João', key: '1joao', chapters: 5, testament: 'new' },
    { name: '2 João', key: '2joao', chapters: 1, testament: 'new' },
    { name: '3 João', key: '3joao', chapters: 1, testament: 'new' },
    { name: 'Judas', key: 'judas', chapters: 1, testament: 'new' },
    { name: 'Apocalipse', key: 'apocalipse', chapters: 22, testament: 'new' }
  ]
};

/**
 * Mapeamento de chaves normalizadas para metadata do livro
 */
export const BOOK_MAP = BIBLE_META.books.reduce((map, book) => {
  map[book.key] = book;
  return map;
}, {});

/**
 * Busca livro por chave normalizada
 */
export function getBookByKey(key) {
  return BOOK_MAP[key] || null;
}

/**
 * Busca livro por nome
 */
export function getBookByName(name) {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  return BIBLE_META.books.find(b => b.key === normalized) || null;
}

/**
 * Valida se capítulo existe
 */
export function isValidChapter(bookKey, chapter) {
  const book = BOOK_MAP[bookKey];
  return book && chapter >= 1 && chapter <= book.chapters;
}

/**
 * Lista todos os capítulos de um livro
 */
export function getAllChapters(bookKey) {
  const book = BOOK_MAP[bookKey];
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}