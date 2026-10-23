import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useDados } from './context/DadosContext.jsx';
import BarraAbas from './navegacao/BarraAbas.jsx';
import { useNavegacao } from './navegacao/NavegacaoContext.jsx';
import Topo from './navegacao/Topo.jsx';
import Ajustes from './telas/Ajustes.jsx';
import Dicas from './telas/Dicas.jsx';
import Historico from './telas/Historico.jsx';
import Inicio from './telas/Inicio.jsx';
import PontoDetalhe from './telas/PontoDetalhe.jsx';
import PontoForm from './telas/PontoForm.jsx';
import Pontos from './telas/Pontos.jsx';
import Registrar from './telas/Registrar.jsx';
import { useEstilos, useTema } from './tema.js';

const TELAS = {
  inicio: { titulo: 'Coleta de Óleo', comCidade: true, Componente: Inicio },
  pontos: { titulo: 'Pontos de coleta', Componente: Pontos },
  pontoDetalhe: { titulo: 'Ponto de coleta', Componente: PontoDetalhe },
  pontoForm: { titulo: (params) => (params.id ? 'Editar ponto' : 'Novo ponto'), Componente: PontoForm },
  registrar: { titulo: 'Registrar entrega', Componente: Registrar },
  historico: { titulo: 'Histórico', Componente: Historico },
  dicas: { titulo: 'Dicas', Componente: Dicas },
  ajustes: { titulo: 'Ajustes', Componente: Ajustes },
};

export default function Aplicativo() {
  const { tela, params, podeVoltar, abaAtiva, voltar, trocarAba, navegar } = useNavegacao();
  const { carregando, config } = useDados();
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  // Esconde a tela de abertura assim que os dados terminam de carregar
  useEffect(() => {
    if (!carregando) SplashScreen.hideAsync().catch(() => {});
  }, [carregando]);

  if (carregando) {
    return (
      <View style={estilos.carregando}>
        <StatusBar style={tema.barra} />
        <ActivityIndicator size="large" color={tema.marca} />
      </View>
    );
  }

  const definicao = TELAS[tela] ?? TELAS.inicio;
  const Componente = definicao.Componente;
  const titulo = typeof definicao.titulo === 'function' ? definicao.titulo(params) : definicao.titulo;

  return (
    <View style={estilos.app}>
      <StatusBar style={tema.barra} />
      <Topo
        titulo={titulo}
        subtitulo={definicao.comCidade ? config.cidade : undefined}
        podeVoltar={podeVoltar}
        mostrarAjustes={tela !== 'ajustes'}
        aoVoltar={voltar}
        aoAbrirAjustes={() => navegar('ajustes')}
      />

      <View style={estilos.conteudo}>
        <Componente {...params} />
      </View>

      <BarraAbas abaAtiva={abaAtiva} aoEscolher={trocarAba} />
    </View>
  );
}

const criarEstilos = (t) => ({
  app: { flex: 1, backgroundColor: t.fundo },
  conteudo: { flex: 1 },
  carregando: { flex: 1, backgroundColor: t.fundo, alignItems: 'center', justifyContent: 'center' },
});
