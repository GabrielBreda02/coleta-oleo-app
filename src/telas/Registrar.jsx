import { useState } from 'react';
import { View } from 'react-native';
import Botao from '../componentes/Botao.jsx';
import { Campo, Entrada } from '../componentes/Campo.jsx';
import Chip from '../componentes/Chip.jsx';
import SeletorData from '../componentes/SeletorData.jsx';
import SeletorModal from '../componentes/SeletorModal.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import { useToast } from '../componentes/Toast.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { anoMesDe, nomeMes } from '../utils/datas.js';
import { entregasDoMes, progressoMeta, somaLitros } from '../utils/estatisticas.js';
import { formatarLitros, formatarNumero, formatarPercentual, lerNumero } from '../utils/formatar.js';
import { temErros, validarEntrega } from '../utils/validacao.js';

const ATALHOS = [0.5, 1, 2, 5];

export default function Registrar({ pontoId: pontoInicial }) {
  const { pontos, entregas, config, hoje, acoes } = useDados();
  const { navegar } = useNavegacao();
  const mostrarToast = useToast();
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const pontoValido = pontos.some((p) => p.id === pontoInicial) ? pontoInicial : '';
  const [valores, setValores] = useState({ pontoId: pontoValido, litros: '', data: hoje, doador: '', observacao: '' });
  const [erros, setErros] = useState({});

  if (pontos.length === 0) {
    return (
      <Tela>
        <Vazio
          icone="pontos"
          titulo="Cadastre um ponto primeiro"
          texto="Toda entrega fica ligada a um ponto de coleta."
          acao={<Botao titulo="Cadastrar ponto" icone="mais" aoPressionar={() => navegar('pontoForm')} />}
        />
      </Tela>
    );
  }

  const ordenados = [...pontos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const mesAtual = anoMesDe(hoje);
  const litrosMes = somaLitros(entregasDoMes(entregas, mesAtual));
  const meta = progressoMeta(litrosMes, config.meta);
  const litrosDigitados = lerNumero(valores.litros);

  function alterar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _, ...resto }) => resto);
  }

  function registrar() {
    const novosErros = validarEntrega(valores, { pontos, hoje });
    setErros(novosErros);
    if (temErros(novosErros)) return;

    const entrega = acoes.adicionarEntrega(valores);
    const nomePonto = pontos.find((p) => p.id === entrega.pontoId)?.nome;
    mostrarToast(`${formatarLitros(entrega.litros)} registrados em ${nomePonto}`, {
      acao: { rotulo: 'Desfazer', aoPressionar: () => acoes.excluirEntrega(entrega.id) },
    });
    setValores((v) => ({ ...v, litros: '', doador: '', observacao: '' }));
  }

  return (
    <Tela formulario>
      <Campo rotulo="Ponto de coleta" erro={erros.pontoId}>
        <SeletorModal
          titulo="Ponto de coleta"
          valor={valores.pontoId}
          placeholder="Escolha o ponto"
          erro={erros.pontoId}
          opcoes={ordenados.map((p) => ({ valor: p.id, rotulo: p.nome, detalhe: p.bairro }))}
          aoEscolher={(v) => alterar('pontoId', v)}
        />
      </Campo>

      <Campo rotulo="Quantidade de óleo" erro={erros.litros} dica="Em litros. Uma garrafa PET grande tem 2 L.">
        <Entrada
          value={valores.litros}
          onChangeText={(v) => alterar('litros', v)}
          placeholder="0"
          keyboardType="decimal-pad"
          sufixo="L"
          erro={erros.litros}
          accessibilityLabel="Quantidade de óleo"
          style={estilos.litros}
        />
        <View style={estilos.atalhos}>
          {ATALHOS.map((q) => (
            <Chip
              key={q}
              rotulo={formatarLitros(q)}
              ativo={litrosDigitados === q}
              aoPressionar={() => alterar('litros', formatarNumero(q))}
            />
          ))}
        </View>
      </Campo>

      <Campo rotulo="Data da entrega" erro={erros.data}>
        <SeletorData valor={valores.data} hoje={hoje} erro={erros.data} aoEscolher={(v) => alterar('data', v)} />
      </Campo>

      <Campo rotulo="Quem entregou" opcional>
        <Entrada
          value={valores.doador}
          onChangeText={(v) => alterar('doador', v)}
          placeholder="Nome, família ou escola"
          accessibilityLabel="Quem entregou"
        />
      </Campo>

      <Campo rotulo="Observação" opcional>
        <Entrada
          value={valores.observacao}
          onChangeText={(v) => alterar('observacao', v)}
          multiline
          style={estilos.textoLongo}
          accessibilityLabel="Observação"
        />
      </Campo>

      <Botao titulo="Registrar entrega" icone="gota" bloco aoPressionar={registrar} />

      <View style={estilos.progresso}>
        <View style={estilos.progressoTexto}>
          <Texto variante="pequeno">Meta de {nomeMes(mesAtual)}</Texto>
          <Texto variante="pequenoForte">
            {formatarNumero(litrosMes)} de {formatarLitros(config.meta)} · {formatarPercentual(meta.percentual)}
          </Texto>
        </View>
        <View style={estilos.barra}>
          <View style={[estilos.barraPreenchida, { width: `${Math.min(100, meta.percentual)}%`, backgroundColor: tema.oleo }]} />
        </View>
      </View>
    </Tela>
  );
}

const criarEstilos = (t) => ({
  litros: { fontFamily: 'Figtree_600SemiBold', fontSize: 18 },
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  textoLongo: { minHeight: 72, textAlignVertical: 'top' },
  progresso: { backgroundColor: t.oleoSuave, borderRadius: 14, padding: 14, gap: 8 },
  progressoTexto: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  barra: { height: 10, borderRadius: 999, backgroundColor: t.superficie, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 999 },
});
