/**
 * Provider para a YouVersion Platform API
 * https://developers.youversion.com
 *
 * Contexto (29/08/2026): depois de pesquisar alternativas gratuitas para
 * versões em português além da AA (Almeida Revisada) e do KJA (King James,
 * inglês), encontramos a YouVersion Platform - programa oficial de
 * licenciamento gratuito de Bíblias da YouVersion, para uso não-comercial.
 * O usuário criou uma conta de desenvolvedor (Individual), registrou este
 * app e aceitou o "Biblica Fast-track Bible License v1" (contrato real com
 * a Biblica, Inc., dona dos direitos da NVI e de outras traduções).
 *
 * Versões reais liberadas por esse contrato e confirmadas (texto real,
 * testado ao vivo, cada uma com conteúdo distinto - não é o mesmo texto
 * sob etiquetas diferentes):
 *  - NVI  (Nova Versão Internacional)      -> Bible ID 129
 *  - NBV  (Nova Bíblia Viva)                -> Bible ID 1966
 *  - OL   (O Livro, uma paráfrase)          -> Bible ID 1967
 *
 * RESTRIÇÃO CONTRATUAL IMPORTANTE (Seção III.B do contrato): o texto dessas
 * versões NÃO PODE ser usado como entrada para produzir conteúdo
 * personalizado via inteligência artificial / machine learning. Por isso,
 * em bibleVersions.jsx, toda versão servida por este provider tem
 * `aiEnabled: false` - os recursos de IA do app (Estudo Bíblico gerado,
 * etc.) ficam desativados quando o usuário está usando NVI/NBV/OL. Essa é
 * uma decisão explícita do usuário (dono do app), não uma limitação
 * técnica: ele preferiu ganhar essas versões reais e desativar IA nelas do
 * que arriscar violar o contrato.
 *
 * Também há um limite de exibição simultânea (Seção V.F): no máximo 2
 * capítulos ou 25 versículos por usuário ao mesmo tempo - compatível com a
 * UI atual do app, que já mostra só um capítulo por vez.
 *
 * DETALHE TÉCNICO - por que este provider busca versículo por versículo:
 * a API da YouVersion Platform, quando pedimos um CAPÍTULO inteiro
 * (`/passages/{LIVRO}.{capitulo}`), devolve um único bloco de texto (uma
 * string só, sem marcação de onde cada versículo começa/termina). Isso não
 * serve para o modelo de dados do app, que precisa de um array
 * `{ n, text }` por versículo (ver abibliaBibleProvider.jsx e
 * getBibleProvider.jsx). Já o endpoint de VERSÍCULO individual
 * (`/passages/{LIVRO}.{capitulo}.{versiculo}`) devolve texto limpo por
 * versículo. Testado ao vivo: buscar até 36 versículos em paralelo leva
 * menos de 1 segundo e nenhum erro/limite de taxa. Por isso este provider
 * busca os versículos de um capítulo em paralelo, em blocos de 30, até
 * encontrar o fim real do capítulo - sem precisar de uma tabela fixa de
 * "quantos versículos tem cada capítulo" (que poderia divergir por edição).
 *
 * Um único versículo "faltando" NO MEIO de um bloco (ex.: algumas edições
 * não trazem Mateus 17:21 ou Atos 8:37, por tradição de manuscrito, mas
 * mantêm a numeração tradicional) é tratado como versículo omitido nesta
 * edição - pulado, sem interromper a busca. Só quando um bloco inteiro de
 * 30 números seguidos não retorna nenhum versículo real é que o capítulo é
 * considerado terminado. Isso evita cortar o capítulo pela metade por causa
 * de uma omissão pontual.
 */

import { getUsfmBookCode } from './bookCodes';

const API_BASE = 'https://api.youversion.com/v1';
const APP_KEY = 'wxEHM0obmhkYGFtRA2G0pAxKjiwS2OIYJGDIIcI9TYUshsSR';

/**
 * Versões do app -> Bible ID da YouVersion Platform. Só entram aqui
 * versões REALMENTE testadas e confirmadas (texto real, distinto, em
 * português) - nunca um "chute" de ID.
 */
const BIBLE_ID_MAP = {
  'NVI': 129,
  'NBV': 1966,
  'OL': 1967,
};

/** Indica se uma versão do app é servida por este provider. */
export function isYouVersionVersion(versionCode) {
  return Object.prototype.hasOwnProperty.call(BIBLE_ID_MAP, versionCode);
}

/**
 * Limpa o texto de um versículo vindo da API (remove espaços/whitespace
 * redundante e qualquer marcação HTML residual, defensivamente - o
 * parâmetro format=text já pede texto puro, mas nunca confiamos cegamente
 * numa API externa).
 */
function cleanVerseText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca um bloco de versículos (start..start+count-1) em paralelo.
 * Retorna um array na MESMA ordem de start..start+count-1, cada item
 * `{ n, exists, text? }`. Lança erro real (nunca finge sucesso) se algum
 * versículo responder com status inesperado (rate limit, erro de servidor
 * etc.) - só 404 é tratado como "versículo não existe".
 */
