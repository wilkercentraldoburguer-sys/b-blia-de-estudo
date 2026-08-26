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
 * texto oficial do app depois de ver esse problema. King James (KJV,
 * inglês) continua disponível, também com texto real e completo (domínio
 * público, via getbible.net).
 *
 * ARA, ARC, NVI, ACF e NAA continuam listadas (pra não sumir da tela sem
 * explicação, já que o usuário via elas antes), mas desabilitadas: não
 * encontramos fonte gratuita e legal pro texto COMPLETO delas - usar uma
 * versão comercial protegida por direitos autorais sem licença é o mesmo
 * problema que já bloqueava NVT e NTLH, só que agora aplicado de forma
 * consistente a todas as versões sem fonte real.
 */
export const BIBLE_VERSIONS = [
  { sigla: "AA", nome: "Almeida Revisada" },
  { sigla: "KJV", nome: "King James Version" },
  { sigla: "ARA", nome: "Almeida Revista e Atualizada", indisponivel: true },
  { sigla: "ARC", nome: "Almeida Revista e Corrigida", indisponivel: true },
  { sigla: "NVI", nome: "Nova Versão Internacional", indisponivel: true },
  { sigla: "NVT", nome: "Nova Versão Transformadora", indisponivel: true },
  { sigla: "ACF", nome: "Almeida Corrigida Fiel", indisponivel: true },
  { sigla: "NAA", nome: "Nova Almeida Atualizada", indisponivel: true },
  { sigla: "NTLH", nome: "Nova Tradução na Linguagem de Hoje", indisponivel: true }
];

/** Siglas das versões sem fonte gratuita/legal - útil pra checagens rápidas. */
export const UNAVAILABLE_VERSION_CODES = BIBLE_VERSIONS
  .filter(v => v.indisponivel)
  .map(v => v.sigla);

/** Versão padrão do app: a única em português com texto real e completo. */
export const DEFAULT_BIBLE_VERSION = "AA";
