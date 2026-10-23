import {
  comparativoMesmoPeriodo,
  entregasDoMes,
  garrafasPet2L,
  litrosPorMes,
  mediaPorEntrega,
  mesesComEntregas,
  ordenarEntregas,
  progressoMeta,
  rankingPontos,
  resumoPonto,
  somaLitros,
} from '../src/utils/estatisticas.js';

const pontos = [
  { id: 'a', nome: 'Alfa' },
  { id: 'b', nome: 'Beta' },
  { id: 'c', nome: 'Gama' },
];

const entregas = [
  { id: '1', pontoId: 'a', litros: 2, data: '2026-09-02', criadoEm: 1 },
  { id: '2', pontoId: 'a', litros: 1.5, data: '2026-09-18', criadoEm: 2 },
  { id: '3', pontoId: 'b', litros: 5, data: '2026-08-10', criadoEm: 3 },
  { id: '4', pontoId: 'b', litros: 0.5, data: '2026-08-25', criadoEm: 4 },
  { id: '5', pontoId: 'a', litros: 3, data: '2026-04-01', criadoEm: 5 },
  { id: '6', pontoId: 'b', litros: 1, data: '2026-09-18', criadoEm: 6 },
];

describe('somas e médias', () => {
  it('soma os litros sem erro de arredondamento', () => {
    expect(somaLitros([{ litros: 0.1 }, { litros: 0.2 }])).toBe(0.3);
    expect(somaLitros(entregas)).toBe(13);
    expect(somaLitros([])).toBe(0);
  });

  it('calcula a média por entrega', () => {
    expect(mediaPorEntrega(entregas)).toBe(2.17);
    expect(mediaPorEntrega([])).toBe(0);
  });

  it('filtra entregas do mês', () => {
    expect(entregasDoMes(entregas, '2026-09').map((e) => e.id)).toEqual(['1', '2', '6']);
  });

  it('conta garrafas PET de 2 L cheias', () => {
    expect(garrafasPet2L(13)).toBe(6);
    expect(garrafasPet2L(1.9)).toBe(0);
  });
});

describe('litrosPorMes', () => {
  it('devolve os últimos 6 meses em ordem, incluindo meses sem entrega', () => {
    const meses = litrosPorMes(entregas, '2026-09-19', 6);
    expect(meses.map((m) => m.anoMes)).toEqual(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']);
    expect(meses.map((m) => m.litros)).toEqual([3, 0, 0, 0, 5.5, 4.5]);
    expect(meses.at(-1).entregas).toBe(3);
  });

  it('vira o ano corretamente', () => {
    const meses = litrosPorMes([], '2027-02-10', 4);
    expect(meses.map((m) => m.anoMes)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });
});

describe('rankingPontos', () => {
  it('ordena do maior para o menor e respeita o limite', () => {
    const ranking = rankingPontos(pontos, entregas, 2);
    expect(ranking.map((r) => r.ponto.id)).toEqual(['a', 'b']);
    expect(ranking[0]).toMatchObject({ litros: 6.5, entregas: 3 });
    expect(ranking[1]).toMatchObject({ litros: 6.5, entregas: 3 });
  });

  it('inclui pontos sem entregas com zero', () => {
    const ranking = rankingPontos(pontos, entregas, 5);
    expect(ranking.at(-1)).toMatchObject({ litros: 0, entregas: 0 });
    expect(ranking.at(-1).ponto.id).toBe('c');
  });
});

describe('comparativoMesmoPeriodo', () => {
  it('compara com o mesmo intervalo de dias do mês anterior', () => {
    // 1 a 19/09 = 4,5 L; 1 a 19/08 = 5 L (a entrega de 25/08 fica de fora)
    const r = comparativoMesmoPeriodo(entregas, '2026-09-19');
    expect(r.atual).toBe(4.5);
    expect(r.anterior).toBe(5);
    expect(r.variacao).toBeCloseTo(-10);
    expect(r.mesAnterior).toBe('2026-08');
  });

  it('devolve variação nula quando o mês anterior não tem entregas', () => {
    expect(comparativoMesmoPeriodo(entregas, '2026-07-10').variacao).toBeNull();
  });

  it('funciona no dia 31 quando o mês anterior tem 30 dias', () => {
    const r = comparativoMesmoPeriodo([{ litros: 2, data: '2026-09-30' }], '2026-10-31');
    expect(r.anterior).toBe(2);
  });
});

describe('progressoMeta', () => {
  it('calcula percentual e quanto falta', () => {
    expect(progressoMeta(30, 50)).toEqual({ percentual: 60, faltam: 20, batida: false });
  });

  it('marca a meta como batida e não deixa "faltam" negativo', () => {
    expect(progressoMeta(60, 50)).toMatchObject({ faltam: 0, batida: true });
  });

  it('lida com meta zerada', () => {
    expect(progressoMeta(10, 0)).toEqual({ percentual: 0, faltam: 0, batida: false });
  });
});

describe('outros', () => {
  it('resume um ponto', () => {
    expect(resumoPonto('a', entregas)).toEqual({ litros: 6.5, entregas: 3, ultimaEntrega: '2026-09-18' });
    expect(resumoPonto('c', entregas)).toEqual({ litros: 0, entregas: 0, ultimaEntrega: null });
  });

  it('ordena da mais recente para a mais antiga (desempate pela criação)', () => {
    expect(ordenarEntregas(entregas).map((e) => e.id)).toEqual(['6', '2', '1', '4', '3', '5']);
  });

  it('lista meses com entregas', () => {
    expect(mesesComEntregas(entregas)).toEqual(['2026-09', '2026-08', '2026-04']);
  });
});
