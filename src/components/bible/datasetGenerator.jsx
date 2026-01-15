import { BIBLE_META } from './bibleMeta';

/**
 * Gera dataset a partir de arquivo fonte
 * Suporta: JSON, CSV, USFM
 */

/**
 * Parser para JSON completo
 * Formato esperado:
 * {
 *   "books": [
 *     {
 *       "name": "Gênesis",
 *       "key": "genesis", 
 *       "chapters": [
 *         {
 *           "number": 1,
 *           "verses": [
 *             {"number": 1, "text": "No princípio..."},
 *             ...
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
function parseJSON(jsonData, version) {
  const chapters = [];
  
  for (const book of jsonData.books) {
    const bookKey = book.key || book.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    
    for (const chapter of book.chapters) {
      chapters.push({
        version,
        book: bookKey,
        chapter: chapter.number,
        verses: chapter.verses.map(v => ({
          n: v.number,
          text: v.text
        }))
      });
    }
  }
  
  return chapters;
}

/**
 * Parser para CSV
 * Formato esperado: book,chapter,verse,text
 * Exemplo: Genesis,1,1,"No princípio..."
 */
function parseCSV(csvText, version) {
  const lines = csvText.split('\n').filter(l => l.trim());
  const chapters = {};
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([^,]+),(\d+),(\d+),"?(.+?)"?$/);
    
    if (!match) continue;
    
    const [, bookName, chapterNum, verseNum, text] = match;
    const bookKey = bookName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const key = `${bookKey}|${chapterNum}`;
    
    if (!chapters[key]) {
      chapters[key] = {
        version,
        book: bookKey,
        chapter: parseInt(chapterNum),
        verses: []
      };
    }
    
    chapters[key].verses.push({
      n: parseInt(verseNum),
      text: text.trim()
    });
  }
  
  return Object.values(chapters);
}

/**
 * Parser para USFM simplificado
 * Formato esperado:
 * \id GEN
 * \c 1
 * \v 1 No princípio...
 */
function parseUSFM(usfmText, version) {
  const lines = usfmText.split('\n');
  const chapters = [];
  let currentBook = null;
  let currentChapter = null;
  let currentVerses = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('\\id ')) {
      const bookCode = trimmed.substring(4).split(' ')[0];
      currentBook = bookCode.toLowerCase();
    } else if (trimmed.startsWith('\\c ')) {
      // Salvar capítulo anterior
      if (currentBook && currentChapter && currentVerses.length > 0) {
        chapters.push({
          version,
          book: currentBook,
          chapter: currentChapter,
          verses: [...currentVerses]
        });
      }
      
      currentChapter = parseInt(trimmed.substring(3));
      currentVerses = [];
    } else if (trimmed.startsWith('\\v ')) {
      const verseText = trimmed.substring(3);
      const spaceIdx = verseText.indexOf(' ');
      const verseNum = parseInt(verseText.substring(0, spaceIdx));
      const text = verseText.substring(spaceIdx + 1).trim();
      
      currentVerses.push({
        n: verseNum,
        text
      });
    }
  }
  
  // Salvar último capítulo
  if (currentBook && currentChapter && currentVerses.length > 0) {
    chapters.push({
      version,
      book: currentBook,
      chapter: currentChapter,
      verses: currentVerses
    });
  }
  
  return chapters;
}

/**
 * Importa dataset de arquivo
 */
export async function importDataset(file, version = 'ARA') {
  const text = await file.text();
  const fileName = file.name.toLowerCase();
  
  let chapters = [];
  
  if (fileName.endsWith('.json')) {
    const jsonData = JSON.parse(text);
    chapters = parseJSON(jsonData, version);
  } else if (fileName.endsWith('.csv')) {
    chapters = parseCSV(text, version);
  } else if (fileName.endsWith('.usfm') || fileName.endsWith('.txt')) {
    chapters = parseUSFM(text, version);
  } else {
    throw new Error('Formato não suportado. Use JSON, CSV ou USFM');
  }
  
  console.log(`📦 Parsed ${chapters.length} capítulos do arquivo`);
  
  return chapters;
}

/**
 * Salva capítulos no cache persistente (localStorage)
 */
export async function saveChaptersToCache(chapters) {
  const STORAGE_KEY = 'bible_chapters_cache';
  
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    for (const chapter of chapters) {
      const key = `${chapter.version}|${chapter.book}|${chapter.chapter}`;
      existing[key] = chapter;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    console.log(`✅ Salvos ${chapters.length} capítulos no cache`);
    
    return {
      success: true,
      saved: chapters.length,
      totalInCache: Object.keys(existing).length
    };
  } catch (error) {
    console.error('Erro ao salvar:', error);
    throw new Error(`Erro ao salvar no cache: ${error.message}`);
  }
}

/**
 * Valida dataset importado
 */
export function validateImportedDataset(chapters) {
  const stats = {
    totalChapters: chapters.length,
    booksCovered: new Set(),
    chaptersCovered: {},
    missing: [],
    duplicates: [],
    empty: []
  };
  
  // Mapear capítulos importados
  const imported = {};
  for (const chapter of chapters) {
    const key = `${chapter.book}|${chapter.chapter}`;
    
    if (imported[key]) {
      stats.duplicates.push(key);
    }
    
    imported[key] = chapter;
    stats.booksCovered.add(chapter.book);
    
    if (!stats.chaptersCovered[chapter.book]) {
      stats.chaptersCovered[chapter.book] = [];
    }
    stats.chaptersCovered[chapter.book].push(chapter.chapter);
    
    if (!chapter.verses || chapter.verses.length === 0) {
      stats.empty.push(`${chapter.book} ${chapter.chapter}`);
    }
  }
  
  // Verificar capítulos faltantes baseado no meta
  for (const book of BIBLE_META.books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      const key = `${book.key}|${ch}`;
      if (!imported[key]) {
        stats.missing.push({
          book: book.name,
          bookKey: book.key,
          chapter: ch,
          path: `/data/ARA/${book.key}/${ch}.json`
        });
      }
    }
  }
  
  return stats;
}

/**
 * Limpa todo o dataset do cache
 */
export function clearDatasetCache() {
  const STORAGE_KEY = 'bible_chapters_cache';
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cache do dataset limpo');
}