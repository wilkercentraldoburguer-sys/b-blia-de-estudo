/**
 * Provider para A Bíblia Digital API
 * https://www.abibliadigital.com.br/
 */

const API_BASE = 'https://www.abibliadigital.com.br/api';

/**
 * Mapeamento de versões do app para API
 */
const VERSION_MAP = {
  'ARA': 'ra',      // Almeida Revista e Atualizada
  'ARC': 'arc',     // Almeida Revista e Corrigida  
  'NVI': 'nvi',     // Nova Versão Internacional
  'ACF': 'acf',     // Almeida Corrigida Fiel
  'KJV': 'kjv'      // King James Version
};

/**
 * Converte versão do app para código da API
 */
export function getAPIVersionCode(appVersion) {
  return VERSION_MAP[appVersion] || appVersion.toLowerCase();
}

/**
 * Busca capítulo via API
 */
export async function fetchChapterFromAPI(versionCode, bookKey, chapter, signal, logData) {
  const t0 = performance.now();
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/${apiVersion}/${bookKey}/${chapter}`;
  
  if (logData) {
    logData.versionCode = apiVersion;
    logData.url = url;
  }
  
  try {
    const response = await fetch(url, { signal });
    const timeMs = Math.round(performance.now() - t0);
    
    if (logData) {
      logData.status = response.status;
      logData.timeMs = timeMs;
    }
    
    if (!response.ok) {
      const error = new Error(`Erro ao carregar ${bookKey} ${chapter} (status ${response.status})`);
      error.status = `HTTP_${response.status}`;
      throw error;
    }
    
    const data = await response.json();
    
    if (!data.verses || data.verses.length === 0) {
      const error = new Error('API retornou capitulo vazio');
      error.status = 'EMPTY';
      throw error;
    }
    
    if (logData) {
      logData.verses = data.verses.length;
      // Normalizar para ASCII
      const bookLabelNorm = (logData.bookLabel || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      console.log(`BIBLELOG bookLabel=${bookLabelNorm} bookKey=${logData.bookKey} chapter=${logData.chapter} versionLabel=${logData.versionLabel} versionCode=${apiVersion} url=${url} status=${response.status} timeMs=${timeMs} verses=${data.verses.length} cacheHit=none error=`);
    }
    
    // Converter para nosso formato
    return {
      version: versionCode,
      book: bookKey,
      chapter: parseInt(chapter),
      verses: data.verses.map(v => ({
        n: v.number,
        text: v.text
      }))
    };
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);
    
    if (logData) {
      logData.timeMs = timeMs;
      logData.error = error.status || 'ERR_NETWORK';
    }
    
    throw error;
  }
}

/**
 * Busca informações de um livro
 */
export async function fetchBookInfo(versionCode, bookKey) {
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/books/${apiVersion}/${bookKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar info do livro: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Lista todas as versões disponíveis
 */
export async function fetchAvailableVersions() {
  const url = `${API_BASE}/versions`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar versões disponíveis');
  }
  
  const data = await response.json();
  return data;
}