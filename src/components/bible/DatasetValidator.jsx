/**
 * DatasetValidator - Valida dataset honestamente
 */

import { loadMeta } from './BibleRepository';
import { getBasePath } from './DatasetPathDetector';

/**
 * Valida dataset completo
 */
export async function validateDataset(versionCode = 'ra') {
  const meta = await loadMeta();
  
  const books = meta.books.length > 0 ? meta.books : getDefaultBooks();
  const totalExpected = meta.totalChaptersExpected || 1189;
  
  const results = {
    totalExpected,
    totalFound: 0,
    missing: [],
    invalid: [],
    checked: 0
  };
  
  const basePath = getBasePath();
  
  for (const book of books) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      results.checked++;
      const url = `${basePath}/${versionCode}/${book.key}/${chapter}.json`;
      
      try {
        const response = await fetch(url);
        
        if (response.ok) {
          try {
            const data = await response.json();
            
            // Validar schema
            if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
              results.invalid.push({
                book: book.key,
                bookName: book.name,
                chapter,
                reason: 'Schema invalido ou vazio'
              });
            } else {
              results.totalFound++;
            }
          } catch (e) {
            results.invalid.push({
              book: book.key,
              bookName: book.name,
              chapter,
              reason: 'JSON invalido'
            });
          }
        } else {
          results.missing.push({
            book: book.key,
            bookName: book.name,
            chapter
          });
        }
      } catch (error) {
        results.missing.push({
          book: book.key,
          bookName: book.name,
          chapter
        });
      }
    }
  }
  
  return results;
}

/**
 * Exporta relatório JSON
 */
export function exportReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalExpected: results.totalExpected,
      totalFound: results.totalFound,
      totalMissing: results.missing.length,
      totalInvalid: results.invalid.length,
      completionPercentage: Math.round((results.totalFound / results.totalExpected) * 100)
    },
    missing: results.missing,
    invalid: results.invalid
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dataset-validation-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Lista padrão de livros (fallback se meta.json não existir)
 */
