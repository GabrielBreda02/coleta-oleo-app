import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { armazenamentoPadrao } from '../utils/armazenamento.js';
import { hojeISO } from '../utils/datas.js';
import { lerNumero } from '../utils/formatar.js';
import { gerarId } from '../utils/id.js';
import { CHAVE_ARMAZENAMENTO, dadosReducer, estadoSalvoOuExemplo } from './dadosReducer.js';

const DadosContext = createContext(null);

/**
 * Deixa os dados (pontos, entregas e ajustes) disponíveis para todas as telas.
 * Ao abrir o app, lê o que estava salvo no aparelho; depois salva sozinho
 * a cada alteração.
 */
export function DadosProvider({ children, hoje = hojeISO(), armazenamento = armazenamentoPadrao }) {
  const [estado, despachar] = useReducer(dadosReducer, null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const salvo = await armazenamento.ler(CHAVE_ARMAZENAMENTO);
      if (!ativo) return;
      despachar({ tipo: 'carregar', estado: estadoSalvoOuExemplo(salvo, hoje) });
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [armazenamento, hoje]);

  useEffect(() => {
    if (!carregando && estado) armazenamento.salvar(CHAVE_ARMAZENAMENTO, estado);
  }, [estado, carregando, armazenamento]);

  const acoes = useMemo(
    () => ({
      adicionarPonto(dados) {
        const ponto = { ...limparPonto(dados), id: gerarId('p') };
        despachar({ tipo: 'adicionarPonto', ponto });
        return ponto;
      },
      editarPonto(id, dados) {
        despachar({ tipo: 'editarPonto', ponto: { ...limparPonto(dados), id } });
      },
      excluirPonto(id) {
        despachar({ tipo: 'excluirPonto', id });
      },
      restaurarPonto(ponto, entregas) {
        despachar({ tipo: 'restaurarPonto', ponto, entregas });
      },
      adicionarEntrega(dados) {
        const entrega = {
          id: gerarId('e'),
          pontoId: dados.pontoId,
          litros: lerNumero(dados.litros),
          data: dados.data,
          doador: dados.doador?.trim() ?? '',
          observacao: dados.observacao?.trim() ?? '',
          registradoPor: dados.registradoPor ?? null, // id do usuário logado
          criadoEm: Date.now(),
        };
        despachar({ tipo: 'adicionarEntrega', entrega });
        return entrega;
      },
      excluirEntrega(id) {
        despachar({ tipo: 'excluirEntrega', id });
      },
      restaurarEntrega(entrega) {
        despachar({ tipo: 'restaurarEntrega', entrega });
      },
      atualizarConfig(config) {
        despachar({ tipo: 'atualizarConfig', config });
      },
      ocultarAvisoExemplo() {
        despachar({ tipo: 'ocultarAvisoExemplo' });
      },
      restaurarExemplo() {
        despachar({ tipo: 'restaurarExemplo', hoje });
      },
      apagarTudo() {
        despachar({ tipo: 'apagarTudo' });
      },
    }),
    [hoje],
  );

  const valor = useMemo(() => ({ ...estado, hoje, carregando, acoes }), [estado, hoje, carregando, acoes]);

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

function limparPonto(dados) {
  return {
    nome: dados.nome.trim(),
    endereco: dados.endereco.trim(),
    bairro: dados.bairro.trim(),
    horario: dados.horario.trim(),
    recipiente: dados.recipiente,
    observacao: dados.observacao?.trim() ?? '',
  };
}

export function useDados() {
  const contexto = useContext(DadosContext);
  if (!contexto) throw new Error('useDados precisa estar dentro de <DadosProvider>.');
  return contexto;
}
