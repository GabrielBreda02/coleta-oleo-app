import { useState } from 'react';
import { View } from 'react-native';
import Botao from '../componentes/Botao.jsx';
import { Campo } from '../componentes/Campo.jsx';
import { LinhaEntrega } from '../componentes/ListaEntregas.jsx';
import SeletorModal from '../componentes/SeletorModal.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import { useToast } from '../componentes/Toast.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos } from '../tema.js';
import { anoMesDe, nomeMes, rotuloDia } from '../utils/datas.js';
import { mesesComEntregas, ordenarEntregas, somaLitros } from '../utils/estatisticas.js';
import { formatarLitros, plural } from '../utils/formatar.js';

const POR_PAGINA = 30;

export default function Historico({ pontoId: pontoInicial }) {
  const { pontos, entregas, hoje, acoes } = useDados();
  const { trocarAba } = useNavegacao();
  const mostrarToast = useToast();
  const estilos = useEstilos(criarEstilos);

  const [mes, setMes] = useState('todos');
  const [pontoId, setPontoId] = useState(pontos.some((p) => p.id === pontoInicial) ? pontoInicial : 'todos');
  const [limite, setLimite] = useState(POR_PAGINA);

  if (entregas.length === 0) {
    return (
      <Tela>
        <Vazio
          icone="historico"
          titulo="Nenhuma entrega registrada"
          texto="As entregas aparecem aqui, da mais recente para a mais antiga."
          acao={<Botao titulo="Registrar entrega" icone="mais" aoPressionar={() => trocarAba('registrar')} />}
        />
      </Tela>
    );
  }

  const nomes = new Map(pontos.map((p) => [p.id, p.nome]));
  const meses = mesesComEntregas(entregas);
  const ordenadosPontos = [...pontos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const filtradas = ordenarEntregas(
    entregas.filter((e) => (mes === 'todos' || anoMesDe(e.data) === mes) && (pontoId === 'todos' || e.pontoId === pontoId)),
  );
  const visiveis = filtradas.slice(0, limite);

  // Agrupa por dia
  const grupos = [];
  for (const e of visiveis) {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.data === e.data) ultimo.entregas.push(e);
    else grupos.push({ data: e.data, entregas: [e] });
  }

  function excluir(entrega) {
    acoes.excluirEntrega(entrega.id);
    mostrarToast(`Entrega de ${formatarLitros(entrega.litros)} excluída`, {
      acao: { rotulo: 'Desfazer', aoPressionar: () => acoes.restaurarEntrega(entrega) },
    });
  }

  return (
    <Tela>
      <View style={estilos.filtros}>
        <Campo rotulo="Mês">
          <SeletorModal
            titulo="Filtrar por mês"
            valor={mes}
            opcoes={[
              { valor: 'todos', rotulo: 'Todos os meses' },
              ...meses.map((m) => ({ valor: m, rotulo: nomeMes(m, { comAno: true }) })),
            ]}
            aoEscolher={(v) => {
              setMes(v);
              setLimite(POR_PAGINA);
            }}
          />
        </Campo>
        <Campo rotulo="Ponto">
          <SeletorModal
            titulo="Filtrar por ponto"
            valor={pontoId}
            opcoes={[
              { valor: 'todos', rotulo: 'Todos os pontos' },
              ...ordenadosPontos.map((p) => ({ valor: p.id, rotulo: p.nome, detalhe: p.bairro })),
            ]}
            aoEscolher={(v) => {
              setPontoId(v);
              setLimite(POR_PAGINA);
            }}
          />
        </Campo>
      </View>

      <Texto variante="apoio" style={estilos.resumo}>
        <Texto variante="forte">{plural(filtradas.length, 'entrega')}</Texto> · {formatarLitros(somaLitros(filtradas))}
      </Texto>

      {filtradas.length === 0 ? (
        <Vazio
          icone="busca"
          titulo="Nenhuma entrega com esses filtros"
          acao={
            <Botao
              titulo="Limpar filtros"
              variante="secundario"
              aoPressionar={() => {
                setMes('todos');
                setPontoId('todos');
              }}
            />
          }
        />
      ) : (
        <View style={estilos.grupos}>
          {grupos.map((g) => (
            <View key={g.data} style={estilos.grupo}>
              <View style={estilos.grupoTitulo}>
                <Texto variante="rotulo">{rotuloDia(g.data, hoje)}</Texto>
                <Texto variante="rotulo">{formatarLitros(somaLitros(g.entregas))}</Texto>
              </View>
              <View style={estilos.lista}>
                {g.entregas.map((e, i) => (
                  <LinhaEntrega
                    key={e.id}
                    entrega={e}
                    nomePonto={nomes.get(e.pontoId) ?? 'Ponto removido'}
                    hoje={hoje}
                    mostrarData={false}
                    aoExcluir={excluir}
                    primeira={i === 0}
                  />
                ))}
              </View>
            </View>
          ))}

          {filtradas.length > limite && (
            <Botao
              titulo={`Mostrar mais (${filtradas.length - limite} restantes)`}
              variante="secundario"
              bloco
              aoPressionar={() => setLimite((l) => l + POR_PAGINA)}
            />
          )}
        </View>
      )}
    </Tela>
  );
}

const criarEstilos = (t) => ({
  filtros: { gap: 12 },
  resumo: { paddingHorizontal: 4 },
  grupos: { gap: 16 },
  grupo: { gap: 8 },
  grupoTitulo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  lista: { backgroundColor: t.superficie, borderWidth: 1, borderColor: t.linha, borderRadius: 18, overflow: 'hidden' },
});
