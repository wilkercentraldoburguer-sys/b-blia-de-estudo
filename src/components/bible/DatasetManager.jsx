/**
 * DatasetManager - Importação e gerenciamento de datasets bíblicos
 */

import { saveChapterToCache } from './BibleRepository';

/**
 * Importa dataset de um arquivo (ZIP ou JSON)
 */
export async function importDatasetFromFile(file, onProgress) {
  onProgress?.({ status: 'validating', message: 'Validando arquivo...' });
  
  if (!file) {
    throw new Error('Nenhum arquivo fornecido');
  }
  
  // Validar extensão
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.json') && !fileName.endsWith('.zip')) {
    throw new Error('Formato nao suportado. Use JSON ou ZIP.');
  }
  
  try {
    if (fileName.endsWith('.json')) {
      return await importFromJSON(file, onProgress);
    } else {
      return await importFromZIP(file, onProgress);
    }
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

/**
 * Importa de arquivo JSON
 */
async function importFromJSON(file, onProgress) {
  onProgress?.({ status: 'reading', message: 'Lendo arquivo JSON...' });
  
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validar estrutura
  if (!data.version || !data.bookKey || !data.chapter || !data.verses) {
    throw new Error('Formato JSON invalido. Verifique a estrutura.');
  }
  
  onProgress?.({ status: 'importing', message: 'Importando capitulo...', current: 1, total: 1 });
  
  const success = saveChapterToCache(data.version, data.bookKey, data.chapter, data);
  
  if (!success) {
    throw new Error('Falha ao salvar no cache');
  }
  
  return {
    success: true,
    imported: 1,
    failed: 0,
    details: [`${data.bookKey} ${data.chapter}`]
  };
}

/**
 * Importa de arquivo ZIP
 */
async function importFromZIP(file, onProgress) {
  // Nota: Implementação completa de ZIP requer biblioteca JSZip
  // Por enquanto, retorna erro pedindo JSON individual
  throw new Error('Importacao de ZIP ainda nao implementada. Use arquivos JSON individuais por capitulo.');
}

/**
 * Importa dataset de URL
 */
export async function importDatasetFromURL(url, onProgress) {
  onProgress?.({ status: 'downloading', message: 'Baixando dataset...' });
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status}`);
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'dataset.json', { type: blob.type });
    
    return await importDatasetFromFile(file, onProgress);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Falha no download: ${error.message}`);
  }
}

/**
 * Valida dataset instalado
 */
export async function validateDataset(versionCode = 'ra') {
  const meta = await fetch('/bible/meta.json').then(r => r.json()).catch(() => ({ books: [] }));
  
  const totalExpected = meta.books.reduce((sum, book) => sum + book.chapters, 0);
  const results = {
    totalExpected,
    totalFound: 0,
    missing: [],
    invalid: []
  };
  
  for (const book of meta.books) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      const url = `/bible/${versionCode}/${book.key}/${chapter}.json`;
      
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          // Validar estrutura
          if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
            results.invalid.push({ book: book.key, chapter, reason: 'Formato invalido ou vazio' });
          } else {
            results.totalFound++;
          }
        } else {
          results.missing.push({ book: book.key, chapter });
        }
      } catch (error) {
        results.missing.push({ book: book.key, chapter });
      }
    }
  }
  
  return results;
}

/**
 * Exporta relatório de validação
 */
export function exportValidationReport(results) {
  const lines = [
    '=== RELATORIO DE VALIDACAO DO DATASET ===',
    '',
    `Total esperado: ${results.totalExpected} capitulos`,
    `Total encontrado: ${results.totalFound} capitulos`,
    `Faltando: ${results.missing.length}`,
    `Invalidos: ${results.invalid.length}`,
    '',
    '=== CAPITULOS FALTANDO ===',
    ...results.missing.map(m => `${m.book} ${m.chapter}`),
    '',
    '=== CAPITULOS INVALIDOS ===',
    ...results.invalid.map(i => `${i.book} ${i.chapter}: ${i.reason}`)
  ];
  
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dataset-validation-report.txt';
  a.click();
  URL.revokeObjectURL(url);
}