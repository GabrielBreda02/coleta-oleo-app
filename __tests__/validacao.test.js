import { temErros, validarEntrega, validarPonto } from '../src/utils/validacao.js';

const pontos = [{ id: 'p1' }];
const hoje = '2026-09-19';

describe('validarPonto', () => {
  it('aceita um ponto completo', () => {
    const erros = validarPonto({ nome: 'Mercado', endereco: 'Rua A, 1', bairro: 'Centro', horario: '8h às 18h' });
    expect(temErros(erros)).toBe(false);
  });

  it('aponta cada campo obrigatório vazio', () => {
    const erros = validarPonto({ nome: '  ', endereco: '', bairro: '', horario: '' });
    expect(Object.keys(erros).sort()).toEqual(['bairro', 'endereco', 'horario', 'nome']);
  });

  it('exige nome com pelo menos 3 letras', () => {
    expect(validarPonto({ nome: 'ab', endereco: 'x', bairro: 'x', horario: 'x' }).nome).toMatch(/3 letras/);
  });
});

describe('validarEntrega', () => {
  const valida = { pontoId: 'p1', litros: '2,5', data: '2026-09-19' };

  it('aceita uma entrega válida (com vírgula)', () => {
    expect(validarEntrega(valida, { pontos, hoje })).toEqual({});
  });

  it('exige ponto existente', () => {
    expect(validarEntrega({ ...valida, pontoId: '' }, { pontos, hoje }).pontoId).toBeTruthy();
    expect(validarEntrega({ ...valida, pontoId: 'nao-existe' }, { pontos, hoje }).pontoId).toMatch(/não existe/);
  });

  it('rejeita quantidade vazia, zero, negativa, texto ou exagerada', () => {
    for (const litros of ['', '0', '-1', 'muito', '9999']) {
      expect(validarEntrega({ ...valida, litros }, { pontos, hoje }).litros).toBeTruthy();
    }
  });

  it('rejeita data no futuro ou vazia', () => {
    expect(validarEntrega({ ...valida, data: '2026-09-20' }, { pontos, hoje }).data).toMatch(/futuro/);
    expect(validarEntrega({ ...valida, data: '' }, { pontos, hoje }).data).toBeTruthy();
  });
});
