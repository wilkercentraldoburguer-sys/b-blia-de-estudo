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
 * IMPORTANTE sobre honestidade de fonte (atualizado em 25/08/2026):
 * Até essa data, esse provider era usado como fallback pra QUALQUER versão
 * em português sem dataset local (ARA, ARC, NVI, ACF, NAA) e servia o
 * texto de Almeida 1911 "como aproximação" sob a etiqueta da versão
 * escolhida - o usuário selecionava "NVI" e recebia silenciosamente o
 * texto de 1911 ("phariseos", sem título de seção etc.), o que é enganoso
 * e foi reportado como bug. Agora o app tem um dataset local real e
 * completo pra Almeida Revisada (AA, ver /public/bible/aa e
 * bibleVersions.jsx) e esse fallback só serve pra KJA (inglês, real) e
 * pra AA/NVI/ACF quando por algum motivo faltar um capítulo no dataset
 * local. As demais versões em português (ARA, ARC, NAA) e as comerciais
 * sem nenhuma fonte encontrada (NVT, NTLH) ficam bloqueadas aqui
 * explicitamente: o app avisa que não há fonte gratuita/legal em vez de
 * inventar/misturar texto silenciosamente.
 *
 * ATUALIZAÇÃO (26/08/2026): "KJV" virou "KJA" (troca de sigla pedida pelo
 * usuário - texto continua o King James real em inglês, ver
 * bibleVersions.jsx). NVI e ACF passaram a ter dataset local real também
 * (com ressalva de direitos autorais, ver bibleVersions.jsx) - por isso
 * saíram da lista de bloqueadas abaixo. getbible.net continua sem NVI/ACF
 * como tradução própria, então se algum dia o dataset local falhar pra
 * essas duas, o fallback aqui simplesmente não encontra tradução
 * (TRANSLATION_MAP) e erra com uma mensagem clara, em vez de inventar.
 */

import { BIBLE_META } from './bibleMeta';

const API_BASE = 'https://api.getbible.net/v2';

/**
 * Traduções reais confirmadas na getbible.net, por versão do app.
 */
const TRANSLATION_MAP = {
  'KJA': 'kjv',
  'AA': 'almeida',
};

/**
 * Versões que o app oferece na interface mas para as quais NÃO existe
 * (até onde pesquisamos) nenhuma fonte gratuita de texto completo -
 * gratuita e legal (NVT, NTLH) ou pelo menos gratuita (ARA, ARC, NAA: nem
 * o texto em si, com risco de direitos autorais, foi encontrado em
 * nenhum lugar). Diferente de NVI/ACF (ver bibleVersions.jsx), aqui o
 * problema não é licença - é que o texto simplesmente não existe em
 * nenhuma fonte que encontramos.
 */
const KNOWN_UNAVAILABLE_VERSIONS = {
  'NVT': 'A NVT (Nova Versão Transformadora) é uma tradução comercial protegida por direitos autorais. Não encontramos uma fonte gratuita e legal para o texto completo dela, então o app não a exibe - para não arriscar mostrar outra versão com a etiqueta "NVT" sem avisar você.',
  'NTLH': 'A NTLH (Nova Tradução na Linguagem de Hoje) é publicada pela Sociedade Bíblica do Brasil e protegida por direitos autorais. Não encontramos uma fonte gratuita e legal para o texto completo dela, então o app não a exibe - para não arriscar mostrar outra versão com a etiqueta "NTLH" sem avisar você.',
  'ARA': 'A ARA (Almeida Revista e Atualizada) é uma tradução protegida por direitos autorais da Sociedade Bíblica do Brasil. Não encontramos o texto completo dela em nenhuma fonte, então o app não a exibe - use a AA (Almeida Revisada), que tem texto real e completo.',
  'ARC': 'A ARC (Almeida Revista e Corrigida) é uma tradução protegida por direitos autorais. Não encontramos o texto completo dela em nenhuma fonte, então o app não a exibe - use a AA (Almeida Revisada), que tem texto real e completo.',
  'NAA': 'A NAA (Nova Almeida Atualizada) é uma tradução protegida por direitos autorais da Sociedade Bíblica do Brasil. Não encontramos o texto completo dela em nenhuma fonte, então o app não a exibe - use a AA (Almeida Revisada), que tem texto real e completo.',
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
 * @param {string} versionCode - versão pedida pelo app (ex: 'ARA', 'KJA', 'NVT')
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

  const translation = TRANSLATION_MAP[versionCode];

  if (!translation) {
    // Sem mapeamento real conhecido pra essa versão - nunca cair pra
    // 'almeida' (ou qualquer outra) silenciosamente sob outra etiqueta.
    const error = new Error(`Sem fonte real conhecida pra versao "${versionCode}" no getbible.net`);
    error.code = 'VERSION_UNAVAILABLE';
    throw error;
  }

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
