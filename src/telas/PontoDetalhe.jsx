import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import Blocos from '../componentes/Blocos.jsx';
import Botao from '../componentes/Botao.jsx';
import Confirmacao from '../componentes/Confirmacao.jsx';
import GraficoColunas from '../componentes/GraficoColunas.jsx';
import Icone from '../componentes/Icone.jsx';
import ListaEntregas from '../componentes/ListaEntregas.jsx';
import Painel from '../componentes/Painel.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import { useToast } from '../componentes/Toast.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { anoMesDe, nomeMes, rotuloDia } from '../utils/datas.js';
import { litrosPorMes, ordenarEntregas, resumoPonto } from '../utils/estatisticas.js';
import { formatarLitros, plural } from '../utils/formatar.js';

/** Monta o link que abre o endereço no app de mapas. */
export function linkMapa(ponto, cidade) {
  const endereco = `${ponto.endereco}, ${ponto.bairro}, ${cidade}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

export default function PontoDetalhe({ id }) {
  const { pontos, entregas, config, hoje, acoes } = useDados();
  const { navegar, voltar, trocarAba } = useNavegacao();
  const mostrarToast = useToast();
  const [confirmando, setConfirmando] = useState(false);
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const ponto = pontos.find((p) => p.id === id);
  if (!ponto) {
    return (
      <Tela>
        <Vazio
          icone="pontos"
          titulo="Ponto não encontrado"
          texto="Ele pode ter sido excluído."
          acao={<Botao titulo="Ver pontos" variante="secundario" aoPressionar={() => trocarAba('pontos')} />}
        />
      </Tela>
    );
  }

  const resumo = resumoPonto(id, entregas);
  const doPonto = ordenarEntregas(entregas.filter((e) => e.pontoId === id));
  const mesAtual = anoMesDe(hoje);
  const meses = litrosPorMes(doPonto, hoje, 6).map((m) => ({
    chave: m.anoMes,
    rotulo: nomeMes(m.anoMes, { curto: true }),
    rotuloLongo: m.anoMes === mesAtual ? `${nomeMes(m.anoMes)} (até hoje)` : nomeMes(m.anoMes, { comAno: true }),
    valor: m.litros,
    quantidade: m.entregas,
    detalhe: plural(m.entregas, 'entrega'),
  }));

  function excluir() {
    setConfirmando(false);
    acoes.excluirPonto(id);
    voltar();
    mostrarToast(`"${ponto.nome}" foi excluído`, {
      acao: { rotulo: 'Desfazer', aoPressionar: () => acoes.restaurarPonto(ponto, doPonto) },
    });
  }

  return (
    <Tela>
      <View style={estilos.topo}>
        <View style={estilos.tag}>
          <Texto variante="mini" cor={tema.marcaTinta} style={estilos.tagTexto}>{ponto.bairro}</Texto>
        </View>
        <Texto variante="tituloGrande">{ponto.nome}</Texto>
        <Texto variante="apoio">{ponto.endereco} · {config.cidade}</Texto>
      </View>

      <View style={estilos.acoes}>
        <Botao
          titulo="Como chegar"
          icone="rota"
          variante="secundario"
          style={estilos.acao}
          aoPressionar={() => Linking.openURL(linkMapa(ponto, config.cidade))}
        />
        <Botao
          titulo="Registrar"
          icone="gota"
          style={estilos.acao}
          aoPressionar={() => navegar('registrar', { pontoId: id })}
        />
      </View>

      <Painel semPadding style={estilos.info}>
        <LinhaInfo icone="relogio" rotulo="Horário" valor={ponto.horario} primeira />
        <LinhaInfo icone="garrafa" rotulo="Aceita" valor={ponto.recipiente} />
        {!!ponto.observacao && <LinhaInfo icone="info" rotulo="Observação" valor={ponto.observacao} />}
      </Painel>

      <Blocos
        colunas={3}
        itens={[
          { chave: 'litros', rotulo: 'Arrecadado', valor: formatarLitros(resumo.litros) },
          { chave: 'entregas', rotulo: 'Entregas', valor: String(resumo.entregas) },
          { chave: 'ultima', rotulo: 'Última', valor: resumo.ultimaEntrega ? rotuloDia(resumo.ultimaEntrega, hoje) : '—' },
        ]}
      />

      {resumo.entregas > 0 && (
        <Painel titulo="Litros por mês" subtitulo="Últimos 6 meses">
          <GraficoColunas dados={meses} altura={130} />
        </Painel>
      )}

      <View style={estilos.secao}>
        <View style={estilos.secaoTopo}>
          <Texto variante="painel">Entregas recentes</Texto>
          {resumo.entregas > 5 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => navegar('historico', { pontoId: id })}
              style={({ pressed }) => [estilos.link, pressed && { opacity: 0.7 }]}
            >
              <Texto variante="pequenoForte" cor={tema.marcaTinta}>Ver todas</Texto>
              <Icone nome="seta" tamanho={16} cor={tema.marcaTinta} />
            </Pressable>
          )}
        </View>
        {doPonto.length > 0 ? (
          <ListaEntregas entregas={doPonto.slice(0, 5)} pontos={pontos} hoje={hoje} mostrarPonto={false} />
        ) : (
          <Texto variante="apoio">Nenhuma entrega neste ponto ainda.</Texto>
        )}
      </View>

      <View style={estilos.acoes}>
        <Botao
          titulo="Editar"
          icone="editar"
          variante="secundario"
          style={estilos.acao}
          aoPressionar={() => navegar('pontoForm', { id })}
        />
        <Botao
          titulo="Excluir"
          icone="lixo"
          variante="perigoContorno"
          style={estilos.acao}
          aoPressionar={() => setConfirmando(true)}
        />
      </View>

      <Confirmacao
        aberta={confirmando}
        titulo="Excluir este ponto?"
        texto={
          resumo.entregas > 0
            ? `As ${plural(resumo.entregas, 'entrega')} deste ponto (${formatarLitros(resumo.litros)}) também serão excluídas.`
            : `"${ponto.nome}" sai da lista de pontos.`
        }
        rotuloConfirmar="Excluir ponto"
        perigo
        aoConfirmar={excluir}
        aoCancelar={() => setConfirmando(false)}
      />
    </Tela>
  );
}

function LinhaInfo({ icone, rotulo, valor, primeira = false }) {
  const estilos = useEstilos(criarEstilos);
  return (
    <View style={[estilos.infoLinha, !primeira && estilos.bordaTopo]}>
      <View style={estilos.infoRotulo}>
        <Icone nome={icone} tamanho={18} />
        <Texto variante="pequeno">{rotulo}</Texto>
      </View>
      <Texto variante="medio" style={estilos.infoValor}>{valor}</Texto>
    </View>
  );
}

const criarEstilos = (t) => ({
  topo: { paddingHorizontal: 4, gap: 8, alignItems: 'flex-start' },
  tag: { backgroundColor: t.marcaSuave, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  tagTexto: { fontFamily: 'Figtree_700Bold' },
  acoes: { flexDirection: 'row', gap: 10 },
  acao: { flex: 1 },
  info: { paddingHorizontal: 16 },
  infoLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  bordaTopo: { borderTopWidth: 1, borderTopColor: t.linha },
  infoRotulo: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 118 },
  infoValor: { flex: 1 },
  secao: { gap: 10 },
  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
});
