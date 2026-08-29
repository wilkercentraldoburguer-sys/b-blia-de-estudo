import { getBookKey } from './bibleUtils';
import { fetchChapterFromAPI } from './abibliaBibleProvider';
import { fetchChapterFromGetBible } from './getBibleProvider';
import { fetchChapterFromYouVersion, isYouVersionVersion } from './youVersionProvider';
import { getChapter, saveChapterToCache } from './BibleRepository';
import { getAbibliaBookCode } from './bookCodes';
import { hasAPIToken } from './apiTokenManager';

// Cache em memória (LRU - últimos 3 capítulos)
let memoryCache = {};
const MAX_MEMORY_CACHE = 3;

// Storage key para cache persistente (estruturado)
const CACHE_PREFIX = 'data_cache';
const STATS_KEY = 'bible_loader_stats';

/**
 * Dados bíblicos inline (João 1-4 ARA)
 */
const INLINE_DATA = {
  'ARA|joao|1': {
    version: 'ARA',
    book: 'joao',
    chapter: 1,
    verses: [
      { n: 1, text: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
      { n: 2, text: 'Ele estava no princípio com Deus.' },
      { n: 3, text: 'Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez.' },
      { n: 4, text: 'A vida estava nele e a vida era a luz dos homens.' },
      { n: 5, text: 'A luz resplandece nas trevas, e as trevas não prevaleceram contra ela.' }
    ]
  },
  'ARA|joao|2': {
    version: 'ARA',
    book: 'joao',
    chapter: 2,
    verses: [
      { n: 1, text: 'Três dias depois, houve um casamento em Caná da Galiléia, achando-se ali a mãe de Jesus.' },
      { n: 2, text: 'Jesus também foi convidado, com os seus discípulos, para o casamento.' },
      { n: 3, text: 'Tendo acabado o vinho, a mãe de Jesus lhe disse: Eles não têm mais vinho.' },
      { n: 4, text: 'Mas Jesus lhe respondeu: Mulher, que tenho eu contigo? Ainda não é chegada a minha hora.' },
      { n: 5, text: 'Então, ela disse aos serventes: Fazei tudo o que ele vos disser.' }
    ]
  },
  'ARA|joao|3': {
    version: 'ARA',
    book: 'joao',
    chapter: 3,
    verses: [
      { n: 1, text: 'Havia, entre os fariseus, um homem chamado Nicodemos, um dos principais dos judeus.' },
      { n: 2, text: 'Este, de noite, foi ter com Jesus e lhe disse: Rabi, sabemos que és mestre vindo da parte de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele.' },
      { n: 3, text: 'A isto, respondeu Jesus: Em verdade, em verdade te digo que, se alguém não nascer de novo, não pode ver o reino de Deus.' },
      { n: 4, text: 'Perguntou-lhe Nicodemos: Como pode um homem nascer, sendo velho? Pode, porventura, voltar ao ventre materno e nascer segunda vez?' },
      { n: 5, text: 'Respondeu Jesus: Em verdade, em verdade te digo: quem não nascer da água e do Espírito não pode entrar no reino de Deus.' },
      { n: 6, text: 'O que é nascido da carne é carne; e o que é nascido do Espírito é espírito.' },
      { n: 7, text: 'Não te admires de eu te dizer: importa-vos nascer de novo.' },
      { n: 8, text: 'O vento sopra onde quer, ouves a sua voz, mas não sabes donde vem, nem para onde vai; assim é todo o que é nascido do Espírito.' },
      { n: 9, text: 'Então, lhe perguntou Nicodemos: Como pode suceder isto?' },
      { n: 10, text: 'Acudiu Jesus: Tu és mestre em Israel e não compreendes estas coisas?' },
      { n: 11, text: 'Em verdade, em verdade te digo que nós dizemos o que sabemos e testificamos o que temos visto; contudo, não aceitais o nosso testemunho.' },
      { n: 12, text: 'Se, tratando de coisas terrenas, não me credes, como crereis, se vos falar das celestiais?' },
      { n: 13, text: 'Ora, ninguém subiu ao céu, senão aquele que de lá desceu, a saber, o Filho do Homem que está no céu.' },
      { n: 14, text: 'E do modo por que Moisés levantou a serpente no deserto, assim importa que o Filho do Homem seja levantado,' },
      { n: 15, text: 'para que todo o que nele crê tenha a vida eterna.' },
      { n: 16, text: 'Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.' },
      { n: 17, text: 'Porquanto Deus enviou o seu Filho ao mundo, não para que julgasse o mundo, mas para que o mundo fosse salvo por ele.' },
      { n: 18, text: 'Quem nele crê não é julgado; o que não crê já está julgado, porquanto não crê no nome do unigênito Filho de Deus.' },
      { n: 19, text: 'O julgamento é este: que a luz veio ao mundo, e os homens amaram mais as trevas do que a luz; porque as suas obras eram más.' },
      { n: 20, text: 'Pois todo aquele que pratica o mal aborrece a luz e não se chega para a luz, a fim de não serem argüidas as suas obras.' },
      { n: 21, text: 'Quem pratica a verdade aproxima-se da luz, a fim de que as suas obras sejam manifestas, porque feitas em Deus.' },
      { n: 22, text: 'Depois disto, foi Jesus com os seus discípulos para a terra da Judéia; e ali demorou-se com eles e batizava.' },
      { n: 23, text: 'Ora, João estava também batizando em Enom, perto de Salim, porque havia ali muitas águas; e o povo vinha e era batizado.' },
      { n: 24, text: 'Pois João ainda não tinha sido encarcerado.' },
      { n: 25, text: 'Então, levantou-se uma discussão entre os discípulos de João e um judeu acerca da purificação.' },
      { n: 26, text: 'E foram ter com João e lhe disseram: Mestre, aquele que estava contigo além do Jordão, do qual tens dado testemunho, está batizando, e todos lhe saem ao encontro.' },
      { n: 27, text: 'Respondeu João: O homem não pode receber coisa alguma se do céu não lhe for dada.' },
      { n: 28, text: 'Vós mesmos sois testemunhas de que vos disse: eu não sou o Cristo, mas fui enviado como seu precursor.' },
      { n: 29, text: 'O que tem a noiva é o noivo; o amigo do noivo que está presente e o ouve muito se regozija por causa da voz do noivo. Pois esta alegria já se cumpriu em mim.' },
      { n: 30, text: 'Convém que ele cresça e que eu diminua.' },
      { n: 31, text: 'Aquele que vem de cima está acima de todos; aquele que vem da terra é terreno e fala da terra; aquele que vem do céu está acima de todos.' },
      { n: 32, text: 'Aquilo que ele tem visto e ouvido, isso testifica; contudo, ninguém aceita o seu testemunho.' },
      { n: 33, text: 'Aquele que aceita o seu testemunho, esse confirma que Deus é verdadeiro.' },
      { n: 34, text: 'Pois o enviado de Deus fala as palavras dele, porque Deus não dá o Espírito por medida.' },
      { n: 35, text: 'O Pai ama ao Filho, e todas as coisas tem confiado às suas mãos.' },
      { n: 36, text: 'Por isso, quem crê no Filho tem a vida eterna; o que, todavia, se mantém rebelde contra o Filho não verá a vida, mas sobre ele permanece a ira de Deus.' }
    ]
  },
  'ARA|joao|4': {
    version: 'ARA',
    book: 'joao',
    chapter: 4,
    verses: [
      { n: 1, text: 'Quando, pois, o Senhor veio a saber que os fariseus tinham ouvido dizer que ele, Jesus, fazia e batizava mais discípulos que João' },
      { n: 2, text: '(se bem que Jesus mesmo não batizava, e sim os seus discípulos),' },
      { n: 3, text: 'deixou a Judéia, retirando-se outra vez para a Galiléia.' },
      { n: 4, text: 'E era-lhe necessário atravessar a província de Samaria.' },
      { n: 5, text: 'Chegou, pois, a uma cidade samaritana, chamada Sicar, perto das terras que Jacó dera a seu filho José.' }
    ]
  }
};

/**
 * Salva capítulo no cache de memória (LRU)
 */
function saveToMemoryCache(key, data) {
  const keys = Object.keys(memoryCache);
  
  // LRU: remover mais antigo se exceder limite
  if (keys.length >= MAX_MEMORY_CACHE && !memoryCache[key]) {
    const oldestKey = keys[0];
    delete memoryCache[oldestKey];
  }
  
  memoryCache[key] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Busca capítulo do cache de memória
 */
function getFromMemoryCache(key) {
  const cached = memoryCache[key];
  if (cached) {
    console.log(`✅ Cache HIT (memória): ${key}`);
    return cached.data;
  }
  return null;
}

/**
 * Cache persistente estruturado por versão/livro/capítulo
 */
function getFromPersistentCache(version, bookKey, chapter) {
  try {
    const storageKey = `${CACHE_PREFIX}/${version}/${bookKey}/${chapter}`;
    const cached = localStorage.getItem(storageKey);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Erro ao ler cache persistente:', e);
    return null;
  }
}

async function saveToPersistentCache(version, bookKey, chapter, data) {
  try {
    const storageKey = `${CACHE_PREFIX}/${version}/${bookKey}/${chapter}`;
    const jsonData = JSON.stringify(data);
    const sizeKB = (jsonData.length / 1024).toFixed(2);
    
    localStorage.setItem(storageKey, jsonData);
    
    console.log(`💾 Saved cache key: ${storageKey}`);
    console.log(`   Payload size: ${sizeKB} KB`);
  } catch (e) {
    console.error('Erro ao salvar cache persistente:', e);
  }
}

/**
 * Atualiza estatísticas de cache
 */
function updateStats(source) {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    stats[source] = (stats[source] || 0) + 1;
    stats.total = (stats.total || 0) + 1;
    stats.lastUpdate = new Date().toISOString();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    // Ignore stats errors
  }
}

/**
 * Obtém estatísticas de cache
 */
export function getCacheStats() {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    
    // Contar capítulos em cache estruturado
    let cachedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(CACHE_PREFIX + '/')) {
        cachedCount++;
      }
    }
    
    return {
      ...stats,
      cachedChapters: cachedCount
    };
  } catch (e) {
    return { cachedChapters: 0, total: 0 };
  }
}

