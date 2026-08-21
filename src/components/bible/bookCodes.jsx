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
