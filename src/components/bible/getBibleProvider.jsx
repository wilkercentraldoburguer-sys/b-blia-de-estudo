/**
 * Provider para a API pública getbible.net
 * https://getbible.net/
 *
 * Fonte gratuita, sem necessidade de token, com texto de domínio público
 * (tradução "Almeida Atualizada", edição de 1911, por João Ferreira de Almeida).
 *
 * Observação: por ser a edição de 1911, a ortografia é antiga
 * (ex: "phariseos" em vez de "fariseus"). O texto é real e preciso,
 * apenas com grafia de época.
 */

import { BIBLE_META } from './bibleMeta';

const API_BASE = 'https://api.getbible.net/v2';
const TRANSLATION = 'almeida';

/**
 * Mapeamento de chave normalizada do livro -> número do livro (1-66)
 * Gerado a partir da ordem canônica já usada em bibleMeta.jsx,
 * que é a mesma ordem que a API getbible.net espera.
 */
const BOOK_NUMBER_MAP = BIBLE_META.books.reduce((map, book, index) => {
  map[book.key] = index + 1;
  return map;
}, {});

/**
 * Busca capítulo via getbible.net (sem token, texto de domínio público)
 */
export async function fetchChapterFromGetBible(bookKey, chapter, signal, logData) {
  const bookNumber = BOOK_NUMBER_MAP[bookKey];

  if (!bookNumber) {
    const error = new Error(`Livro nao reconhecido: ${bookKey}`);
    error.code = 'UNKNOWN_BOOK';
    throw error;
  }

  const t0 = performance.now();
  const url = `${API_BASE}/${TRANSLATION}/${bookNumber}/${chapter}.json`;

  if (logData) {
    logData.provider = 'getbible';
    logData.url = url;
  }

  try {
    const response = await fetch(url, { signal });
    const timeMs = Math.round(performance.now() - t0);

    if (logData) {
      logData.status = response.status;
      logData.timeMs = timeMs;
    }

    if (response.status === 404) {
      const error = new Error(`Capitulo nao encontrado no getbible.net: ${bookKey} ${chapter}`);
      error.code = 'NOT_FOUND';
      error.status = 'HTTP_404';
      throw error;
    }

    if (response.status === 429) {
      const error = new Error('Limite de requisicoes excedido, tente novamente em alguns minutos');
      error.code = 'RATE_LIMIT';
      error.status = 'HTTP_429';
      throw error;
    }

    if (response.status >= 500) {
      const error = new Error('Erro interno da API getbible.net, tente novamente');
      error.code = 'SERVER_ERROR';
      error.status = `HTTP_${response.status}`;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`Erro ao carregar ${bookKey} ${chapter} (status ${response.status})`);
      error.code = 'HTTP_ERROR';
      error.status = `HTTP_${response.status}`;
      throw error;
    }

    const data = await response.json();

    if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
      const error = new Error('getbible.net retornou capitulo vazio');
      error.code = 'EMPTY';
      throw error;
    }

    if (logData) {
      logData.verses = data.verses.length;
      console.log(`BIBLELOG source=getbible url=${url} status=${response.status} error=NONE timeMs=${timeMs} verses=${data.verses.length} cacheHit=none`);
    }

    return {
      version: 'ARA',
      book: bookKey,
      chapter: parseInt(chapter, 10),
      verses: data.verses.map(v => ({
        n: v.verse,
        text: v.text
      }))
    };
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);

    if (logData) {
      logData.timeMs = timeMs;
      logData.error = error.code || 'ERR_NETWORK';
    }

    throw error;
  }
}
