import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { armazenamentoPadrao } from '../utils/armazenamento.js';
import { gerarId } from '../utils/id.js';
import { conferirSenha, gerarSal, hashSenha } from '../utils/senha.js';
import { normalizarEmail, temErros, validarCadastro, validarLogin } from '../utils/validacao.js';

export const CHAVE_USUARIOS = 'coleta-oleo:usuarios';
export const CHAVE_SESSAO = 'coleta-oleo:sessao';

const AutenticacaoContext = createContext(null);

/** Cria o registro de um usuário novo, já com a senha protegida. */
export function criarUsuario({ nome, email, senha }) {
  const sal = gerarSal();
  return {
    id: gerarId('u'),
    nome: nome.trim(),
    email: normalizarEmail(email),
    sal,
    hashSenha: hashSenha(senha, sal),
    criadoEm: Date.now(),
  };
}

/** O que as telas podem ver do usuário (nunca o hash nem o sal). */
const publico = (usuario) => usuario && { id: usuario.id, nome: usuario.nome, email: usuario.email };

/**
 * Cadastro e login de usuários.
 * As contas ficam salvas no aparelho (AsyncStorage) e a sessão também,
 * então quem já entrou não precisa digitar a senha toda vez que abre o app.
 */
export function AutenticacaoProvider({ children, armazenamento = armazenamentoPadrao }) {
  const [usuarios, setUsuarios] = useState([]);
  const [sessaoId, setSessaoId] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const [salvos, sessao] = await Promise.all([
        armazenamento.ler(CHAVE_USUARIOS, []),
        armazenamento.ler(CHAVE_SESSAO, null),
      ]);
      if (!ativo) return;
      const lista = Array.isArray(salvos) ? salvos : [];
      setUsuarios(lista);
      setSessaoId(lista.some((u) => u.id === sessao?.usuarioId) ? sessao.usuarioId : null);
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [armazenamento]);

  const usuario = useMemo(() => publico(usuarios.find((u) => u.id === sessaoId)), [usuarios, sessaoId]);

  const acoes = useMemo(() => {
    async function abrirSessao(id) {
      setSessaoId(id);
      await armazenamento.salvar(CHAVE_SESSAO, { usuarioId: id, desde: Date.now() });
    }

    return {
      /** Cria a conta e já entra. Devolve { ok, erros }. */
      async cadastrar(dados) {
        const erros = validarCadastro(dados, { usuarios });
        if (temErros(erros)) return { ok: false, erros };
        const novo = criarUsuario(dados);
        const lista = [...usuarios, novo];
        setUsuarios(lista);
        await armazenamento.salvar(CHAVE_USUARIOS, lista);
        await abrirSessao(novo.id);
        return { ok: true, erros: {} };
      },

      /** Confere e-mail e senha. Devolve { ok, erros }. */
      async entrar(dados) {
        const erros = validarLogin(dados);
        if (temErros(erros)) return { ok: false, erros };
        const encontrado = usuarios.find((u) => u.email === normalizarEmail(dados.email));
        // Mesma mensagem para e-mail ou senha errados: não revela quais e-mails têm conta
        if (!conferirSenha(dados.senha, encontrado)) {
          return { ok: false, erros: { geral: 'E-mail ou senha incorretos.' } };
        }
        await abrirSessao(encontrado.id);
        return { ok: true, erros: {} };
      },

      async sair() {
        setSessaoId(null);
        await armazenamento.remover(CHAVE_SESSAO);
      },
    };
  }, [usuarios, armazenamento]);

  const valor = useMemo(() => ({ usuario, carregando, acoes }), [usuario, carregando, acoes]);

  return <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>;
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext);
  if (!contexto) throw new Error('useAutenticacao precisa estar dentro de <AutenticacaoProvider>.');
  return contexto;
}
