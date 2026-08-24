/**
 * Conteúdo de apoio para o botão "Entenda esse capítulo" da tela de Estudo.
 * Fonte: "Manual da Bíblia" e "Manual Cronológico da Bíblia" (Mateus
 * Eleutério / Casa de Discípulos), material com direitos autorais
 * registrados, de uso do dono deste app.
 *
 * FASE PILOTO: só 4 livros estão mapeados até agora (Gênesis, Mateus, João
 * e Romanos), pra validar o formato antes de cobrir a Bíblia inteira aos
 * poucos. Um livro/capítulo sem dado aqui simplesmente não mostra o botão
 * (ver getManualContexto) - nunca uma tela vazia ou quebrada.
 *
 * Cada item de `blocos` cobre um intervalo de capítulos (o manual original
 * já agrupa os livros narrativos assim, ex: "Gn 26-36"), com:
 *  - capituloInicio / capituloFim: intervalo de capítulos cobertos
 *  - titulo: título curto do bloco
 *  - resumo: resumo em linguagem simples (aba "Resumo fácil")
 *  - versiculoDestaque: verso-chave + por que ele importa (aba "Curiosidade/Aplicação")
 *  - personagens: quem aparece nesse trecho (aba "Quem é quem")
 *  - curiosidade: caixa "Você sabia?" do material original, quando existe
 *  - era: chave pra aba "Linha do tempo" (ver BIBLE_ERAS abaixo)
 */

// Linha do tempo geral da Bíblia, em ordem cronológica - usada pela aba
// "Linha do tempo" pra mostrar o que veio antes/depois de cada bloco.
export const BIBLE_ERAS = [
  {
    id: "criacao",
    titulo: "A Criação",
    periodo: "Início dos tempos",
    descricao: "Deus cria o mundo, Adão e Eva, e depois o dilúvio de Noé."
  },
  {
    id: "patriarcas",
    titulo: "Os Patriarcas",
    periodo: "≈2160-1650 a.C.",
    descricao: "Abraão, Isaque, Jacó e José - o início da família que se torna o povo de Israel."
  },
  {
    id: "exodo",
    titulo: "O Êxodo",
    periodo: "≈1446-1406 a.C.",
    descricao: "Moisés liberta Israel da escravidão no Egito; a Lei é dada no Monte Sinai."
  },
  {
    id: "monarquia",
    titulo: "Reis e Profetas",
    periodo: "≈1050-586 a.C.",
    descricao: "Saul, Davi e Salomão; depois o reino dividido, os profetas, e o exílio na Babilônia."
  },
  {
    id: "restauracao",
    titulo: "A Restauração",
    periodo: "≈538-420 a.C.",
    descricao: "O povo volta do exílio, reconstrói Jerusalém e o Templo."
  },
  {
    id: "vida_jesus",
    titulo: "A Vida de Jesus",
    periodo: "≈6 a.C. - 30 d.C.",
    descricao: "Nascimento, ministério, morte e ressurreição de Jesus Cristo."
  },
  {
    id: "apostolos",
    titulo: "A Igreja Primitiva",
    periodo: "≈30-100 d.C.",
    descricao: "Pentecostes, a expansão da igreja e as cartas dos apóstolos às primeiras comunidades cristãs."
  }
];

