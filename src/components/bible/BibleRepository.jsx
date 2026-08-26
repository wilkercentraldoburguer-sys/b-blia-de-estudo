import { getBasePath } from './DatasetPathDetector';
import { BOOK_ABBREV_MAP } from './bookCodes';

/**
 * BibleRepository - Sistema cache-first APENAS LOCAL
 *
 * Prioridades:
 * 1. Memória (LRU últimos 3 capítulos)
 * 2. IndexedDB persistente
 * 3. Fetch de /bible/{version}/{book}.json (1 arquivo por LIVRO, com todos
 *    os capítulos dentro - não 1 arquivo por capítulo)
 *
 * NUNCA chama API externa ou LLM.
 *
 * NOTA (25/08/2026): o dataset já foi 1 arquivo por capítulo (~1190
 * arquivos), mas o GitHub recusa upload pelo site em lotes de mais de 100
 * arquivos de uma vez, o que travava a publicação. Agora é 1 arquivo por
 * livro (66 arquivos no total) - cabe num upload só, e o navegador ainda
 * baixa cada livro inteiro de uma vez só na primeira leitura dele (os
 * outros capítulos do mesmo livro saem do cache HTTP/Service Worker sem
 * nova ida à rede).
 */

// Cache LRU em memória
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

const memoryCache = new LRUCache(3);

// Mapeamento de nomes para bookKeys (fonte única em ./bookCodes.jsx)
const BOOK_KEY_MAP = BOOK_ABBREV_MAP;

const VERSION_MAP = {
  'AA': 'aa', 'KJV': 'kjv',
  // As versões abaixo não têm dataset local real (ver bibleVersions.jsx) -
  // mantidas só para não quebrar a normalização de uma sigla antiga que
  // ainda apareça em algum cache velho no localStorage do usuário.
  'ARA': 'ra', 'ARC': 'arc', 'NVI': 'nvi', 'ACF': 'acf'
};

