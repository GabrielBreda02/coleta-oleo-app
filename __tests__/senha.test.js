import { conferirSenha, gerarSal, hashSenha, sha256 } from '../src/utils/senha.js';

describe('sha256', () => {
  it('bate com os valores oficiais de teste', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('funciona com acentos e textos longos', () => {
    expect(sha256('ação')).toBe('0664077f33cc3ebbaa4bbdacac0eb70e740983080f01dce29929e73b7785a7ad');
    expect(sha256('a'.repeat(1000))).toMatch(/^41edece42d63e8d9/);
  });
});

describe('hashSenha e conferirSenha', () => {
  it('a mesma senha com sais diferentes gera hashes diferentes', () => {
    expect(hashSenha('123456', gerarSal())).not.toBe(hashSenha('123456', gerarSal()));
  });

  it('confere a senha certa e recusa a errada', () => {
    const sal = gerarSal();
    const usuario = { sal, hashSenha: hashSenha('oleo123', sal) };
    expect(conferirSenha('oleo123', usuario)).toBe(true);
    expect(conferirSenha('oleo124', usuario)).toBe(false);
    expect(conferirSenha('oleo123', undefined)).toBe(false);
  });
});
