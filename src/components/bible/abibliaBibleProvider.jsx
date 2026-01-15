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
  
  console.log(`━━━━━━━━━━━ API REQUEST ━━━━━━━━━━━`);
  console.log(`versionLabel: ${versionCode}`);
  console.log(`versionCode: ${apiVersion}`);
  console.log(`bookKey: ${bookKey}`);
  console.log(`chapter: ${chapter}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, { signal });
    const t1 = performance.now();
    const timeMs = Math.round(t1 - t0);
    
    console.log(`STATUS: ${response.status} ${response.statusText}`);
    console.log(`TIME: ${timeMs}ms`);
    
    if (!response.ok) {
      // Ler o body da resposta para debug
      let errorBody = null;
      try {
        errorBody = await response.text();
        console.log(`RESPONSE BODY:`, errorBody.substring(0, 200));
      } catch (e) {
        // Ignora se não conseguir ler
      }
      
      const errorMsg = `Falha ao acessar a API (status ${response.status})`;
      
      if (response.status === 404) {
        throw new Error(`${errorMsg} - Capítulo não encontrado: ${bookKey} ${chapter}`);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(`${errorMsg} - Não autorizado`);
      }
      if (response.status === 429) {
        throw new Error(`${errorMsg} - Limite de requisições excedido`);
      }
      if (response.status >= 500) {
        throw new Error(`${errorMsg} - Erro no servidor`);
      }
      
      throw new Error(`${errorMsg} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.verses || data.verses.length === 0) {
      throw new Error('API retornou capítulo vazio');
    }
    
    console.log(`VERSES: ${data.verses.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
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
    console.log(`ERROR after ${timeMs}ms:`, error.message);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
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