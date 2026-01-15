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
export async function fetchChapterFromAPI(versionCode, bookKey, chapter, signal) {
  const t0 = performance.now();
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/${apiVersion}/${bookKey}/${chapter}`;
  
  console.log(`versionCode=${apiVersion}`);
  console.log(`URL=${url}`);
  
  try {
    const response = await fetch(url, { signal });
    const t1 = performance.now();
    const timeMs = Math.round(t1 - t0);
    
    console.log(`STATUS=${response.status}`);
    console.log(`TIME=${timeMs}ms`);
    
    if (!response.ok) {
      // Ler o body da resposta para debug
      let errorBody = '';
      try {
        errorBody = await response.text();
        const bodyPreview = errorBody.substring(0, 150);
        console.log(`body=${bodyPreview}${errorBody.length > 150 ? '...' : ''}`);
      } catch (e) {
        console.log(`body=(não conseguiu ler)`);
      }
      
      const error = new Error(`Erro ao carregar ${bookKey} ${chapter} (status ${response.status})`);
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    if (!data.verses || data.verses.length === 0) {
      const error = new Error('API retornou capítulo vazio');
      error.status = 'EMPTY';
      throw error;
    }
    
    console.log(`verses=${data.verses.length}`);
    
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
    const t1 = performance.now();
    const timeMs = Math.round(t1 - t0);
    
    if (!error.status) {
      console.log(`STATUS=ERROR`);
      console.log(`TIME=${timeMs}ms`);
      console.log(`body=${String(error.message || error)}`);
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