function normalizeBookName(name) {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

function getBookKey(bookName) {
  const normalized = normalizeBookName(bookName);
  return BOOK_KEY_MAP[normalized] || normalized;
}

function getVersionCode(version) {
  return VERSION_MAP[version] || version.toLowerCase();
}

/**
 * Carrega capítulo (cache-first)
 */
export async function getChapter(versionCode, bookName, chapter) {
  const version = getVersionCode(versionCode);
  const bookKey = getBookKey(bookName);
  const cacheKey = `${version}|${bookKey}|${chapter}`;
  
  const t0 = performance.now();
  
  // 1. Memória
  if (memoryCache.has(cacheKey)) {
    const data = memoryCache.get(cacheKey);
    const timeMs = Math.round(performance.now() - t0);
    const bytes = JSON.stringify(data).length;
    console.log(`BIBLELOG source=dataset url=- status=200 error=NONE timeMs=${timeMs} bytes=${bytes} cacheHit=mem`);
    return data;
  }
  
  // 2. LocalStorage persistente
  try {
    const storageKey = `bible_${version}_${bookKey}_${chapter}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const data = JSON.parse(cached);
      memoryCache.set(cacheKey, data);
      const timeMs = Math.round(performance.now() - t0);
      console.log(`BIBLELOG source=dataset url=- status=200 error=NONE timeMs=${timeMs} bytes=${cached.length} cacheHit=persist`);
      return data;
    }
  } catch (e) {
    // Ignorar erros de localStorage
  }
  
  // 3. Arquivo local (1 arquivo por livro, com todos os capítulos dentro)
  const basePath = getBasePath();
  const url = `${basePath}/${version}/${bookKey}.json`;

  try {
    const response = await fetch(url);
    const timeMs = Math.round(performance.now() - t0);
    const bytes = response.ok ? (await response.clone().text()).length : 0;

    if (!response.ok) {
      console.log(`BIBLELOG source=dataset url=${url} status=${response.status} error=DATASET_MISSING timeMs=${timeMs} bytes=${bytes} cacheHit=none`);

      const error = new Error(`Livro nao disponivel no dataset: ${bookName}`);
      error.code = 'DATASET_MISSING';
      error.status = response.status;
      error.bookKey = bookKey;
      error.chapter = chapter;
      throw error;
    }

    const bookData = await response.json();

    // Validar schema (arquivo do livro inteiro: { version, book, chapters: [{chapter, verses}, ...] })
    if (!bookData.chapters || !Array.isArray(bookData.chapters) || bookData.chapters.length === 0) {
      console.log(`BIBLELOG source=dataset url=${url} status=500 error=SCHEMA_INVALID timeMs=${timeMs} bytes=${bytes} cacheHit=none`);

      const error = new Error('Formato de livro invalido');
      error.code = 'INVALID_FORMAT';
      throw error;
    }

    const chapterEntry = bookData.chapters.find(c => c.chapter === chapter);

    if (!chapterEntry || !Array.isArray(chapterEntry.verses) || chapterEntry.verses.length === 0) {
      console.log(`BIBLELOG source=dataset url=${url} status=404 error=CHAPTER_MISSING timeMs=${timeMs} bytes=${bytes} cacheHit=none`);

      const error = new Error(`Capitulo nao disponivel no dataset: ${bookName} ${chapter}`);
      error.code = 'DATASET_MISSING';
      error.bookKey = bookKey;
      error.chapter = chapter;
      throw error;
    }

    const data = {
      version: bookData.version || versionCode,
      book: bookData.book || bookKey,
      chapter,
      verses: chapterEntry.verses
    };

    // Salvar nos caches (só o capítulo pedido - os outros capítulos do
    // mesmo livro continuam disponíveis via cache HTTP/Service Worker do
    // arquivo do livro inteiro, sem precisar duplicar tudo aqui).
    memoryCache.set(cacheKey, data);
    try {
      const storageKey = `bible_${version}_${bookKey}_${chapter}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      // Ignorar se localStorage cheio
    }

    const totalTime = Math.round(performance.now() - t0);
    const dataBytes = JSON.stringify(data).length;
    console.log(`BIBLELOG source=dataset url=${url} status=200 error=NONE timeMs=${totalTime} bytes=${dataBytes} cacheHit=file`);

    return data;
  } catch (error) {
    if (error.code === 'DATASET_MISSING' || error.code === 'INVALID_FORMAT') {
      throw error;
    }

    // Erro de rede/fetch (rota não servida)
    const timeMs = Math.round(performance.now() - t0);
    console.log(`BIBLELOG source=dataset url=${url} status=ERROR error=DATASET_ROUTE_NOT_SERVED timeMs=${timeMs} bytes=0 cacheHit=none`);

    const err = new Error('Rota de dataset nao esta sendo servida. Use a funcao de auto-deteccao em Configuracoes.');
    err.code = 'DATASET_ROUTE_NOT_SERVED';
    throw err;
  }
}

/**
 * Carrega meta.json
 */
export async function loadMeta() {
  const basePath = getBasePath();
  try {
    const response = await fetch(`${basePath}/meta.json`);
    if (!response.ok) {
      return { versions: [], books: [], totalChaptersExpected: 1189 };
    }
    return await response.json();
  } catch (error) {
    return { versions: [], books: [], totalChaptersExpected: 1189 };
  }
}

/**
 * Salva capítulo no cache (para importação)
 */
export function saveChapterToCache(versionCode, bookName, chapter, data) {
  const version = getVersionCode(versionCode);
  const bookKey = getBookKey(bookName);
  
  memoryCache.set(`${version}|${bookKey}|${chapter}`, data);
  
  try {
    const storageKey = `bible_${version}_${bookKey}_${chapter}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Limpa cache
 */
export function clearCache() {
  memoryCache.clear();
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('bible_')) {
      localStorage.removeItem(key);
    }
  });
}