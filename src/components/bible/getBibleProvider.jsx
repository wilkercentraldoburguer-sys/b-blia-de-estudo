/**
 * Provider para a API pública getbible.net
 * https://getbible.net/
 *
 * Fonte gratuita, sem necessidade de token, com texto de domínio público.
 * Hoje oferece duas traduções reais e verificadas:
 *  - "almeida": Almeida Atualizada, edição de 1911, por João Ferreira de
 *    Almeida (domínio público). Por ser a edição de 1911, a ortografia é
 *    antiga (ex: "phariseos" em vez de "fariseus"), mas o texto é real.
 *  - "kjv": King James Version, em inglês (domínio público / GPL).
 *
 * IMPORTANTE sobre honestidade de fonte:
 * Este provider é o fallback público (sem token) usado quando o dataset
 * local e a ABíbliaDigital não têm o capítulo. Para as versões em
 * português que não têm fonte gratuita própria (ARC, NVI, ACF, NAA), ele
 * serve o texto de Almeida 1911 como aproximação - decisão que já existia
 * antes desta função ser generalizada. Isso NUNCA deve acontecer para uma
 * versão em outro idioma, ou para uma versão que sabidamente não tem
 * nenhuma fonte gratuita/legal (ver bloqueio de NVT abaixo) - nesses
 * casos, o app precisa avisar o usuário em vez de inventar/misturar texto
 * silenciosamente.
 */

import { BIBLE_META } from './bibleMeta';

const API_BASE = 'https://api.getbible.net/v2';

/**
 * Traduções reais confirmadas na getbible.net, por versão do app.
 * Versões em português sem tradução própria caem em 'almeida' (mesma
 * língua, texto real, apenas de outra edição/ortografia).
 */
const TRANSLATION_MAP = {
  'KJV': 'kjv',
  'ARA': 'almeida',
  'ARC': 'almeida',
  'NVI': 'almeida',
  'ACF': 'almeida',
  'NAA': 'almeida',
};

/**
 * Versões que o app oferece na interface mas para as quais NÃO existe
 * (até onde pesquisamos) nenhuma fonte gratuita e legal de texto completo.
 * NVT (Nova Versão Transformadora) é uma tradução comercial licenciada
 * (Mundo Cristão / Tyndale House) - não está na ABíbliaDigital nem em
 * nenhuma API pública de domínio público que encontramos.
 * NTLH (Nova Tradução na Linguagem de Hoje) é publicada e licenciada pela
 * Sociedade Bíblica do Brasil - mesma situação: não está na getbible.net
 * (que só tem "almeida" em português) nem na ABíbliaDigital.
 * Em vez de substituir silenciosamente por outra versão, bloqueamos aqui
 * com um erro claro.
 */
const KNOWN_UNAVAILABLE_VERSIONS = {
  'NVT': 'A NVT (Nova Versão Transformadora) é uma tradução comercial protegida por direitos autorais. Não encontramos uma fonte gratuita e legal para o texto completo dela, então o app não a exibe - para não arriscar mostrar outra versão com a etiqueta "NVT" sem avisar você.',
  'NTLH': 'A NTLH (Nova Tradução na Linguagem de Hoje) é publicada pela Sociedade Bíblica do Brasil e protegida por direitos autorais. Não encontramos uma fonte gratuita e legal para o texto completo dela, então o app não a exibe - para não arriscar mostrar outra versão com a etiqueta "NTLH" sem avisar você.',
};

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
 * Indica se uma versão do app é sabidamente indisponível (sem fonte real).
 */
export function getUnavailableVersionReason(versionCode) {
  return KNOWN_UNAVAILABLE_VERSIONS[versionCode] || null;
}

/**
 * Busca capítulo via getbible.net (sem token, texto de domínio público).
 * @param {string} versionCode - versão pedida pelo app (ex: 'ARA', 'KJV', 'NVT')
 */
export async function fetchChapterFromGetBible(bookKey, chapter, signal, logData, versionCode = 'ARA') {
  const unavailableReason = getUnavailableVersionReason(versionCode);
  if (unavailableReason) {
    const error = new Error(unavailableReason);
    error.code = 'VERSION_UNAVAILABLE';
    throw error;
  }

  const bookNumber = BOOK_NUMBER_MAP[bookKey];

  if (!bookNumber) {
    const error = new Error(`Livro nao reconhecido: ${bookKey}`);
    error.code = 'UNKNOWN_BOOK';
    throw error;
  }

  const translation = TRANSLATION_MAP[versionCode] || 'almeida';

  const t0 = performance.now();
  const url = `${API_BASE}/${translation}/${bookNumber}/${chapter}.json`;

  if (logData) {
    logData.provider = 'getbible';
    logData.translation = translation;
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
      console.log(`BIBLELOG source=getbible translation=${translation} url=${url} status=${response.status} error=NONE timeMs=${timeMs} verses=${data.verses.length} cacheHit=none`);
    }

    return {
      version: versionCode,
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
