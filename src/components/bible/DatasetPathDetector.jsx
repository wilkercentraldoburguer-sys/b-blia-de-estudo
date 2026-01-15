/**
 * DatasetPathDetector - Auto-detecta o prefixo correto para arquivos públicos
 */

const STORAGE_KEY = 'datasetBasePath';

const CANDIDATE_PATHS = [
  '/bible',
  '/public/bible',
  '/assets/bible',
  '/static/bible',
  '/.well-known/bible',
  '/files/bible'
];

/**
 * Testa um candidato de base path
 */
async function testCandidate(basePath) {
  const url = `${basePath}/meta.json`;
  const t0 = performance.now();
  
  try {
    const response = await fetch(url);
    const timeMs = Math.round(performance.now() - t0);
    
    const result = {
      basePath,
      url,
      status: response.status,
      ok: response.ok,
      timeMs,
      contentType: response.headers.get('content-type') || '',
      bytes: 0,
      success: response.ok
    };
    
    if (response.ok) {
      const text = await response.text();
      result.bytes = text.length;
      
      // Validar se é JSON válido
      try {
        JSON.parse(text);
      } catch (e) {
        result.success = false;
        result.error = 'JSON inválido';
      }
    }
    
    console.log(`[PathDetector] Testando ${url} → status=${result.status} ok=${result.ok} bytes=${result.bytes} timeMs=${timeMs}`);
    
    return result;
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);
    
    console.log(`[PathDetector] Testando ${url} → ERRO: ${error.message}`);
    
    return {
      basePath,
      url,
      status: 'ERROR',
      ok: false,
      timeMs,
      contentType: '',
      bytes: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Auto-detecta o base path correto
 */
export async function autoDetectBasePath() {
  console.log('[PathDetector] Iniciando auto-detecção de base path...');
  
  const results = [];
  
  for (const candidate of CANDIDATE_PATHS) {
    const result = await testCandidate(candidate);
    results.push(result);
    
    // Parar no primeiro que funcionar
    if (result.success) {
      console.log(`[PathDetector] ✅ Base path detectado: ${candidate}`);
      setBasePath(candidate);
      return { success: true, basePath: candidate, results };
    }
  }
  
  console.log('[PathDetector] ❌ Nenhum base path válido encontrado');
  return { success: false, basePath: null, results };
}

/**
 * Testa um base path específico
 */
export async function testBasePath(basePath) {
  return await testCandidate(basePath);
}

/**
 * Salva base path no localStorage
 */
export function setBasePath(basePath) {
  try {
    localStorage.setItem(STORAGE_KEY, basePath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Obtém base path salvo
 */
export function getBasePath() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '/bible';
  } catch (e) {
    return '/bible';
  }
}

/**
 * Limpa base path salvo
 */
export function clearBasePath() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}