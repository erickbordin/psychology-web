const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/**
 * A API manda tanto `2026-08-19` quanto `2026-08-19T10:00:00`. Recortar antes do
 * `T` e montar em UTC evita o deslocamento de um dia que o `new Date(iso)` faz
 * com data pura em fuso negativo — o Brasil inteiro veria a sessao de ontem.
 * Entrada que nao for data volta como veio, em vez de virar "Invalid Date".
 */
function partes(iso: string): [number, number, number] | null {
  const pedacos = iso.split('T')[0].split('-')
  if (pedacos.length !== 3) return null
  const [ano, mes, dia] = pedacos.map(Number)
  if (!ano || !mes || !dia || mes > 12 || dia > 31) return null
  return [ano, mes, dia]
}

/** `12 abr 1991` — para data de nascimento, onde o dia da semana nao diz nada. */
export function dataCurta(iso: string): string {
  const p = partes(iso)
  if (!p) return iso
  const [ano, mes, dia] = p
  return `${dia} ${MESES[mes - 1]} ${ano}`
}

/** `qua, 19 ago 2026` — sessao acontece em dia da semana, e e assim que se lembra dela. */
export function dataDeSessao(iso: string): string {
  const p = partes(iso)
  if (!p) return iso
  const [ano, mes, dia] = p
  const semana = DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  return `${semana}, ${dia} ${MESES[mes - 1]} ${ano}`
}
