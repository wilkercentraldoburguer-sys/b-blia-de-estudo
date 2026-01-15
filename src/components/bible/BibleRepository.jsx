/**
 * BibleRepository - Sistema cache-first para carregar capítulos
 * 
 * Prioridades:
 * 1. Memória (LRU últimos 3 capítulos)
 * 2. LocalStorage persistente (cache offline)
 * 3. Assets locais do projeto (/bible/{version}/{book}/{chapter}.json)
 * 
 * NUNCA chama API externa ou LLM.
 */

const MEMORY_CACHE_SIZE = 3;
const STORAGE_PREFIX = 'bible_cache';

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
}

const memoryCache = new LRUCache(MEMORY_CACHE_SIZE);

/**
 * Carrega metadata da Bíblia
 */
export async function loadBibleMeta() {
  try {
    const response = await fetch('/bible/meta.json');
    if (!response.ok) {
      throw new Error('Meta file not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load bible meta:', error);
    return { versions: [], books: [] };
  }
}

/**
 * Converte nome de livro para bookKey
 */
export function getBookKeyFromName(bookName) {
  const normalized = bookName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  
  const keyMap = {
    'joao': 'jo',
    'genesis': 'gn',
    'exodo': 'ex',
    'levitico': 'lv',
    'numeros': 'nm',
    'deuteronomio': 'dt',
    'josue': 'js',
    'juizes': 'jz',
    'rute': 'rt',
    '1samuel': '1sm',
    '2samuel': '2sm',
    '1reis': '1rs',
    '2reis': '2rs',
    '1cronicas': '1cr',
    '2cronicas': '2cr',
    'esdras': 'ed',
    'neemias': 'ne',
    'ester': 'et',
    'jo': 'job',
    'salmos': 'sl',
    'proverbios': 'pv',
    'eclesiastes': 'ec',
    'canticos': 'ct',
    'isaias': 'is',
    'jeremias': 'jr',
    'lamentacoes': 'lm',
    'ezequiel': 'ez',
    'daniel': 'dn',
    'oseias': 'os',
    'joel': 'jl',
    'amos': 'am',
    'obadias': 'ob',
    'jonas': 'jn',
    'miqueias': 'mq',
    'naum': 'na',
    'habacuque': 'hc',
    'sofonias': 'sf',
    'ageu': 'ag',
    'zacarias': 'zc',
    'malaquias': 'ml',
    'mateus': 'mt',
    'marcos': 'mc',
    'lucas': 'lc',
    'atos': 'at',
    'romanos': 'rm',
    '1corintios': '1co',
    '2corintios': '2co',
    'galatas': 'gl',
    'efesios': 'ef',
    'filipenses': 'fp',
    'colossenses': 'cl',
    '1tessalonicenses': '1ts',
    '2tessalonicenses': '2ts',
    '1timoteo': '1tm',
    '2timoteo': '2tm',
    'tito': 'tt',
    'filemom': 'fm',
    'hebreus': 'hb',
    'tiago': 'tg',
    '1pedro': '1pe',
    '2pedro': '2pe',
    '1joao': '1jo',
    '2joao': '2jo',
    '3joao': '3jo',
    'judas': 'jd',
    'apocalipse': 'ap'
  };
  
  return keyMap[normalized] || normalized;
}

/**
 * Converte código de versão (ARA -> ra)
 */
export function getVersionCode(appVersion) {
  const versionMap = {
    'ARA': 'ra',
    'ARC': 'arc',
    'NVI': 'nvi',
    'ACF': 'acf',
    'KJV': 'kjv'
  };
  return versionMap[appVersion] || appVersion.toLowerCase();
}

/**
 * Carrega capítulo com estratégia cache-first
 */
export async function getChapter(versionCode, bookKey, chapter) {
  const normalizedVersion = getVersionCode(versionCode);
  const normalizedBook = getBookKeyFromName(bookKey);
  const cacheKey = `${normalizedVersion}|${normalizedBook}|${chapter}`;
  
  console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=local status=- timeMs=- verses=- cacheHit=checking error=`);
  
  const t0 = performance.now();
  
  // 1. Verificar cache de memória
  if (memoryCache.has(cacheKey)) {
    const data = memoryCache.get(cacheKey);
    const timeMs = Math.round(performance.now() - t0);
    console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=memory status=200 timeMs=${timeMs} verses=${data.verses.length} cacheHit=mem error=`);
    return data;
  }
  
  // 2. Verificar localStorage persistente
  try {
    const storageKey = `${STORAGE_PREFIX}/${normalizedVersion}/${normalizedBook}/${chapter}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const data = JSON.parse(cached);
      memoryCache.set(cacheKey, data);
      const timeMs = Math.round(performance.now() - t0);
      console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=storage status=200 timeMs=${timeMs} verses=${data.verses.length} cacheHit=persist error=`);
      return data;
    }
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
  }
  
  // 3. Carregar do arquivo local
  const url = `/bible/${normalizedVersion}/${normalizedBook}/${chapter}.json`;
  
  try {
    const response = await fetch(url);
    const timeMs = Math.round(performance.now() - t0);
    
    if (!response.ok) {
      console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=${url} status=${response.status} timeMs=${timeMs} verses=0 cacheHit=none error=HTTP_${response.status}`);
      
      const error = new Error(`Capitulo nao disponivel no dataset: ${bookKey} ${chapter}`);
      error.code = 'NOT_FOUND';
      error.status = response.status;
      error.path = url;
      throw error;
    }
    
    const data = await response.json();
    
    // Validar formato
    if (!data.verses || !Array.isArray(data.verses)) {
      throw new Error('Invalid chapter format');
    }
    
    // Salvar nos caches
    memoryCache.set(cacheKey, data);
    try {
      const storageKey = `${STORAGE_PREFIX}/${normalizedVersion}/${normalizedBook}/${chapter}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
    
    const totalTime = Math.round(performance.now() - t0);
    console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=${url} status=200 timeMs=${totalTime} verses=${data.verses.length} cacheHit=none error=`);
    
    return data;
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);
    
    if (error.code !== 'NOT_FOUND') {
      console.log(`BIBLELOG bookLabel=${bookKey} bookKey=${normalizedBook} chapter=${chapter} versionLabel=${versionCode} versionCode=${normalizedVersion} url=${url} status=ERR timeMs=${timeMs} verses=0 cacheHit=none error=ERR_NETWORK`);
      error.code = 'NETWORK_ERROR';
      error.message = 'Erro ao carregar capitulo do dataset local';
    }
    
    throw error;
  }
}

/**
 * Salva capítulo no cache persistente (para downloads offline)
 */
export function saveChapterToCache(versionCode, bookKey, chapter, data) {
  const normalizedVersion = getVersionCode(versionCode);
  const normalizedBook = getBookKeyFromName(bookKey);
  const storageKey = `${STORAGE_PREFIX}/${normalizedVersion}/${normalizedBook}/${chapter}`;
  const cacheKey = `${normalizedVersion}|${normalizedBook}|${chapter}`;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    memoryCache.set(cacheKey, data);
    return true;
  } catch (error) {
    console.error('Failed to save chapter to cache:', error);
    return false;
  }
}

/**
 * Remove capítulo do cache
 */
export function removeChapterFromCache(versionCode, bookKey, chapter) {
  const normalizedVersion = getVersionCode(versionCode);
  const normalizedBook = getBookKeyFromName(bookKey);
  const storageKey = `${STORAGE_PREFIX}/${normalizedVersion}/${normalizedBook}/${chapter}`;
  
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Failed to remove chapter from cache:', error);
    return false;
  }
}

/**
 * Limpa todo o cache
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    memoryCache.cache.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

/**
 * Obtém estatísticas de cache
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    const bibleKeys = keys.filter(k => k.startsWith(STORAGE_PREFIX));
    
    let totalSize = 0;
    bibleKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });
    
    return {
      chaptersInCache: bibleKeys.length,
      totalSize,
      memoryCacheSize: memoryCache.cache.size
    };
  } catch (error) {
    return {
      chaptersInCache: 0,
      totalSize: 0,
      memoryCacheSize: 0
    };
  }
}