async function fetchVerseBlock(bibleId, usfmBook, chapter, startVerse, count, signal) {
  const numbers = Array.from({ length: count }, (_, i) => startVerse + i);

  return Promise.all(numbers.map(async (n) => {
    const url = `${API_BASE}/bibles/${bibleId}/passages/${usfmBook}.${chapter}.${n}?format=text`;
    const response = await fetch(url, {
      signal,
      headers: { 'X-YVP-App-Key': APP_KEY }
    });

    if (response.status === 404) {
      return { n, exists: false };
    }

    if (response.status === 429) {
      const error = new Error('Limite de requisicoes da YouVersion Platform excedido, tente novamente em alguns minutos');
      error.code = 'RATE_LIMIT';
      error.status = 'HTTP_429';
      throw error;
    }

    if (response.status === 401 || response.status === 403) {
      const error = new Error('Chave de acesso da YouVersion Platform invalida ou sem permissao para esta Biblia');
      error.code = 'UNAUTHORIZED';
      error.status = `HTTP_${response.status}`;
      throw error;
    }

    if (response.status >= 500) {
      const error = new Error('Erro interno da YouVersion Platform, tente novamente');
      error.code = 'SERVER_ERROR';
      error.status = `HTTP_${response.status}`;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`Erro ao carregar ${usfmBook} ${chapter}:${n} da YouVersion Platform (status ${response.status})`);
      error.code = 'HTTP_ERROR';
      error.status = `HTTP_${response.status}`;
      throw error;
    }

    const data = await response.json();
    const text = cleanVerseText(data?.content);

    if (!text) {
      return { n, exists: false };
    }

    return { n, exists: true, text };
  }));
}

/**
 * Busca um capítulo real via YouVersion Platform, montando o array
 * { n, text }[] a partir de buscas paralelas por versículo (ver
 * explicação no topo do arquivo).
 */
export async function fetchChapterFromYouVersion(versionCode, bookKey, chapter, signal, logData) {
  const bibleId = BIBLE_ID_MAP[versionCode];

  if (!bibleId) {
    const error = new Error(`Sem fonte real conhecida pra versao "${versionCode}" na YouVersion Platform`);
    error.code = 'VERSION_UNAVAILABLE';
    throw error;
  }

  const usfmBook = getUsfmBookCode(bookKey);

  if (!usfmBook) {
    const error = new Error(`Livro nao reconhecido: ${bookKey}`);
    error.code = 'UNKNOWN_BOOK';
    throw error;
  }

  const CHUNK_SIZE = 30;
  const MAX_VERSE = 180; // maior capitulo da Biblia (Salmos 119) tem 176 versiculos
  const t0 = performance.now();
  const verses = [];

  try {
    let cursor = 1;

    while (cursor <= MAX_VERSE) {
      const block = await fetchVerseBlock(bibleId, usfmBook, chapter, cursor, CHUNK_SIZE, signal);

      let lastExistIdx = -1;
      block.forEach((item, idx) => {
        if (item.exists) lastExistIdx = idx;
      });

      if (lastExistIdx === -1) {
        // Nenhum versiculo real neste bloco inteiro - capitulo terminou antes daqui.
        break;
      }

      for (let idx = 0; idx <= lastExistIdx; idx++) {
        if (block[idx].exists) {
          verses.push({ n: block[idx].n, text: block[idx].text });
        }
        // Versiculo ausente NO MEIO do bloco (antes do ultimo real) = omitido
        // nesta edicao (ver comentario no topo do arquivo) - pulado, nunca
        // inventado.
      }

      if (lastExistIdx < block.length - 1) {
        // Bloco terminou com uma sequencia de versiculos inexistentes ate o
        // fim - capitulo realmente terminou.
        break;
      }

      cursor += CHUNK_SIZE;
    }
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);
    if (logData) {
      logData.provider = 'youversion';
      logData.bibleId = bibleId;
      logData.timeMs = timeMs;
      logData.error = error.code || 'ERR_NETWORK';
    }
    console.log(`BIBLELOG source=youversion version=${versionCode} bibleId=${bibleId} book=${usfmBook} chapter=${chapter} status=ERROR error=${error.code || 'ERR_NETWORK'} timeMs=${timeMs} verses=0 cacheHit=none`);
    throw error;
  }

  if (verses.length === 0) {
    const error = new Error(`YouVersion Platform retornou capitulo vazio: ${bookKey} ${chapter}`);
    error.code = 'EMPTY';
    throw error;
  }

  const timeMs = Math.round(performance.now() - t0);

  if (logData) {
    logData.provider = 'youversion';
    logData.bibleId = bibleId;
    logData.status = 200;
    logData.timeMs = timeMs;
    logData.verses = verses.length;
  }

  console.log(`BIBLELOG source=youversion version=${versionCode} bibleId=${bibleId} book=${usfmBook} chapter=${chapter} status=200 error=NONE timeMs=${timeMs} verses=${verses.length} cacheHit=none`);

  return {
    version: versionCode,
    book: bookKey,
    chapter: parseInt(chapter, 10),
    verses
  };
}
