// Funções de data. As datas são guardadas como texto "AAAA-MM-DD"
// (ex.: "2026-09-19") para evitar problemas de fuso horário.

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const doisDigitos = (n) => String(n).padStart(2, '0');

/** Converte um Date para "AAAA-MM-DD" usando o horário local. */
export function paraISO(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Data de hoje no formato "AAAA-MM-DD". */
export function hojeISO() {
  return paraISO(new Date());
}

/** Converte "AAAA-MM-DD" para Date (meia-noite no horário local). */
export function deISO(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "2026-09-19" -> "2026-09" */
export function anoMesDe(iso) {
  return iso.slice(0, 7);
}

/** Soma (ou subtrai) meses de um "AAAA-MM". */
export function somarMeses(anoMes, quantidade) {
  const [ano, mes] = anoMes.split('-').map(Number);
  const data = new Date(ano, mes - 1 + quantidade, 1);
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`;
}

/** Quantos dias tem o mês ("AAAA-MM"). */
export function diasNoMes(anoMes) {
  const [ano, mes] = anoMes.split('-').map(Number);
  return new Date(ano, mes, 0).getDate();
}

/** Dias que faltam para acabar o mês (sem contar hoje). */
export function diasRestantesNoMes(hoje) {
  return diasNoMes(anoMesDe(hoje)) - Number(hoje.slice(8, 10));
}

/** "2026-09" -> "setembro", "set" ou "setembro de 2026" */
export function nomeMes(anoMes, { curto = false, comAno = false } = {}) {
  const [ano, mes] = anoMes.split('-').map(Number);
  const nome = (curto ? MESES_CURTOS : MESES)[mes - 1];
  return comAno ? `${nome} de ${ano}` : nome;
}

/** "2026-09-19" -> "19/09/2026" */
export function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Rótulo amigável: "Hoje", "Ontem" ou "qui, 17 de set". */
export function rotuloDia(iso, hoje) {
  if (iso === hoje) return 'Hoje';
  const ontem = new Date(deISO(hoje));
  ontem.setDate(ontem.getDate() - 1);
  if (iso === paraISO(ontem)) return 'Ontem';
  const data = deISO(iso);
  const base = `${DIAS_SEMANA[data.getDay()]}, ${data.getDate()} de ${MESES_CURTOS[data.getMonth()]}`;
  return iso.slice(0, 4) === hoje.slice(0, 4) ? base : `${base} de ${data.getFullYear()}`;
}
