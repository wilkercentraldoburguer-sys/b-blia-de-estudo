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
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/${apiVersion}/${bookKey}/${chapter}`;
  
  console.log(`🌐 API Request: ${url}`);
  console.log(`   Version: ${versionCode} → ${apiVersion}`);
  console.log(`   Book: ${bookKey}, Chapter: ${chapter}`);
  
  const response = await fetch(url, { signal });
  
  console.log(`   Status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Capítulo não encontrado na API: ${bookKey} ${chapter}`);
    }
    throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Formato da API:
  // {
  //   book: { abbrev: { pt: "gn" }, name: "Gênesis" },
  //   chapter: { number: 1, verses: 31 },
  //   verses: [
  //     { number: 1, text: "No princípio..." }
  //   ]
  // }
  
  if (!data.verses || data.verses.length === 0) {
    throw new Error('API retornou capítulo vazio');
  }
  
  console.log(`   ✅ Recebidos ${data.verses.length} versículos`);
  
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