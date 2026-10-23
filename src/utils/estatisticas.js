// Cálculos usados no painel (Início), no detalhe do ponto e no histórico.
import { anoMesDe, diasNoMes, somarMeses } from './datas.js';

const arredondar = (n) => Math.round(n * 100) / 100;

/** Soma os litros de uma lista de entregas. */
export function somaLitros(entregas) {
  return arredondar(entregas.reduce((total, e) => total + e.litros, 0));
}

/** Entregas de um mês ("AAAA-MM"). */
export function entregasDoMes(entregas, anoMes) {
  return entregas.filter((e) => anoMesDe(e.data) === anoMes);
}

/** Média de litros por entrega. */
export function mediaPorEntrega(entregas) {
  return entregas.length ? arredondar(somaLitros(entregas) / entregas.length) : 0;
}

/**
 * Litros por mês dos últimos N meses (do mais antigo para o atual).
 * Ex.: [{ anoMes: '2026-04', litros: 20, entregas: 10 }, ...]
 */
export function litrosPorMes(entregas, hoje, quantidade = 6) {
  const mesAtual = anoMesDe(hoje);
  const meses = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const anoMes = somarMeses(mesAtual, -i);
    const doMes = entregasDoMes(entregas, anoMes);
    meses.push({ anoMes, litros: somaLitros(doMes), entregas: doMes.length });
  }
  return meses;
}

/** Pontos ordenados por litros arrecadados (maior primeiro). */
export function rankingPontos(pontos, entregas, limite = 5) {
  const porPonto = new Map(pontos.map((p) => [p.id, { ponto: p, litros: 0, entregas: 0 }]));
  for (const e of entregas) {
    const item = porPonto.get(e.pontoId);
    if (item) {
      item.litros += e.litros;
      item.entregas += 1;
    }
  }
  return [...porPonto.values()]
    .map((item) => ({ ...item, litros: arredondar(item.litros) }))
    .sort((a, b) => b.litros - a.litros || a.ponto.nome.localeCompare(b.ponto.nome, 'pt-BR'))
    .slice(0, limite);
}

/**
 * Compara o mês atual (até hoje) com o MESMO período do mês anterior.
 * Ex.: dia 19 de setembro -> compara 1 a 19/09 com 1 a 19/08.
 * Assim a comparação é justa mesmo com o mês pela metade.
 */
export function comparativoMesmoPeriodo(entregas, hoje) {
  const dia = Number(hoje.slice(8, 10));
  const mesAtual = anoMesDe(hoje);
  const mesAnterior = somarMeses(mesAtual, -1);
  const ultimoDiaAnterior = Math.min(dia, diasNoMes(mesAnterior));

  const atual = somaLitros(entregas.filter((e) => anoMesDe(e.data) === mesAtual && e.data <= hoje));
  const anterior = somaLitros(
    entregas.filter((e) => anoMesDe(e.data) === mesAnterior && Number(e.data.slice(8, 10)) <= ultimoDiaAnterior),
  );
  const variacao = anterior > 0 ? ((atual - anterior) / anterior) * 100 : null;
  return { atual, anterior, variacao, mesAnterior };
}

/** Progresso da meta mensal. */
export function progressoMeta(litros, meta) {
  if (!meta || meta <= 0) return { percentual: 0, faltam: 0, batida: false };
  return {
    percentual: (litros / meta) * 100,
    faltam: arredondar(Math.max(0, meta - litros)),
    batida: litros >= meta,
  };
}

/** Resumo de um ponto: total de litros, nº de entregas e data da última. */
export function resumoPonto(pontoId, entregas) {
  const doPonto = entregas.filter((e) => e.pontoId === pontoId);
  const ultimaEntrega = doPonto.reduce((maior, e) => (!maior || e.data > maior ? e.data : maior), null);
  return { litros: somaLitros(doPonto), entregas: doPonto.length, ultimaEntrega };
}

/** Quantas garrafas PET de 2 L cheias dá para encher com esse volume. */
export const garrafasPet2L = (litros) => Math.floor(litros / 2);

/** Entregas da mais recente para a mais antiga. */
export function ordenarEntregas(entregas) {
  return [...entregas].sort((a, b) => b.data.localeCompare(a.data) || (b.criadoEm ?? 0) - (a.criadoEm ?? 0));
}

/** Meses ("AAAA-MM") que têm entregas, do mais recente para o mais antigo. */
export function mesesComEntregas(entregas) {
  return [...new Set(entregas.map((e) => anoMesDe(e.data)))].sort().reverse();
}
