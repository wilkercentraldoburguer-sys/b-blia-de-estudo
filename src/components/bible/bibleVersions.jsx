/**
 * Lista única de versões da Bíblia oferecidas pelo app - fonte de verdade
 * compartilhada por VerseSelector.jsx, Bible.jsx, Study.jsx e Profile.jsx
 * (antes cada um tinha sua própria cópia divergente dessa lista).
 *
 * Contexto (25/08/2026): o app nunca teve um dataset bíblico próprio
 * publicado. Então, pra QUALQUER versão em português selecionada (ARA,
 * ARC, NVI, ACF, NAA), o texto caía no fallback público getbible.net, que
 * só tem uma tradução real em português: a Almeida de 1911 (ortografia
 * antiga, tipo "phariseos" em vez de "fariseus", sem títulos de seção) -
 * e esse texto de 1911 era mostrado com a etiqueta de qualquer versão
 * escolhida, o que é enganoso.
 *
 * Correção: publicamos um dataset local completo (66 livros, 1189
 * capítulos, /public/bible/aa) com o texto real da Almeida Revisada (AA -
 * Imprensa Bíblica Brasileira), que é a versão que o usuário escolheu como
 * texto oficial do app depois de ver esse problema. King James (inglês)
 * continua disponível, também com texto real e completo (domínio público,
 * via getbible.net).
 *
 * ATUALIZAÇÃO (26/08/2026) - duas decisões conscientes do usuário depois de
 * eu explicar os riscos de cada uma; nenhuma das duas é uma recomendação
 * minha:
 *
 * 1) A sigla do King James (texto real em inglês) foi trocada de "KJV"
 *    para "KJA" a pedido do usuário. IMPORTANTE: é só troca de etiqueta -
 *    o texto continua sendo o King James Version em inglês, não é a "King
 *    James Atualizada" real (tradução comercial brasileira, vendida por
 *    editora própria; não encontramos fonte gratuita/legal pra ela). O
 *    usuário foi avisado dessa diferença e pediu a troca da sigla mesmo
 *    assim.
 *
 * 2) NVI e ACF voltaram a ficar disponíveis, com dataset local completo
 *    (66 livros, 1189 capítulos cada - /public/bible/nvi e
 *    /public/bible/acf, mesmo projeto de origem usado pra AA).
 *    RESSALVA DE DIREITOS AUTORAIS: o próprio projeto de origem avisa, na
 *    licença dele, que os direitos autorais dessas traduções continuam
 *    sendo da Sociedade Bíblica Internacional (NVI) e da Sociedade
 *    Bíblica Trinitariana (ACF) - não há autorização delas pra essa
 *    redistribuição. O usuário decidiu aceitar esse risco de forma
 *    consciente depois de eu explicar isso; não sou advogado e não estou
 *    afirmando que isso é permitido.
 *
 * ARA, ARC, NVT, NAA e NTLH continuam listadas (pra não sumir da tela sem
 * explicação, já que o usuário via elas antes), mas desabilitadas: pra
 * essas, diferente de NVI/ACF, não encontramos NENHUM texto completo em
 * lugar nenhum (nem com risco de direitos autorais) - o problema não é
 * licença, é que o texto simplesmente não foi localizado.
 */
export const BIBLE_VERSIONS = [
  { sigla: "AA", nome: "Almeida Revisada" },
  { sigla: "KJA", nome: "King James Version" },
  { sigla: "NVI", nome: "Nova Versão Internacional" },
  { sigla: "ACF", nome: "Almeida Corrigida Fiel" },
  { sigla: "ARA", nome: "Almeida Revista e Atualizada", indisponivel: true },
  { sigla: "ARC", nome: "Almeida Revista e Corrigida", indisponivel: true },
  { sigla: "NVT", nome: "Nova Versão Transformadora", indisponivel: true },
  { sigla: "NAA", nome: "Nova Almeida Atualizada", indisponivel: true },
  { sigla: "NTLH", nome: "Nova Tradução na Linguagem de Hoje", indisponivel: true }
];

/** Siglas das versões sem fonte gratuita/legal - útil pra checagens rápidas. */
export const UNAVAILABLE_VERSION_CODES = BIBLE_VERSIONS
  .filter(v => v.indisponivel)
  .map(v => v.sigla);

/** Versão padrão do app: a única em português com texto real e completo. */
export const DEFAULT_BIBLE_VERSION = "AA";
