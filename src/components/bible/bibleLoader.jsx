import { getBookKey } from './bibleUtils';
import { base44 } from '@/api/base44Client';

// Cache em memória (LRU - últimos 3 capítulos)
let memoryCache = {};
const MAX_MEMORY_CACHE = 3;

// Storage key para cache persistente
const STORAGE_KEY = 'bible_chapters_cache';
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
 * Salva capítulo no cache persistente
 */
async function saveToPersistentCache(key, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    
    // Limitar a 100 capítulos no persistente
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      // Remover 20 mais antigos
      const sorted = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
      sorted.slice(0, 20).forEach(k => delete cache[k]);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Erro ao salvar cache persistente:', error);
  }
}

/**
 * Busca capítulo do cache persistente
 */
function getFromPersistentCache(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const cached = cache[key];
    if (cached) {
      console.log(`✅ Cache HIT (persistente): ${key}`);
      return cached.data;
    }
  } catch (error) {
    console.warn('Erro ao ler cache persistente:', error);
  }
  return null;
}

/**
 * Busca capítulo via LLM (fonte de dados)
 */
async function fetchFromLLM(version, bookKey, chapter, bookName) {
  console.log(`🌐 Buscando via LLM: ${bookName} ${chapter} (${version})`);
  
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Retorne o texto bíblico completo de ${bookName} capítulo ${chapter} na versão ${version} em português.

IMPORTANTE: Retorne TODOS os versículos do capítulo ${chapter} de ${bookName}.

Formato JSON obrigatório:
{
  "verses": [
    {"n": 1, "text": "texto do versículo 1"},
    {"n": 2, "text": "texto do versículo 2"},
    ...
  ]
}

Regras:
- verses[] deve conter TODOS os versículos do capítulo
- Cada item tem "n" (número) e "text" (texto completo)
- NÃO incluir números de versículos dentro do texto
- NÃO adicionar comentários ou explicações
- APENAS o texto bíblico puro`,
    response_json_schema: {
      type: "object",
      properties: {
        verses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              n: { type: "integer" },
              text: { type: "string" }
            },
            required: ["n", "text"]
          }
        }
      },
      required: ["verses"]
    }
  });
  
  if (!response?.verses || response.verses.length === 0) {
    throw new Error('LLM retornou resposta vazia');
  }
  
  return {
    version,
    book: bookKey,
    chapter,
    verses: response.verses
  };
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
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...stats,
      cachedChapters: Object.keys(cache).length
    };
  } catch (e) {
    return { cachedChapters: 0, total: 0 };
  }
}

/**
 * Carrega capítulo com estratégia cache-first
 */
export async function fetchChapterFromJSON(version, bookName, chapter, signal) {
  const bookKey = getBookKey(bookName);
  const cacheKey = `${version}|${bookKey}|${chapter}`;
  
  console.log(`🔍 QUERY: version="${version}", book="${bookName}" → "${bookKey}", chapter=${chapter}`);
  
  // 1. Cache memória (instantâneo < 10ms)
  const memCached = getFromMemoryCache(cacheKey);
  if (memCached) {
    updateStats('memory');
    return memCached;
  }
  
  // 2. Cache persistente (rápido < 100ms)
  const persistCached = getFromPersistentCache(cacheKey);
  if (persistCached) {
    saveToMemoryCache(cacheKey, persistCached);
    updateStats('persistent');
    return persistCached;
  }
  
  // 3. Dados inline (João 1-4)
  const inlineData = INLINE_DATA[cacheKey];
  if (inlineData) {
    console.log(`✅ Dados inline: ${inlineData.verses.length} versículos`);
    saveToMemoryCache(cacheKey, inlineData);
    await saveToPersistentCache(cacheKey, inlineData);
    updateStats('inline');
    return inlineData;
  }
  
  // 4. Buscar via LLM e cachear permanentemente
  console.log(`⚠️ Cache miss completo - Buscando via LLM`);
  
  const data = await fetchFromLLM(version, bookKey, chapter, bookName);
  
  // Verificar se foi cancelado
  if (signal?.aborted) {
    throw new Error('Carregamento cancelado');
  }
  
  console.log(`✅ LLM retornou: ${data.verses.length} versículos`);
  
  // Salvar nos caches (permanentemente)
  saveToMemoryCache(cacheKey, data);
  await saveToPersistentCache(cacheKey, data);
  updateStats('llm');
  
  return data;
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
      if (!getFromMemoryCache(cacheKey) && !getFromPersistentCache(cacheKey)) {
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
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cache limpo');
}