/**
 * Carrega capítulo com estratégia cache-first
 * REGRA: NUNCA usa LLM para o texto biblico - apenas cache local, dataset
 * estático, a API oficial da YouVersion Platform (para as versões
 * licenciadas via contrato Biblica), a API real da ABíbliaDigital (quando
 * há token) ou a API pública getbible.net. O texto sagrado nunca é
 * "gerado"; é sempre buscado de uma fonte real.
 *
 * Ordem: memória -> localStorage -> dataset estático (/bible/...)
 *        -> YouVersion Platform (só para NVI/NBV/OL - ver
 *           youVersionProvider.jsx; fonte real e licenciada específica
 *           dessas versões, tentada antes de qualquer fallback genérico)
 *        -> ABíbliaDigital (se houver token configurado, melhor qualidade/versão)
 *        -> getbible.net (fallback público, sem token, sempre disponível;
 *           serve KJA (King James real em inglês) e Almeida 1911 real em
 *           português)
 * Exceção: a versão "NVT" não tem nenhuma fonte gratuita/legal conhecida,
 * então getbible.net recusa o pedido com um erro claro (VERSION_UNAVAILABLE)
 * em vez de servir outra tradução silenciosamente com a etiqueta "NVT".
 * O resultado das APIs é salvo no cache local para as próximas leituras.
 */
