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