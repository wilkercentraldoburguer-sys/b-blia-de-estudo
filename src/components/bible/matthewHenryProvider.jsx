/**
 * Provider para comentário bíblico REAL e de domínio público: Matthew
 * Henry's Complete Commentary (escrito entre 1706-1721, sem restrição de
 * direitos autorais), servido pela API pública e gratuita bible.helloao.org
 * (sem necessidade de token). https://bible.helloao.org/docs/
 *
 * IMPORTANTE: ao contrário do "comentário inspirado no estilo de" gerado
 * por IA usado para os demais nomes em Study.jsx, este provider busca o
 * texto LITERAL que Matthew Henry realmente escreveu. Se a API não tiver
 * um comentário exato para o versículo pedido, a função retorna null -
 * nunca inventa ou completa a lacuna com texto gerado.
 */

import { getUsfmBookCode } from './bookCodes';
import { getBookKey } from './bibleUtils';

const API_BASE = 'https://bible.helloao.org/api/c/matthew-henry';
const SOURCE_LABEL = "Matthew Henry's Complete Commentary (domínio público)";

/**
 * Busca o comentário real de Matthew Henry para um versículo específico.
 * bookName pode ser o nome de exibição (ex.: "João") ou já a chave interna
 * (ex.: "joao") - ambos passam por getBookKey().
 *
 * Retorna { texto, fonte, url } em caso de sucesso, ou null se não houver
 * mapeamento de livro, a API falhar, ou não existir comentário para esse
 * versículo específico.
 */
export async function fetchMatthewHenryCommentary(bookName, chapter, verse) {
  const bookKey = getBookKey(bookName);
  const usfmCode = getUsfmBookCode(bookKey);
  if (!usfmCode || !chapter) return null;

  const url = `${API_BASE}/${usfmCode}/${chapter}.json`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    // Sem conexão ou API fora do ar - falha silenciosa, quem chamou decide
    // o que exibir (nunca cai para texto fabricado no lugar).
    return null;
  }

  if (!response.ok) return null;

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    return null;
  }

  const items = data?.chapter?.content || [];

  // Matthew Henry costuma agrupar vários versículos num único bloco de
  // comentário, indexado apenas pelo número do PRIMEIRO versículo do bloco
  // (ex.: um bloco pode cobrir os vv. 1-21, indexado só como number:1, e o
  // próximo bloco começa em number:22) - não existe um campo explícito de
  // "fim do intervalo" na API. Por isso buscamos o último bloco cujo número
  // inicial é <= o versículo pedido, entre os itens do tipo "verse".
  const verseItems = (items || [])
    .filter((item) => item && item.type === 'verse' && typeof item.number === 'number')
    .sort((a, b) => a.number - b.number);

  let match = null;
  for (const item of verseItems) {
    if (item.number <= verse) {
      match = item;
    } else {
      break;
    }
  }

  if (!match) return null;

  const texto = (match.content || [])
    .filter((part) => typeof part === 'string')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!texto) return null;

  return {
    texto,
    fonte: SOURCE_LABEL,
    url,
    // Número do versículo em que o bloco de comentário realmente começa -
    // pode ser menor que o versículo pedido, já que Matthew Henry costuma
    // comentar um grupo de versículos de uma vez. Quem exibe pode usar isso
    // pra avisar quando o comentário cobre um trecho maior.
    versiculoInicioBloco: match.number
  };
}