export const MANUAL_CONTEXTO_DATA = {
  "Gênesis": {
    autor: "Moisés",
    periodo: "1446-1406 a.C.",
    genero: "Pentateuco",
    blocos: [
      {
        capituloInicio: 1,
        capituloFim: 2,
        titulo: "A Criação",
        era: "criacao",
        resumo:
          "Em 6 dias Deus criou o mundo e no 7º dia descansou. A Bíblia começa mostrando que o objetivo de Deus com o ser humano sempre foi se relacionar com Ele - por isso Ele o criou à Sua imagem e o colocou no Jardim do Éden, com autoridade sobre a criação.",
        versiculoDestaque: {
          referencia: "Gênesis 1:29",
          texto:
            "Eis que lhes tenho dado todas as ervas que dão semente e se acham na superfície de toda a terra e todas as árvores em que há fruto que dê semente; isso servirá de alimento para vocês.",
          relevancia:
            "No relato da criação, Deus dá ao ser humano apenas plantas e frutas como alimento - só depois do dilúvio Ele autoriza comer também os animais (Gênesis 9:3)."
        },
        personagens: [
          { nome: "Deus", contexto: "Cria o mundo em 6 dias e descansa no 7º." },
          { nome: "Adão e Eva", contexto: "O primeiro casal, criados à imagem de Deus e colocados no Jardim do Éden." }
        ],
        curiosidade: "Você sabia? No relato da criação, as pessoas eram vegetarianas - Deus só autoriza comer carne depois do dilúvio."
      },
      {
        capituloInicio: 3,
        capituloFim: 3,
        titulo: "A Queda",
        era: "criacao",
        resumo:
          "Adão e Eva desobedecem a Deus no Jardim do Éden, enganados pela serpente, e isso traz consequências para toda a humanidade. Mas já aqui Deus promete um futuro Salvador.",
        versiculoDestaque: {
          referencia: "Gênesis 3:15",
          texto:
            "Porei inimizade entre você e a mulher, entre a sua descendência e o descendente dela. Este lhe ferirá a cabeça, e você lhe ferirá o calcanhar.",
          relevancia:
            "É a primeira profecia da vinda de Jesus na Bíblia: um descendente da mulher feriria a cabeça da serpente (vitória final sobre o pecado), representando a promessa de redenção logo depois do primeiro pecado."
        },
        personagens: [
          { nome: "Adão e Eva", contexto: "Desobedecem a Deus ao comer do fruto proibido." },
          { nome: "A serpente", contexto: "Engana Eva e é amaldiçoada por Deus." }
        ],
        curiosidade: "Você sabia? Esse versículo é considerado a primeira profecia messiânica de toda a Bíblia."
      },
      {
        capituloInicio: 4,
        capituloFim: 5,
        titulo: "Descendentes de Adão",
        era: "criacao",
        resumo:
          "Adão e Eva têm dois filhos, Caim e Abel. Caim mata Abel por ciúmes. O capítulo também traz a genealogia de Adão através de Sete, mostrando que apesar do pecado se espalhar, Deus preserva uma linhagem justa que leva a Noé.",
        versiculoDestaque: null,
        personagens: [
          { nome: "Caim", contexto: "Mata seu irmão Abel por ciúmes." },
          { nome: "Abel", contexto: "Filho de Adão e Eva, morto por Caim." },
          { nome: "Sete", contexto: "Outro filho de Adão, por quem vem a linhagem que leva a Noé." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 6,
        capituloFim: 9,
        titulo: "O Dilúvio e a Aliança",
        era: "criacao",
        resumo:
          "Por causa da maldade crescente da humanidade, Deus decide destruir a terra com um dilúvio, mas instrui Noé a construir uma arca para preservar sua família e os animais. Depois do dilúvio, Deus faz uma aliança com Noé, prometendo nunca mais destruir a terra com água - o arco-íris é o sinal dessa promessa.",
        versiculoDestaque: {
          referencia: "Gênesis 9:13",
          texto: "Porei o meu arco nas nuvens e ele será por sinal da aliança entre mim e a terra.",
          relevancia: "É a origem do significado do arco-íris como símbolo da fidelidade de Deus."
        },
        personagens: [
          { nome: "Noé", contexto: "Constrói a arca e preserva sua família e os animais do dilúvio." }
        ],
        curiosidade: "Você sabia? A arca de Noé media cerca de 150 m de comprimento, 25 m de largura e 15 m de altura."
      },
      {
        capituloInicio: 11,
        capituloFim: 11,
        titulo: "Torre de Babel",
        era: "criacao",
        resumo:
          "Unidos por um único idioma, os seres humanos tentam construir uma torre para alcançar os céus, demonstrando rebelião e orgulho. Em resposta, Deus confunde as línguas deles, levando à dispersão das nações.",
        versiculoDestaque: null,
        personagens: [],
        curiosidade: null
      },
      {
        capituloInicio: 12,
        capituloFim: 25,
        titulo: "O Chamado de Abraão",
        era: "patriarcas",
        resumo:
          "Deus chama Abraão para deixar sua terra e promete fazer dele uma grande nação. Abraão obedece e parte com sua esposa Sara e seu sobrinho Ló, enfrentando desafios pelo caminho, mas sempre protegido por Deus. Mais tarde, Deus confirma a promessa com o nascimento de Isaque, e depois testa a fé de Abraão pedindo que sacrifique o próprio filho - até prover um cordeiro no último momento.",
        versiculoDestaque: {
          referencia: "Gênesis 12:1-2",
          texto:
            "Saia da sua terra, da sua parentela e da casa do seu pai e vá para a terra que lhe mostrarei. Farei de você uma grande nação, e o abençoarei, e engrandecerei o seu nome. Seja uma bênção!",
          relevancia: "É o chamado que dá início à história do povo de Israel."
        },
        personagens: [
          { nome: "Abraão", contexto: "Chamado por Deus para deixar sua terra; pai da fé." },
          { nome: "Sara", contexto: "Esposa de Abraão; tem Isaque já em idade avançada." },
          { nome: "Ló", contexto: "Sobrinho de Abraão que viaja com ele." },
          { nome: "Isaque", contexto: "Filho da promessa, quase oferecido em sacrifício no Monte Moriá." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 26,
        capituloFim: 36,
        titulo: "A Bênção de Abraão: Isaque e Jacó",
        era: "patriarcas",
        resumo:
          "A narrativa passa para Isaque e depois para seu filho Jacó. Jacó engana seu irmão gêmeo Esaú para obter a bênção de primogênito, foge de casa, luta com Deus numa noite e tem seu nome mudado para \"Israel\". Ele forma uma família com doze filhos, que se tornarão as doze tribos de Israel.",
        versiculoDestaque: null,
        personagens: [
          { nome: "Isaque", contexto: "Filho de Abraão; Deus renova com ele as mesmas promessas." },
          { nome: "Jacó", contexto: "Engana Esaú, luta com Deus e recebe o nome \"Israel\"." },
          { nome: "Esaú", contexto: "Irmão gêmeo de Jacó, perde a bênção de primogênito." }
        ],
        curiosidade: "Você sabia? \"Israel\" significa \"aquele que luta com Deus\"."
      },
      {
        capituloInicio: 37,
        capituloFim: 50,
        titulo: "A História de José",
        era: "patriarcas",
        resumo:
          "José, filho favorito de Jacó, é vendido como escravo pelos próprios irmãos por ciúmes. No Egito, mesmo escravo e depois preso injustamente, sua integridade o eleva até governador do Egito, encarregado de administrar os anos de fartura e fome. Quando seus irmãos vêm buscar comida, José os testa e depois se revela a eles, perdoando-os e trazendo toda a família para o Egito.",
        versiculoDestaque: null,
        personagens: [
          { nome: "José", contexto: "Vendido como escravo pelos irmãos; torna-se governador do Egito." },
          { nome: "Jacó", contexto: "Pai de José, é levado para o Egito na velhice." }
        ],
        curiosidade: null
      }
    ]
  },

  "Mateus": {
    autor: "Mateus (Levi)",
    periodo: "50-75 d.C.",
    genero: "Evangelho",
    blocos: [
      {
        capituloInicio: 1,
        capituloFim: 2,
        titulo: "A Vinda do Messias",
        era: "vida_jesus",
        resumo:
          "Mateus abre seu evangelho com a genealogia de Jesus, ligando-O a Davi e Abraão. Depois narra o nascimento de Jesus em Belém e a visita dos magos, que O reconhecem como o Messias, destacando que Ele foi concebido pelo Espírito Santo, cumprindo as profecias.",
        versiculoDestaque: {
          referencia: "Mateus 1:23",
          texto: "Eis que a virgem conceberá e dará à luz um filho, e ele será chamado pelo nome de Emanuel (que significa \"Deus conosco\").",
          relevancia: "Mostra que o nascimento de Jesus cumpre uma profecia messiânica e que Deus vem habitar entre nós."
        },
        personagens: [
          { nome: "Jesus", contexto: "Nasce em Belém, reconhecido pelos magos como o Messias." },
          { nome: "Os magos", contexto: "Vêm do Oriente para adorar Jesus recém-nascido." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 3,
        capituloFim: 4,
        titulo: "A Revelação do Messias",
        era: "vida_jesus",
        resumo:
          "João Batista prepara o caminho batizando as pessoas no rio Jordão e pregando arrependimento. Jesus também é batizado, e uma voz do céu declara Sua filiação divina, iniciando Seu ministério público. Em seguida, após 40 dias de jejum, Jesus resiste a três tentações de Satanás no deserto, citando as Escrituras.",
        versiculoDestaque: null,
        personagens: [
          { nome: "João Batista", contexto: "Precursor de Jesus; batiza no rio Jordão." },
          { nome: "Jesus", contexto: "É batizado e depois resiste à tentação no deserto." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 4,
        capituloFim: 20,
        titulo: "A Proclamação do Messias",
        era: "vida_jesus",
        resumo:
          "Jesus inicia Seu ministério na Galileia, chama Seus primeiros discípulos e ministra o Sermão do Monte, ensinando sobre as bem-aventuranças e os princípios do Reino de Deus. Ele realiza diversos milagres, ensina por meio de parábolas, e é transfigurado diante de Pedro, Tiago e João, revelando Sua identidade divina.",
        versiculoDestaque: null,
        personagens: [
          { nome: "Pedro, Tiago, João e André", contexto: "Primeiros discípulos chamados por Jesus para segui-Lo." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 21,
        capituloFim: 28,
        titulo: "A Paixão do Messias",
        era: "vida_jesus",
        resumo:
          "Jesus entra em Jerusalém aclamado pela multidão, mas enfrenta forte oposição dos líderes religiosos. Na Última Ceia institui a Santa Ceia; depois é traído por Judas, julgado, condenado e crucificado. No terceiro dia, ressuscita e aparece aos discípulos, enviando-os a fazer discípulos de todas as nações.",
        versiculoDestaque: {
          referencia: "Mateus 28:5-6",
          texto: "Não tenham medo! Sei que vocês procuram Jesus, que foi crucificado. Ele não está aqui; ressuscitou, como tinha dito.",
          relevancia: "É o anúncio da ressurreição - o centro de toda a fé cristã."
        },
        personagens: [
          { nome: "Judas Iscariotes", contexto: "Um dos doze discípulos, trai Jesus por trinta moedas de prata." }
        ],
        curiosidade: null
      }
    ]
  },

  "João": {
    autor: "João",
    periodo: "90 d.C.",
    genero: "Evangelho",
    blocos: [
      {
        capituloInicio: 1,
        capituloFim: 1,
        titulo: "Introdução",
        era: "vida_jesus",
        resumo:
          "João abre seu evangelho com uma introdução poética e teológica, descrevendo Jesus como o \"Verbo\" (Logos) que estava com Deus e era Deus desde o princípio. Deixa claro que a \"Palavra\", o \"Verbo Eterno\" e a \"Sabedoria\" são a mesma pessoa: Jesus Cristo.",
        versiculoDestaque: null,
        personagens: [
          { nome: "Jesus (o Verbo)", contexto: "Apresentado como Deus, que estava com Deus desde o princípio." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 1,
        capituloFim: 1,
        titulo: "A Preparação de Jesus",
        era: "vida_jesus",
        resumo:
          "João Batista prepara o caminho para Jesus, declarando-o o \"Cordeiro de Deus\". Dois de seus discípulos, André e Simão Pedro, são os primeiros a reconhecer Jesus como o Messias.",
        versiculoDestaque: null,
        personagens: [
          { nome: "João Batista", contexto: "Declara Jesus como o \"Cordeiro de Deus\"." },
          { nome: "André e Simão Pedro", contexto: "Primeiros discípulos a reconhecer Jesus como o Messias." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 2,
        capituloFim: 4,
        titulo: "Ministério Público de Jesus",
        era: "vida_jesus",
        resumo:
          "Em vez de muitas parábolas, João registra uma série de sinais e milagres de Jesus - começando pela transformação de água em vinho em Caná. O capítulo também traz diálogos marcantes e exclusivos de João, como a conversa com Nicodemos sobre o novo nascimento e o encontro com a mulher samaritana no poço.",
        versiculoDestaque: {
          referencia: "João 2:11",
          texto: "Assim, em Caná da Galileia, Jesus deu início a seus sinais. Ele manifestou a sua glória, e os seus discípulos creram nele.",
          relevancia: "É o primeiro milagre público de Jesus, marcando o início do Seu ministério."
        },
        personagens: [
          { nome: "Nicodemos", contexto: "Fariseu que conversa com Jesus sobre o novo nascimento." },
          { nome: "A mulher samaritana", contexto: "Encontra Jesus num poço e se torna uma das primeiras a anunciá-Lo." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 5,
        capituloFim: 12,
        titulo: "A Oposição ao Ministério de Jesus",
        era: "vida_jesus",
        resumo:
          "Conforme Jesus realiza milagres e proclama Sua divindade, a oposição dos líderes religiosos judeus se intensifica. Eles questionam Sua autoridade e tramam contra Ele. É nesse trecho que Jesus faz várias afirmações \"Eu sou\", como \"Eu sou o pão da vida\" e \"Eu sou a ressurreição e a vida\".",
        versiculoDestaque: null,
        personagens: [
          { nome: "Os fariseus", contexto: "Líderes religiosos que se opõem a Jesus e tramam contra Ele." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 13,
        capituloFim: 21,
        titulo: "Os Últimos Feitos e Palavras de Jesus",
        era: "vida_jesus",
        resumo:
          "Jesus compartilha a Última Ceia com Seus discípulos, lava os pés deles como exemplo de serviço humilde, e anuncia a traição de Judas e a negação de Pedro. Em seguida vêm o julgamento, a crucificação e a ressurreição, com várias aparições de Jesus aos discípulos - terminando no perdão e na restauração de Pedro.",
        versiculoDestaque: {
          referencia: "João 20:31",
          texto: "Estas coisas foram escritas para que vocês creiam que Jesus é o Messias, o Filho de Deus, e para que, crendo, tenham vida em seu nome.",
          relevancia: "É o próprio João explicando por que escreveu todo o evangelho."
        },
        personagens: [
          { nome: "Judas Iscariotes", contexto: "Anunciado como o traidor de Jesus." },
          { nome: "Pedro", contexto: "Nega Jesus três vezes, e depois é restaurado por Ele." }
        ],
        curiosidade: "Você sabia? Na época, lavar os pés dos outros era trabalho de escravos - por isso o gesto de Jesus foi tão marcante."
      }
    ]
  },

  "Romanos": {
    autor: "Apóstolo Paulo",
    periodo: "58 d.C.",
    genero: "Epístola",
    blocos: [
      {
        capituloInicio: 1,
        capituloFim: 3,
        titulo: "Condenação: A Necessidade Humana da Justificação",
        era: "apostolos",
        resumo:
          "Paulo começa mostrando como a humanidade se desviou da verdadeira adoração a Deus. Ele argumenta que tanto judeus quanto gentios estão sob a condenação do pecado, destacando a universalidade do pecado e a necessidade de justificação.",
        versiculoDestaque: null,
        personagens: [],
        curiosidade: null
      },
      {
        capituloInicio: 4,
        capituloFim: 5,
        titulo: "Justificação: A Provisão Divina para Cada Ser Humano",
        era: "apostolos",
        resumo:
          "Somos justificados (declarados justos) diante de Deus somente pela fé em Jesus Cristo, não pelas obras da lei - Paulo usa o exemplo de Abraão pra ilustrar isso. Através de Cristo, os crentes têm paz com Deus e são reconciliados com Ele.",
        versiculoDestaque: null,
        personagens: [
          { nome: "Abraão", contexto: "Citado por Paulo como exemplo de justificação pela fé." }
        ],
        curiosidade: null
      },
      {
        capituloInicio: 6,
        capituloFim: 8,
        titulo: "Santificação: O Poder Divino para uma Vida Justa",
        era: "apostolos",
        resumo:
          "Paulo ensina que os crentes morreram para o pecado em Cristo e ressuscitaram para uma nova vida, sendo exortados a não viver mais em pecado. Ele aborda a batalha entre a carne e o Espírito, destacando o papel do Espírito Santo na santificação.",
        versiculoDestaque: null,
        personagens: [],
        curiosidade: null
      },
      {
        capituloInicio: 9,
        capituloFim: 11,
        titulo: "Plano de Deus: O Pleno Estabelecimento de Sua Vontade",
        era: "apostolos",
        resumo:
          "Paulo explora a soberania de Deus na eleição, abordando a relação de Israel com a salvação. Ele destaca o plano de Deus para a redenção de Israel e como Sua graça se estende tanto a judeus quanto a gentios.",
        versiculoDestaque: null,
        personagens: [],
        curiosidade: null
      },
      {
        capituloInicio: 12,
        capituloFim: 16,
        titulo: "Atitude dos Cristãos: Obras de Justiça na Igreja e no Mundo",
        era: "apostolos",
        resumo:
          "Paulo exorta os crentes a oferecerem seus corpos como sacrifício vivo, a viverem em harmonia e a demonstrarem amor uns aos outros. Ele também discute o relacionamento dos crentes com as autoridades e questões de consciência em relação aos mais fracos na fé.",
        versiculoDestaque: null,
        personagens: [],
        curiosidade: "Você sabia? \"Sacrifício vivo\" é uma metáfora: ao contrário dos sacrifícios de animais do Antigo Testamento, o cristão é chamado a se oferecer vivo, renunciando a seus próprios desejos para seguir a vontade de Deus."
      }
    ]
  }
};

/**
 * Retorna o bloco de contexto (resumo, versículo-chave, personagens,
 * curiosidade, era) para um livro + capítulo, ou null se esse livro/
 * capítulo ainda não tiver conteúdo mapeado - nesse caso o botão
 * "Entenda esse capítulo" deve ficar escondido, nunca mostrar erro.
 */
export function getManualContexto(livro, capitulo) {
  const livroData = MANUAL_CONTEXTO_DATA[livro];
  if (!livroData) return null;

  const bloco = livroData.blocos.find(
    (b) => capitulo >= b.capituloInicio && capitulo <= b.capituloFim
  );
  if (!bloco) return null;

  return {
    livro,
    autor: livroData.autor,
    periodo: livroData.periodo,
    genero: livroData.genero,
    ...bloco
  };
}

export function getEraInfo(eraId) {
  const index = BIBLE_ERAS.findIndex((e) => e.id === eraId);
  if (index === -1) return null;
  return {
    atual: BIBLE_ERAS[index],
    anterior: index > 0 ? BIBLE_ERAS[index - 1] : null,
    proxima: index < BIBLE_ERAS.length - 1 ? BIBLE_ERAS[index + 1] : null
  };
}
