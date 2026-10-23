import { Pressable, View } from 'react-native';
import Blocos from '../componentes/Blocos.jsx';
import Botao from '../componentes/Botao.jsx';
import GraficoBarras from '../componentes/GraficoBarras.jsx';
import GraficoColunas from '../componentes/GraficoColunas.jsx';
import Icone from '../componentes/Icone.jsx';
import ListaEntregas from '../componentes/ListaEntregas.jsx';
import MedidorGarrafa from '../componentes/MedidorGarrafa.jsx';
import Painel from '../componentes/Painel.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { anoMesDe, diasRestantesNoMes, nomeMes } from '../utils/datas.js';
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
  somaLitros,
} from '../utils/estatisticas.js';
import { formatarLitros, formatarNumero, formatarPercentual, plural } from '../utils/formatar.js';

export default function Inicio() {
  const { pontos, entregas, config, hoje, avisoExemplo, acoes } = useDados();
  const { navegar, trocarAba } = useNavegacao();
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const mesAtual = anoMesDe(hoje);
  const doMes = entregasDoMes(entregas, mesAtual);
  const litrosMes = somaLitros(doMes);
  const total = somaLitros(entregas);
  const meta = progressoMeta(litrosMes, config.meta);
  const comparativo = comparativoMesmoPeriodo(entregas, hoje);
  const diasRestantes = diasRestantesNoMes(hoje);
  const primeiroMes = mesesComEntregas(entregas).at(-1);
  const bairros = new Set(pontos.map((p) => p.bairro)).size;
  const temEntregas = entregas.length > 0;

  const meses = litrosPorMes(entregas, hoje, 6).map((m) => ({
    chave: m.anoMes,
    rotulo: nomeMes(m.anoMes, { curto: true }),
    rotuloLongo: m.anoMes === mesAtual ? `${nomeMes(m.anoMes)} (até hoje)` : nomeMes(m.anoMes, { comAno: true }),
    valor: m.litros,
    quantidade: m.entregas,
    detalhe: plural(m.entregas, 'entrega'),
  }));

  const ranking = rankingPontos(pontos, entregas, 5)
    .filter((r) => r.litros > 0)
    .map((r) => ({ chave: r.ponto.id, rotulo: r.ponto.nome, valor: r.litros, descricao: plural(r.entregas, 'entrega') }));

  const ultimas = ordenarEntregas(entregas).slice(0, 5);

  const blocos = [
    {
      chave: 'mes',
      rotulo: 'Neste mês',
      valor: formatarLitros(litrosMes),
      extra:
        comparativo.variacao === null ? (
          <Texto variante="mini">Sem entregas no mesmo período de {nomeMes(comparativo.mesAnterior)}</Texto>
        ) : (
          <View style={estilos.delta}>
            <Icone
              nome={comparativo.variacao >= 0 ? 'subiu' : 'desceu'}
              tamanho={14}
              cor={comparativo.variacao >= 0 ? tema.bom : tema.ruim}
            />
            <Texto variante="mini" cor={comparativo.variacao >= 0 ? tema.bom : tema.ruim} style={estilos.deltaTexto}>
              {formatarPercentual(Math.abs(comparativo.variacao))}
            </Texto>
            <Texto variante="mini" style={estilos.deltaApoio}>vs. {nomeMes(comparativo.mesAnterior)}</Texto>
          </View>
        ),
    },
    {
      chave: 'entregas',
      rotulo: 'Entregas no mês',
      valor: String(doMes.length),
      extra: doMes.length ? `Média de ${formatarLitros(mediaPorEntrega(doMes))} por entrega` : 'Nenhuma entrega ainda',
    },
    {
      chave: 'pontos',
      rotulo: 'Pontos de coleta',
      valor: String(pontos.length),
      extra: pontos.length ? `Em ${plural(bairros, 'bairro')}` : 'Nenhum cadastrado',
    },
    {
      chave: 'media',
      rotulo: 'Média geral',
      valor: temEntregas ? formatarLitros(mediaPorEntrega(entregas)) : '—',
      extra: 'Por entrega, desde o início',
    },
  ];

  return (
    <Tela>
      {avisoExemplo && (
        <View style={estilos.aviso}>
          <Icone nome="info" tamanho={20} cor={tema.tinta2} />
          <Texto variante="pequeno" style={estilos.avisoTexto}>
            <Texto variante="pequenoForte">Você está vendo dados de exemplo. </Texto>
            Para usar de verdade, apague tudo em Ajustes.
          </Texto>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso"
            onPress={acoes.ocultarAvisoExemplo}
            style={({ pressed }) => [estilos.fechar, pressed && { opacity: 0.6 }]}
          >
            <Icone nome="fechar" tamanho={18} />
          </Pressable>
        </View>
      )}

      <View style={estilos.hero}>
        <Texto variante="rotulo">Total arrecadado</Texto>
        <View style={estilos.heroNumero}>
          <Texto variante="hero">{formatarNumero(total)}</Texto>
          <Texto variante="titulo" cor={tema.tinta2} style={estilos.heroUnidade}>litros</Texto>
        </View>
        <Texto variante="apoio">
          {temEntregas
            ? `${plural(entregas.length, 'entrega')} desde ${nomeMes(primeiroMes, { comAno: true })}. Dá para encher ${plural(garrafasPet2L(total), 'garrafa')} PET de 2 L.`
            : 'Nenhuma entrega registrada ainda.'}
        </Texto>
      </View>

      <Painel style={estilos.meta}>
        <MedidorGarrafa percentual={meta.percentual} />
        <View style={estilos.metaInfo}>
          <Texto variante="rotulo">Meta de {nomeMes(mesAtual)}</Texto>
          <View style={estilos.metaLinha}>
            <Texto variante="numeroGrande">{formatarNumero(litrosMes)}</Texto>
            <Texto variante="apoio">de {formatarLitros(config.meta)}</Texto>
          </View>
          <Texto variante="pequenoForte" cor={tema.oleoTinta}>{formatarPercentual(meta.percentual)} da meta</Texto>
          {meta.batida ? (
            <View style={estilos.selo}>
              <Icone nome="check" tamanho={16} cor={tema.bom} />
              <Texto variante="pequenoForte" cor={tema.bom}>Meta batida!</Texto>
            </View>
          ) : (
            <Texto variante="pequeno">
              Faltam <Texto variante="pequenoForte">{formatarLitros(meta.faltam)}</Texto>
              {diasRestantes > 0 ? ` em ${plural(diasRestantes, 'dia')}` : ' e hoje é o último dia do mês'}
            </Texto>
          )}
        </View>
      </Painel>

      <Blocos itens={blocos} />

      {!temEntregas && (
        <Painel semPadding>
          {pontos.length === 0 ? (
            <Vazio
              icone="pontos"
              titulo="Comece cadastrando um ponto de coleta"
              texto="Depois é só registrar as entregas de óleo e acompanhar tudo por aqui."
              acao={<Botao titulo="Cadastrar ponto" icone="mais" aoPressionar={() => navegar('pontoForm')} />}
            />
          ) : (
            <Vazio
              icone="gota"
              titulo="Registre a primeira entrega"
              texto="Os gráficos aparecem assim que houver entregas."
              acao={<Botao titulo="Registrar entrega" icone="mais" aoPressionar={() => trocarAba('registrar')} />}
            />
          )}
        </Painel>
      )}

      {temEntregas && (
        <>
          <Painel titulo="Litros por mês" subtitulo="Últimos 6 meses">
            <GraficoColunas dados={meses} />
          </Painel>

          <Painel titulo="Pontos que mais arrecadaram" subtitulo="Desde o início">
            <GraficoBarras itens={ranking} aoEscolher={(item) => navegar('pontoDetalhe', { id: item.chave })} />
            <Pressable
              accessibilityRole="button"
              onPress={() => trocarAba('pontos')}
              style={({ pressed }) => [estilos.link, pressed && { opacity: 0.7 }]}
            >
              <Texto variante="pequenoForte" cor={tema.marcaTinta}>Ver todos os pontos</Texto>
              <Icone nome="seta" tamanho={16} cor={tema.marcaTinta} />
            </Pressable>
          </Painel>

          <View style={estilos.secao}>
            <View style={estilos.secaoTopo}>
              <Texto variante="painel">Últimas entregas</Texto>
              <Pressable
                accessibilityRole="button"
                onPress={() => trocarAba('historico')}
                style={({ pressed }) => [estilos.link, pressed && { opacity: 0.7 }]}
              >
                <Texto variante="pequenoForte" cor={tema.marcaTinta}>Ver histórico</Texto>
                <Icone nome="seta" tamanho={16} cor={tema.marcaTinta} />
              </Pressable>
            </View>
            <ListaEntregas entregas={ultimas} pontos={pontos} hoje={hoje} />
          </View>
        </>
      )}
    </Tela>
  );
}

const criarEstilos = (t) => ({
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    paddingLeft: 14,
    borderRadius: 14,
    backgroundColor: t.superficie2,
  },
  avisoTexto: { flex: 1 },
  fechar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginTop: -4, marginRight: -4 },
  hero: { paddingHorizontal: 4, paddingTop: 4, gap: 4 },
  heroNumero: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginVertical: 4 },
  heroUnidade: { paddingBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: t.oleoSuave, borderColor: 'transparent' },
  metaInfo: { flex: 1, gap: 4, alignItems: 'flex-start' },
  metaLinha: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: t.bomFundo,
  },
  delta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 },
  deltaTexto: { fontFamily: 'Figtree_700Bold' },
  deltaApoio: { marginLeft: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  secao: { gap: 10 },
  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
});
