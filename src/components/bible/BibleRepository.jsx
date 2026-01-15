/**
 * BibleRepository - Sistema cache-first APENAS LOCAL
 * 
 * Prioridades:
 * 1. Memória (LRU últimos 3 capítulos)
 * 2. IndexedDB persistente
 * 3. Fetch de /bible/{version}/{book}/{chapter}.json
 * 
 * NUNCA chama API externa ou LLM.
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

// Mapeamento de nomes para bookKeys
const BOOK_KEY_MAP = {
  'genesis': 'gn', 'exodo': 'ex', 'levitico': 'lv', 'numeros': 'nm', 'deuteronomio': 'dt',
  'josue': 'js', 'juizes': 'jz', 'rute': 'rt', '1samuel': '1sm', '2samuel': '2sm',
  '1reis': '1rs', '2reis': '2rs', '1cronicas': '1cr', '2cronicas': '2cr',
  'esdras': 'ed', 'neemias': 'ne', 'ester': 'et', 'jo': 'job', 'salmos': 'sl',
  'proverbios': 'pv', 'eclesiastes': 'ec', 'canticos': 'ct', 'isaias': 'is',
  'jeremias': 'jr', 'lamentacoes': 'lm', 'ezequiel': 'ez', 'daniel': 'dn',
  'oseias': 'os', 'joel': 'jl', 'amos': 'am', 'obadias': 'ob', 'jonas': 'jn',
  'miqueias': 'mq', 'naum': 'na', 'habacuque': 'hc', 'sofonias': 'sf',
  'ageu': 'ag', 'zacarias': 'zc', 'malaquias': 'ml', 'mateus': 'mt',
  'marcos': 'mc', 'lucas': 'lc', 'joao': 'jo', 'atos': 'at', 'romanos': 'rm',
  '1corintios': '1co', '2corintios': '2co', 'galatas': 'gl', 'efesios': 'ef',
  'filipenses': 'fp', 'colossenses': 'cl', '1tessalonicenses': '1ts',
  '2tessalonicenses': '2ts', '1timoteo': '1tm', '2timoteo': '2tm', 'tito': 'tt',
  'filemom': 'fm', 'hebreus': 'hb', 'tiago': 'tg', '1pedro': '1pe', '2pedro': '2pe',
  '1joao': '1jo', '2joao': '2jo', '3joao': '3jo', 'judas': 'jd', 'apocalipse': 'ap'
};

const VERSION_MAP = {
  'ARA': 'ra', 'ARC': 'arc', 'NVI': 'nvi', 'ACF': 'acf', 'KJV': 'kjv'
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
    console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=200 cacheHit=mem timeMs=${timeMs} verses=${data.verses.length} error=`);
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
      console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=200 cacheHit=persist timeMs=${timeMs} verses=${data.verses.length} error=`);
      return data;
    }
  } catch (e) {
    // Ignorar erros de localStorage
  }
  
  // 3. Arquivo local
  const url = `/bible/${version}/${bookKey}/${chapter}.json`;
  
  try {
    const response = await fetch(url);
    const timeMs = Math.round(performance.now() - t0);
    
    if (!response.ok) {
      console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=404 cacheHit=none timeMs=${timeMs} verses=0 error=DATASET_MISSING`);
      
      const error = new Error(`Capitulo nao disponivel no dataset: ${bookName} ${chapter}`);
      error.code = 'DATASET_MISSING';
      error.status = 404;
      error.bookKey = bookKey;
      error.chapter = chapter;
      throw error;
    }
    
    const data = await response.json();
    
    // Validar schema
    if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
      console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=500 cacheHit=none timeMs=${timeMs} verses=0 error=INVALID_FORMAT`);
      
      const error = new Error('Formato de capitulo invalido');
      error.code = 'INVALID_FORMAT';
      throw error;
    }
    
    // Salvar nos caches
    memoryCache.set(cacheKey, data);
    try {
      const storageKey = `bible_${version}_${bookKey}_${chapter}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      // Ignorar se localStorage cheio
    }
    
    const totalTime = Math.round(performance.now() - t0);
    console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=200 cacheHit=file timeMs=${totalTime} verses=${data.verses.length} error=`);
    
    return data;
  } catch (error) {
    if (error.code === 'DATASET_MISSING' || error.code === 'INVALID_FORMAT') {
      throw error;
    }
    
    const timeMs = Math.round(performance.now() - t0);
    console.log(`BIBLELOG source=dataset bookLabel=${bookName} bookKey=${bookKey} chapter=${chapter} versionLabel=${versionCode} versionCode=${version} status=ERROR cacheHit=none timeMs=${timeMs} verses=0 error=FETCH_FAILED`);
    
    const err = new Error('Erro ao carregar capitulo do dataset');
    err.code = 'FETCH_FAILED';
    throw err;
  }
}

/**
 * Carrega meta.json
 */
export async function loadMeta() {
  try {
    const response = await fetch('/bible/meta.json');
    if (!response.ok) {
      return { versions: [], books: [], totalChaptersExpected: 1189 };
    }
    return await response.json();
  } catch (error) {
    return { versions: [], books: [], totalChaptersExpected: 1189 };
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