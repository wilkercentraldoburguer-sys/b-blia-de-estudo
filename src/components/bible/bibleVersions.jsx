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
 * 2) NVI e ACF ganharam dataset local completo (66 livros, 1189 capítulos
 *    cada - /public/bible/nvi e /public/bible/acf, mesmo projeto de origem
 *    usado pra AA), com a mesma ressalva de direitos autorais das demais:
 *    o próprio projeto de origem avisa, na licença dele, que os direitos
 *    autorais dessas traduções continuam sendo da Sociedade Bíblica
 *    Internacional (NVI) e da Sociedade Bíblica Trinitariana (ACF) - não
 *    há autorização delas pra essa redistribuição. O usuário tinha
 *    decidido aceitar esse risco conscientemente depois de eu explicar
 *    isso (não sou advogado, não afirmei que é permitido), mas em
 *    26/08/2026 pediu pra deixar sem, por hora - então ACF continua
 *    marcada indisponível (ver item abaixo sobre NVI, que mudou de fonte).
 *
 * ATUALIZAÇÃO (29/08/2026) - NVI ganhou uma fonte REAL, legal e gratuita,
 * diferente da mencionada acima: a YouVersion Platform
 * (developers.youversion.com), programa oficial de licenciamento gratuito
 * de Bíblias para uso não-comercial. O usuário criou uma conta de
 * desenvolvedor, registrou este app e aceitou o "Biblica Fast-track Bible
 * License v1" (contrato real com a Biblica, Inc.). Isso também liberou
 * duas versões que o usuário nem tinha pedido originalmente, mas que
 * vieram "de brinde" no mesmo contrato, com texto real e distinto:
 *  - NBV (Nova Bíblia Viva)
 *  - OL  (O Livro, uma paráfrase)
 * Ver youVersionProvider.jsx para o provider e os detalhes técnicos.
 *
 * NOTA: a YouVersion Platform também tem uma edição "NVI 2011" separada
 * (Bible ID 4360, quase idêntica à NVI principal usada aqui, ID 129) - foi
 * deixada de fora da lista pra não confundir o usuário com duas entradas
 * quase iguais chamadas "NVI". Pode ser adicionada depois se o usuário
 * quiser.
 *
 * ATUALIZAÇÃO (29/08/2026) - tentativa de liberar ACF, ARA, ARC, NVT, NAA
 * e NTLH: buscamos o catálogo INTEIRO da YouVersion Platform (1.479
 * Bíblias, todos os idiomas, todos os publishers, ignorando licenciamento
 * já aceito) e confirmamos que nenhuma dessas 6 versões existe lá, sob
 * nenhuma etiqueta - são propriedade da Sociedade Bíblica do Brasil
 * (ACF/ARA/ARC/NAA/NTLH) e da Mundo Cristão (NVT), que não participam
 * desse programa de licenciamento gratuito. Continuam com `indisponivel:
 * true` porque, depois dessa busca exaustiva, seguimos sem NENHUMA fonte
 * real, gratuita e legal para o texto completo delas - em nenhum lugar
 * pesquisado até agora (api.bible, ABíbliaDigital, getbible.net, YouVersion
 * Platform, busca geral na web).
 *
 * Nessa mesma busca apareceu uma versão em português nova, sem relação com
 * a Biblica - a BLT (Bíblia Livre Para Todos, tradução independente do Dr.
 * Jonathan Gallagher, licença Creative Commons Atribuição-CompartilhaIgual
 * 4.0). Real, testada, Bíblia completa (66 livros), sem a restrição de IA
 * do contrato Biblica. Adicionada como mais uma opção - ver
 * youVersionProvider.jsx.
 *
 * POLÍTICA DE IA POR VERSÃO (campo `aiEnabled`, 29/08/2026): o contrato da
 * Biblica (Seção III.B) proíbe usar o texto licenciado (NVI, NBV, OL) como
 * entrada para produzir conteúdo personalizado via IA/machine learning.
 * Por decisão explícita do usuário ("Eu não teria problema de ter essas
 * versões da bíblia e não ter IA... deixar ativado somente para as versões
 * que tem essa liberação"), os recursos de IA do app (Estudo Bíblico
 * gerado, etc.) são desativados quando a versão ativa tem `aiEnabled:
 * false` - nunca desativados globalmente, só nas telas/fluxos onde o texto
 * dessa versão especificamente entraria no prompt da IA. AA e KJA são
 * texto de domínio público, sem essa restrição contratual, por isso ficam
 * com `aiEnabled: true`.
 *
 * ARA, ARC, NVT, NAA, NTLH e ACF continuam listadas (pra não sumir da tela
 * sem explicação, já que o usuário via elas antes), mas desabilitadas: pra
 * essas, não encontramos NENHUM texto completo em lugar nenhum (nem com
 * risco de direitos autorais, nem via YouVersion Platform) - o problema
 * não é licença, é que o texto simplesmente não foi localizado.
 */
export const BIBLE_VERSIONS = [
  { sigla: "AA", nome: "Almeida Revisada", aiEnabled: true },
  { sigla: "KJA", nome: "King James Version", aiEnabled: true },
  { sigla: "NVI", nome: "Nova Versão Internacional", aiEnabled: false, fonte: "YouVersion Platform (licença Biblica Fast-track)" },
  { sigla: "NBV", nome: "Nova Bíblia Viva", aiEnabled: false, fonte: "YouVersion Platform (licença Biblica Fast-track)" },
  { sigla: "OL", nome: "O Livro", aiEnabled: false, fonte: "YouVersion Platform (licença Biblica Fast-track)" },
  { sigla: "BLT", nome: "Bíblia Livre Para Todos", aiEnabled: true, fonte: "YouVersion Platform (Creative Commons BY-SA 4.0)" },
  { sigla: "ACF", nome: "Almeida Corrigida Fiel", indisponivel: true },
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

/** Siglas das versões disponíveis em que os recursos de IA podem ser usados. */
export const AI_ENABLED_VERSION_CODES = BIBLE_VERSIONS
  .filter(v => !v.indisponivel && v.aiEnabled)
  .map(v => v.sigla);

/** Versão padrão do app: a única em português com texto real e completo desde o início. */
export const DEFAULT_BIBLE_VERSION = "AA";

/**
 * Retorna { sigla, nome, aiEnabled } de uma versão pela sigla, ou null se
 * não existir na lista.
 */
export function getVersionInfo(sigla) {
  return BIBLE_VERSIONS.find(v => v.sigla === sigla) || null;
}

/**
 * Monta o título/descrição do aviso a mostrar ao usuário quando ele troca
 * de versão, explicando se os recursos de IA estão disponíveis ou não
 * nessa versão (pedido explícito do usuário em 29/08/2026: "gostaria
 * também de fazer alguma citação para que quando eu mudar a versão, o
 * próprio aplicativo informasse. Essa versão pode ser usada em IA, ou
 * não."). Retorna null se a sigla não for reconhecida.
 */
export function getAiAvailabilityNotice(sigla) {
  const version = getVersionInfo(sigla);
  if (!version) return null;

  if (version.aiEnabled) {
    return {
      title: `IA disponível nesta versão (${sigla})`,
      description: "Você pode usar os recursos de Estudo com IA com o texto desta versão."
    };
  }

  return {
    title: `IA desativada nesta versão (${sigla})`,
    description: "Esta versão tem uma licença que não permite usar o texto bíblico como entrada para IA. Os recursos de Estudo com IA ficam indisponíveis enquanto ela estiver selecionada."
  };
}
