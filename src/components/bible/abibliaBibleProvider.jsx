/**
 * Provider para A Bíblia Digital API
 * https://www.abibliadigital.com.br/
 */

import { getAPIToken, hasAPIToken } from './apiTokenManager';

const API_BASE = 'https://www.abibliadigital.com.br/api';

/**
 * Mapeamento de versões do app para API
 */
const VERSION_MAP = {
  'ARA': 'ra',      // Almeida Revista e Atualizada
  'ARC': 'arc',     // Almeida Revista e Corrigida
  'NVI': 'nvi',     // Nova Versão Internacional
  'ACF': 'acf',     // Almeida Corrigida Fiel
  'KJA': 'kjv',     // King James (texto real em inglês - sigla renomeada em 26/08/2026)
  'KJV': 'kjv'      // sigla antiga, mantida por compatibilidade
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
  // Verificar se há token configurado
  if (!hasAPIToken()) {
    const error = new Error('Token nao configurado. Configure em Configuracoes para carregar capitulos.');
    error.code = 'NO_TOKEN';
    error.status = 'NO_TOKEN';
    throw error;
  }

  const t0 = performance.now();
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/${apiVersion}/${bookKey}/${chapter}`;
  const token = getAPIToken();
  
  if (logData) {
    logData.versionCode = apiVersion;
    logData.url = url;
  }
  
  try {
    const response = await fetch(url, {
      signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const timeMs = Math.round(performance.now() - t0);
    
    if (logData) {
      logData.status = response.status;
      logData.timeMs = timeMs;
    }
    
    if (response.status === 401 || response.status === 403) {
      const error = new Error('Token invalido ou sem permissao');
      error.status = `HTTP_${response.status}`;
      error.code = 'UNAUTHORIZED';
      throw error;
    }
    
    if (response.status === 429) {
      const error = new Error('Limite de requisicoes excedido, tente novamente em alguns minutos');
      error.status = `HTTP_${response.status}`;
      error.code = 'RATE_LIMIT';
      throw error;
    }
    
    if (response.status >= 500) {
      const error = new Error('Erro interno da API, tente novamente');
      error.status = `HTTP_${response.status}`;
      error.code = 'SERVER_ERROR';
      throw error;
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

/**
 * Monta os headers da requisição, incluindo o token quando configurado.
 * A busca e o versículo aleatório funcionam mesmo sem token (limitado a
 * 20 requisições/hora pela própria ABíbliaDigital); com token, o limite
 * é removido.
 */
function buildHeaders() {
  const headers = { 'Accept': 'application/json' };
  if (hasAPIToken()) {
    headers['Authorization'] = `Bearer ${getAPIToken()}`;
  }
  return headers;
}

/**
 * Busca REAL de versículos por palavra/termo na ABíbliaDigital.
 * Nunca "inventa" resultados - retorna apenas o que a API encontrar de fato
 * no texto bíblico real.
 * https://www.abibliadigital.com.br/api/verses/search
 */
export async function searchVerses(versionCode, searchTerm) {
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/search`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...buildHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ version: apiVersion, search: searchTerm })
  });

  if (response.status === 429) {
    const error = new Error('Limite de requisicoes excedido, tente novamente em alguns minutos');
    error.code = 'RATE_LIMIT';
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Erro na busca (status ${response.status})`);
    error.code = 'HTTP_ERROR';
    throw error;
  }

  const data = await response.json();

  // Normaliza para o formato usado pela UI: { book, chapter, verse, text }
  const verses = data?.verses || [];
  return verses.map(v => ({
    book: v.book?.name || v.book,
    chapter: v.chapter,
    verse: v.number,
    text: v.text
  }));
}

/**
 * Busca um versículo REAL aleatório (para "versículo do dia" etc.).
 * https://www.abibliadigital.com.br/api/verses/:version/random
 */
export async function fetchRandomVerse(versionCode) {
  const apiVersion = getAPIVersionCode(versionCode);
  const url = `${API_BASE}/verses/${apiVersion}/random`;

  const response = await fetch(url, { headers: buildHeaders() });

  if (response.status === 429) {
    const error = new Error('Limite de requisicoes excedido, tente novamente em alguns minutos');
    error.code = 'RATE_LIMIT';
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Erro ao buscar versiculo aleatorio (status ${response.status})`);
    error.code = 'HTTP_ERROR';
    throw error;
  }

  const data = await response.json();

  return {
    book: data.book?.name || data.book,
    chapter: data.chapter,
    verse: data.number,
    text: data.text
  };
}