export async function fetchChapterFromJSON(version, bookName, chapter, signal) {
  try {
    return await getChapter(version, bookName, chapter);
  } catch (repositoryError) {
    // Dataset estático não tem esse capítulo (ou rota não servida) - buscar numa API real
    const bookKey = getBookKey(bookName);

    // Versões liberadas via YouVersion Platform (NVI, NBV, OL) têm uma
    // fonte real e licenciada específica pra elas - tentamos essa fonte
    // primeiro, antes de qualquer fallback genérico, pra sempre pegar o
    // texto certo dessas traduções (nunca cair no Almeida 1911 do
    // getbible.net sob a etiqueta "NVI", por exemplo).
    if (isYouVersionVersion(version)) {
      try {
        const data = await fetchChapterFromYouVersion(version, bookKey, chapter, signal);
        saveChapterToCache(version, bookName, chapter, data);
        return data;
      } catch (youVersionError) {
        console.warn('YouVersion Platform indisponível, tentando fallback:', youVersionError.message);
      }
    }

    // Se houver token da ABíbliaDigital configurado, tenta primeiro (texto
    // mais fiel à versão escolhida e ortografia atual).
    if (hasAPIToken()) {
      try {
        const apiBookCode = getAbibliaBookCode(bookKey);
        const data = await fetchChapterFromAPI(version, apiBookCode, chapter, signal);
        saveChapterToCache(version, bookName, chapter, data);
        return data;
      } catch (tokenApiError) {
        // Token inválido, indisponível ou limite excedido: cai para o
        // fallback público abaixo em vez de falhar a leitura inteira.
        console.warn('ABíbliaDigital indisponível, usando getbible.net como fallback:', tokenApiError.message);
      }
    }

    try {
      const data = await fetchChapterFromGetBible(bookKey, chapter, signal, undefined, version);
      saveChapterToCache(version, bookName, chapter, data);
      return data;
    } catch (apiError) {
      // Se a API também falhar, propaga o erro original do dataset (mais informativo)
      // a menos que o erro da API seja mais específico (ex: capítulo inexistente)
      throw apiError.code && apiError.code !== 'ERR_NETWORK' ? apiError : repositoryError;
    }
  }
}

