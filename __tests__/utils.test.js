import { criarArmazenamento } from '../src/utils/armazenamento.js';
import { anoMesDe, diasNoMes, diasRestantesNoMes, formatarData, nomeMes, rotuloDia, somarMeses } from '../src/utils/datas.js';
import { escalaAmigavel } from '../src/utils/escala.js';
import { formatarLitros, formatarPercentual, lerNumero, plural } from '../src/utils/formatar.js';
import { gerarEntregasExemplo, PONTOS_EXEMPLO } from '../src/utils/dadosExemplo.js';
import { dadosReducer, estadoSalvoOuExemplo } from '../src/context/dadosReducer.js';
import { criarDadosExemplo } from '../src/utils/dadosExemplo.js';

const HOJE = '2026-09-19';

describe('datas', () => {
  it('manipula meses', () => {
    expect(anoMesDe('2026-09-19')).toBe('2026-09');
    expect(somarMeses('2026-01', -1)).toBe('2025-12');
    expect(somarMeses('2026-11', 3)).toBe('2027-02');
    expect(diasNoMes('2028-02')).toBe(29);
    expect(diasRestantesNoMes(HOJE)).toBe(11);
  });

  it('formata em português', () => {
    expect(nomeMes('2026-09')).toBe('setembro');
    expect(nomeMes('2026-03', { curto: true })).toBe('mar');
    expect(nomeMes('2026-09', { comAno: true })).toBe('setembro de 2026');
    expect(formatarData('2026-09-05')).toBe('05/09/2026');
    expect(rotuloDia('2026-09-19', HOJE)).toBe('Hoje');
    expect(rotuloDia('2026-09-18', HOJE)).toBe('Ontem');
    expect(rotuloDia('2026-09-17', HOJE)).toBe('qui, 17 de set');
  });
});

describe('formatação', () => {
  it('usa vírgula decimal', () => {
    expect(formatarLitros(2.5)).toBe('2,5 L');
    expect(formatarPercentual(56.4)).toBe('56%');
    expect(lerNumero('2,5')).toBe(2.5);
    expect(lerNumero('abc')).toBeNaN();
    expect(plural(1, 'entrega')).toBe('1 entrega');
    expect(plural(3, 'entrega')).toBe('3 entregas');
  });
});

describe('escala dos gráficos', () => {
  it('arredonda o topo do eixo', () => {
    expect(escalaAmigavel(43)).toEqual({ max: 60, ticks: [0, 20, 40, 60] });
    expect(escalaAmigavel(8)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
    expect(escalaAmigavel(0)).toEqual({ max: 10, ticks: [0, 5, 10] });
  });
});

describe('armazenamento no aparelho', () => {
  it('salva e lê', async () => {
    const dados = new Map();
    const falso = {
      getItem: async (k) => dados.get(k) ?? null,
      setItem: async (k, v) => dados.set(k, v),
      removeItem: async (k) => dados.delete(k),
    };
    const arm = criarArmazenamento(falso);
    expect(await arm.salvar('x', { a: 1 })).toBe(true);
    expect(await arm.ler('x')).toEqual({ a: 1 });
  });

  it('continua funcionando (na memória) se o aparelho recusar o armazenamento', async () => {
    const quebrado = {
      getItem: async () => { throw new Error('sem espaço'); },
      setItem: async () => { throw new Error('sem espaço'); },
      removeItem: async () => { throw new Error('sem espaço'); },
    };
    const arm = criarArmazenamento(quebrado);
    expect(await arm.salvar('x', [1, 2])).toBe(false);
    expect(await arm.ler('x')).toEqual([1, 2]);
    expect(await arm.ler('y', 'padrão')).toBe('padrão');
  });
});

describe('dados de exemplo e reducer', () => {
  it('gera sempre os mesmos dados e nunca no futuro', () => {
    const a = gerarEntregasExemplo(HOJE);
    expect(a).toEqual(gerarEntregasExemplo(HOJE));
    const ids = new Set(PONTOS_EXEMPLO.map((p) => p.id));
    for (const e of a) {
      expect(e.data <= HOJE).toBe(true);
      expect(ids.has(e.pontoId)).toBe(true);
    }
  });

  it('usa o exemplo quando não há nada salvo e respeita o que estava salvo', () => {
    expect(estadoSalvoOuExemplo(null, HOJE).pontos).toHaveLength(8);
    const salvo = { pontos: [], entregas: [], config: { meta: 80 }, avisoExemplo: false };
    expect(estadoSalvoOuExemplo(salvo, HOJE).config).toEqual({ cidade: 'Caxias do Sul', meta: 80 });
  });

  it('excluir ponto apaga as entregas dele, e restaurar desfaz', () => {
    const inicial = criarDadosExemplo(HOJE);
    const ponto = inicial.pontos.find((p) => p.id === 'p2');
    const doPonto = inicial.entregas.filter((e) => e.pontoId === 'p2');
    const sem = dadosReducer(inicial, { tipo: 'excluirPonto', id: 'p2' });
    expect(sem.entregas.some((e) => e.pontoId === 'p2')).toBe(false);
    const voltou = dadosReducer(sem, { tipo: 'restaurarPonto', ponto, entregas: doPonto });
    expect(voltou.entregas).toHaveLength(inicial.entregas.length);
  });
});
