/**
 * Mapa compartilhado: chave normalizada do livro (formato interno do app,
 * ex.: "joao", "genesis") -> abreviação usada pela API da ABíbliaDigital
 * (ex.: "jo", "gn"). Fonte única de verdade para não duplicar esse mapa
 * em múltiplos arquivos (BibleRepository.jsx e abibliaBibleProvider.jsx
 * usavam cópias divergentes).
 *
 * Referência: https://www.abibliadigital.com.br/api (campo "abbrev.pt")
 */
export const BOOK_ABBREV_MAP = {
  'genesis': 'gn', 'exodo': 'ex', 'levitico': 'lv', 'numeros': 'nm', 'deuteronomio': 'dt',
  'josue': 'js', 'juizes': 'jz', 'rute': 'rt', '1samuel': '1sm', '2samuel': '2sm',
  '1reis': '1rs', '2reis': '2rs', '1cronicas': '1cr', '2cronicas': '2cr',
  'esdras': 'ed', 'neemias': 'ne', 'ester': 'et', 'jo': 'job', 'salmos': 'sl',
  'proverbios': 'pv', 'eclesiastes': 'ec', 'cantares': 'ct', 'isaias': 'is',
  'jeremias': 'jr', 'lamentacoes': 'lm', 'ezequiel': 'ez', 'daniel': 'dn',
  'oseias': 'os', 'joel': 'jl', 'amos': 'am', 'obadias': 'ob', 'jonas': 'jn',
  'miqueias': 'mq', 'naum': 'na', 'habacuque': 'hc', 'sofonias': 'sf',
  'ageu': 'ag', 'zacarias': 'zc', 'malaquias': 'ml', 'mateus': 'mt',
  'marcos': 'mc', 'lucas': 'lc', 'joao': 'jo', 'atos': 'at', 'romanos': 'rm',
  '1corintios': '1co', '2corintios': '2co', 'galatas': 'gl', 'efesios': 'ef',
  'filipenses': 'fp', 'colossenses': 'cl', '1tessalonicenses': '1ts',
  '2tessalonicenses': '2ts', '1timoteo': '1tm', '2timoteo': '2tm', 'tito': 'tt',
  'filemom': 'fm', 'hebreus': 'hb', 'tiago': 'tg', '1pedro': '1pe', '2pedro': '2pe',
  '1joao': '1jo', '2joao': '2jo', '3joao': '3jo', 'judas': 'jd', 'apocalipse': 'ap'
};

/**
 * Converte a chave normalizada interna (ex.: "joao") para a abreviação
 * esperada pela API da ABíbliaDigital (ex.: "jo"). Se não encontrar
 * mapeamento, retorna a própria chave (fallback seguro).
 */
export function getAbibliaBookCode(bookKey) {
  if (!bookKey) return bookKey;
  return BOOK_ABBREV_MAP[bookKey] || bookKey;
}

/**
 * Mapa compartilhado: chave normalizada do livro (mesmo formato interno
 * acima) -> código USFM de 3 letras (ex.: "joao" -> "JHN"), usado pela API
 * pública bible.helloao.org para buscar comentários bíblicos reais e de
 * domínio público (ex.: Matthew Henry). Ver matthewHenryProvider.jsx.
 */
export const USFM_BOOK_CODE_MAP = {
  'genesis': 'GEN', 'exodo': 'EXO', 'levitico': 'LEV', 'numeros': 'NUM', 'deuteronomio': 'DEU',
  'josue': 'JOS', 'juizes': 'JDG', 'rute': 'RUT', '1samuel': '1SA', '2samuel': '2SA',
  '1reis': '1KI', '2reis': '2KI', '1cronicas': '1CH', '2cronicas': '2CH',
  'esdras': 'EZR', 'neemias': 'NEH', 'ester': 'EST', 'jo': 'JOB', 'salmos': 'PSA',
  'proverbios': 'PRO', 'eclesiastes': 'ECC', 'cantares': 'SNG', 'isaias': 'ISA',
  'jeremias': 'JER', 'lamentacoes': 'LAM', 'ezequiel': 'EZK', 'daniel': 'DAN',
  'oseias': 'HOS', 'joel': 'JOL', 'amos': 'AMO', 'obadias': 'OBA', 'jonas': 'JON',
  'miqueias': 'MIC', 'naum': 'NAM', 'habacuque': 'HAB', 'sofonias': 'ZEP',
  'ageu': 'HAG', 'zacarias': 'ZEC', 'malaquias': 'MAL', 'mateus': 'MAT',
  'marcos': 'MRK', 'lucas': 'LUK', 'joao': 'JHN', 'atos': 'ACT', 'romanos': 'ROM',
  '1corintios': '1CO', '2corintios': '2CO', 'galatas': 'GAL', 'efesios': 'EPH',
  'filipenses': 'PHP', 'colossenses': 'COL', '1tessalonicenses': '1TH',
  '2tessalonicenses': '2TH', '1timoteo': '1TI', '2timoteo': '2TI', 'tito': 'TIT',
  'filemom': 'PHM', 'hebreus': 'HEB', 'tiago': 'JAS', '1pedro': '1PE', '2pedro': '2PE',
  '1joao': '1JN', '2joao': '2JN', '3joao': '3JN', 'judas': 'JUD', 'apocalipse': 'REV'
};

/**
 * Converte a chave normalizada interna (ex.: "joao") para o código USFM
 * (ex.: "JHN"). Se não encontrar mapeamento, retorna null (não faz sentido
 * "chutar" um código de livro para uma API externa).
 */
export function getUsfmBookCode(bookKey) {
  if (!bookKey) return null;
  return USFM_BOOK_CODE_MAP[bookKey] || null;
}