/**
 * Download de um livro completo para offline
 * Usa a mesma cadeia confiável de fetchChapterFromJSON (dataset -> ABíbliaDigital
 * com token, se houver -> getbible.net), então funciona mesmo sem token.
 */
export async function downloadBookOffline(version, bookName, totalChapters, onProgress) {
  const bookKey = getBookKey(bookName);
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  console.log(`📥 Iniciando download offline: ${bookName} (${totalChapters} capítulos)`);

  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    try {
      const data = await fetchChapterFromJSON(version, bookName, chapter);
      await saveToPersistentCache(version, bookKey, chapter, data);
      
      results.success++;
      
      if (onProgress) {
        onProgress({
          current: chapter,
          total: totalChapters,
          percentage: (chapter / totalChapters) * 100
        });
      }
      
      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.failed++;
      results.errors.push({
        chapter,
        error: error.message
      });
      console.error(`Erro ao baixar ${bookName} ${chapter}:`, error);
    }
  }
  
  console.log(`✅ Download completo: ${results.success}/${totalChapters} capítulos salvos`);
  
  return results;
}

/**
 * Prefetch de capítulos adjacentes em background
 */
export function prefetchChapters(version, bookName, currentChapter, totalChapters) {
  const bookKey = getBookKey(bookName);
  
  // Prefetch capítulo +1 e +2
  [currentChapter + 1, currentChapter + 2].forEach((nextChapter, index) => {
    if (nextChapter <= totalChapters) {
      const cacheKey = `${version}|${bookKey}|${nextChapter}`;
      
      // Só fazer prefetch se não estiver em cache
      if (!getFromMemoryCache(cacheKey) && !getFromPersistentCache(version, bookKey, nextChapter)) {
        setTimeout(() => {
          console.log(`⚡ Prefetch: ${bookName} ${nextChapter}`);
          
          const data = INLINE_DATA[cacheKey];
          if (data) {
            saveToMemoryCache(cacheKey, data);
            saveToPersistentCache(cacheKey, data);
            console.log(`✅ Prefetch completo: ${bookName} ${nextChapter}`);
          } else {
            console.log(`⚠️ Prefetch: capítulo não disponível (${bookName} ${nextChapter})`);
          }
        }, 500 * (index + 1)); // Stagger prefetch
      }
    }
  });
}

/**
 * Limpa cache
 */
export function clearCache() {
  memoryCache = {};
  
  // Limpar cache estruturado
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(CACHE_PREFIX + '/')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`🗑️ Cache limpo (${keysToRemove.length} capítulos removidos)`);
}