function getDefaultBooks() {
  return [
    { key: 'gn', name: 'Gênesis', chapters: 50, testament: 'AT' },
    { key: 'ex', name: 'Êxodo', chapters: 40, testament: 'AT' },
    { key: 'lv', name: 'Levítico', chapters: 27, testament: 'AT' },
    { key: 'nm', name: 'Números', chapters: 36, testament: 'AT' },
    { key: 'dt', name: 'Deuteronômio', chapters: 34, testament: 'AT' },
    { key: 'js', name: 'Josué', chapters: 24, testament: 'AT' },
    { key: 'jz', name: 'Juízes', chapters: 21, testament: 'AT' },
    { key: 'rt', name: 'Rute', chapters: 4, testament: 'AT' },
    { key: '1sm', name: '1 Samuel', chapters: 31, testament: 'AT' },
    { key: '2sm', name: '2 Samuel', chapters: 24, testament: 'AT' },
    { key: '1rs', name: '1 Reis', chapters: 22, testament: 'AT' },
    { key: '2rs', name: '2 Reis', chapters: 25, testament: 'AT' },
    { key: '1cr', name: '1 Crônicas', chapters: 29, testament: 'AT' },
    { key: '2cr', name: '2 Crônicas', chapters: 36, testament: 'AT' },
    { key: 'ed', name: 'Esdras', chapters: 10, testament: 'AT' },
    { key: 'ne', name: 'Neemias', chapters: 13, testament: 'AT' },
    { key: 'et', name: 'Ester', chapters: 10, testament: 'AT' },
    { key: 'job', name: 'Jó', chapters: 42, testament: 'AT' },
    { key: 'sl', name: 'Salmos', chapters: 150, testament: 'AT' },
    { key: 'pv', name: 'Provérbios', chapters: 31, testament: 'AT' },
    { key: 'ec', name: 'Eclesiastes', chapters: 12, testament: 'AT' },
    { key: 'ct', name: 'Cânticos', chapters: 8, testament: 'AT' },
    { key: 'is', name: 'Isaías', chapters: 66, testament: 'AT' },
    { key: 'jr', name: 'Jeremias', chapters: 52, testament: 'AT' },
    { key: 'lm', name: 'Lamentações', chapters: 5, testament: 'AT' },
    { key: 'ez', name: 'Ezequiel', chapters: 48, testament: 'AT' },
    { key: 'dn', name: 'Daniel', chapters: 12, testament: 'AT' },
    { key: 'os', name: 'Oséias', chapters: 14, testament: 'AT' },
    { key: 'jl', name: 'Joel', chapters: 3, testament: 'AT' },
    { key: 'am', name: 'Amós', chapters: 9, testament: 'AT' },
    { key: 'ob', name: 'Obadias', chapters: 1, testament: 'AT' },
    { key: 'jn', name: 'Jonas', chapters: 4, testament: 'AT' },
    { key: 'mq', name: 'Miquéias', chapters: 7, testament: 'AT' },
    { key: 'na', name: 'Naum', chapters: 3, testament: 'AT' },
    { key: 'hc', name: 'Habacuque', chapters: 3, testament: 'AT' },
    { key: 'sf', name: 'Sofonias', chapters: 3, testament: 'AT' },
    { key: 'ag', name: 'Ageu', chapters: 2, testament: 'AT' },
    { key: 'zc', name: 'Zacarias', chapters: 14, testament: 'AT' },
    { key: 'ml', name: 'Malaquias', chapters: 4, testament: 'AT' },
    { key: 'mt', name: 'Mateus', chapters: 28, testament: 'NT' },
    { key: 'mc', name: 'Marcos', chapters: 16, testament: 'NT' },
    { key: 'lc', name: 'Lucas', chapters: 24, testament: 'NT' },
    { key: 'jo', name: 'João', chapters: 21, testament: 'NT' },
    { key: 'at', name: 'Atos', chapters: 28, testament: 'NT' },
    { key: 'rm', name: 'Romanos', chapters: 16, testament: 'NT' },
    { key: '1co', name: '1 Coríntios', chapters: 16, testament: 'NT' },
    { key: '2co', name: '2 Coríntios', chapters: 13, testament: 'NT' },
    { key: 'gl', name: 'Gálatas', chapters: 6, testament: 'NT' },
    { key: 'ef', name: 'Efésios', chapters: 6, testament: 'NT' },
    { key: 'fp', name: 'Filipenses', chapters: 4, testament: 'NT' },
    { key: 'cl', name: 'Colossenses', chapters: 4, testament: 'NT' },
    { key: '1ts', name: '1 Tessalonicenses', chapters: 5, testament: 'NT' },
    { key: '2ts', name: '2 Tessalonicenses', chapters: 3, testament: 'NT' },
    { key: '1tm', name: '1 Timóteo', chapters: 6, testament: 'NT' },
    { key: '2tm', name: '2 Timóteo', chapters: 4, testament: 'NT' },
    { key: 'tt', name: 'Tito', chapters: 3, testament: 'NT' },
    { key: 'fm', name: 'Filemom', chapters: 1, testament: 'NT' },
    { key: 'hb', name: 'Hebreus', chapters: 13, testament: 'NT' },
    { key: 'tg', name: 'Tiago', chapters: 5, testament: 'NT' },
    { key: '1pe', name: '1 Pedro', chapters: 5, testament: 'NT' },
    { key: '2pe', name: '2 Pedro', chapters: 3, testament: 'NT' },
    { key: '1jo', name: '1 João', chapters: 5, testament: 'NT' },
    { key: '2jo', name: '2 João', chapters: 1, testament: 'NT' },
    { key: '3jo', name: '3 João', chapters: 1, testament: 'NT' },
    { key: 'jd', name: 'Judas', chapters: 1, testament: 'NT' },
    { key: 'ap', name: 'Apocalipse', chapters: 22, testament: 'NT' }
  ];
}