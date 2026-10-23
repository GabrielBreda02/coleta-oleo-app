import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';

// Navegação simples feita "na mão": uma pilha de telas.
// Trocar de aba limpa a pilha; abrir um detalhe empilha em cima.

const NavegacaoContext = createContext(null);

export const ABAS = [
  { id: 'inicio', rotulo: 'Início', icone: 'inicio' },
  { id: 'pontos', rotulo: 'Pontos', icone: 'pontos' },
  { id: 'registrar', rotulo: 'Registrar', icone: 'mais', destaque: true },
  { id: 'historico', rotulo: 'Histórico', icone: 'historico' },
  { id: 'dicas', rotulo: 'Dicas', icone: 'dicas' },
];

// A qual aba cada tela pertence (telas de detalhe seguem a aba de origem)
const ABA_DA_TELA = {
  inicio: 'inicio',
  pontos: 'pontos',
  pontoDetalhe: 'pontos',
  pontoForm: 'pontos',
  registrar: 'registrar',
  historico: 'historico',
  dicas: 'dicas',
  ajustes: null,
};

export function NavegacaoProvider({ children, telaInicial = 'inicio' }) {
  const [pilha, setPilha] = useState([{ tela: telaInicial, params: {} }]);

  const navegar = useCallback((tela, params = {}) => {
    setPilha((p) => [...p, { tela, params }]);
  }, []);

  const trocarAba = useCallback((tela) => {
    setPilha([{ tela, params: {} }]);
  }, []);

  const voltar = useCallback(() => {
    let voltou = false;
    setPilha((p) => {
      if (p.length <= 1) return p;
      voltou = true;
      return p.slice(0, -1);
    });
    return voltou;
  }, []);

  // Botão "voltar" do Android
  useEffect(() => {
    const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pilha.length <= 1) return false; // deixa o Android fechar o app
      voltar();
      return true;
    });
    return () => inscricao.remove();
  }, [pilha.length, voltar]);

  const atual = pilha[pilha.length - 1];
  const valor = useMemo(
    () => ({
      tela: atual.tela,
      params: atual.params,
      podeVoltar: pilha.length > 1,
      abaAtiva: ABA_DA_TELA[pilha[0].tela] ?? null,
      navegar,
      voltar,
      trocarAba,
    }),
    [atual, pilha, navegar, voltar, trocarAba],
  );

  return <NavegacaoContext.Provider value={valor}>{children}</NavegacaoContext.Provider>;
}

export function useNavegacao() {
  const contexto = useContext(NavegacaoContext);
  if (!contexto) throw new Error('useNavegacao precisa estar dentro de <NavegacaoProvider>.');
  return contexto;
}
