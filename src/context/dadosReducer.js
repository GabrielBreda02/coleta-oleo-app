// Todas as alterações nos dados passam por aqui (padrão "reducer" do React).
import { CONFIG_PADRAO, criarDadosExemplo } from '../utils/dadosExemplo.js';

export const CHAVE_ARMAZENAMENTO = 'coleta-oleo:v1';

/** Carrega o que estava salvo ou, na primeira vez, os dados de exemplo. */
export function estadoSalvoOuExemplo(salvo, hoje) {
  if (salvo && Array.isArray(salvo.pontos) && Array.isArray(salvo.entregas)) {
    return {
      pontos: salvo.pontos,
      entregas: salvo.entregas,
      config: { ...CONFIG_PADRAO, ...salvo.config },
      avisoExemplo: Boolean(salvo.avisoExemplo),
    };
  }
  return criarDadosExemplo(hoje);
}

export function dadosReducer(estado, acao) {
  switch (acao.tipo) {
    // Carrega o que veio do aparelho quando o app abre
    case 'carregar':
      return acao.estado;

    case 'adicionarPonto':
      return { ...estado, pontos: [...estado.pontos, acao.ponto] };

    case 'editarPonto':
      return {
        ...estado,
        pontos: estado.pontos.map((p) => (p.id === acao.ponto.id ? { ...p, ...acao.ponto } : p)),
      };

    // Excluir um ponto também exclui as entregas dele
    case 'excluirPonto':
      return {
        ...estado,
        pontos: estado.pontos.filter((p) => p.id !== acao.id),
        entregas: estado.entregas.filter((e) => e.pontoId !== acao.id),
      };

    // Usado pelo botão "Desfazer" depois de excluir um ponto
    case 'restaurarPonto':
      if (estado.pontos.some((p) => p.id === acao.ponto.id)) return estado;
      return {
        ...estado,
        pontos: [...estado.pontos, acao.ponto],
        entregas: [...estado.entregas, ...acao.entregas],
      };

    case 'adicionarEntrega':
      return { ...estado, entregas: [...estado.entregas, acao.entrega] };

    case 'excluirEntrega':
      return { ...estado, entregas: estado.entregas.filter((e) => e.id !== acao.id) };

    case 'restaurarEntrega':
      if (estado.entregas.some((e) => e.id === acao.entrega.id)) return estado;
      return { ...estado, entregas: [...estado.entregas, acao.entrega] };

    case 'atualizarConfig':
      return { ...estado, config: { ...estado.config, ...acao.config } };

    case 'ocultarAvisoExemplo':
      return { ...estado, avisoExemplo: false };

    case 'restaurarExemplo':
      return criarDadosExemplo(acao.hoje);

    case 'apagarTudo':
      return { pontos: [], entregas: [], config: estado.config, avisoExemplo: false };

    default:
      return estado;
  }
}
