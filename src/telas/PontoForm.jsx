import { useState } from 'react';
import { View } from 'react-native';
import Botao from '../componentes/Botao.jsx';
import { Campo, Entrada } from '../componentes/Campo.jsx';
import SeletorModal from '../componentes/SeletorModal.jsx';
import Tela from '../componentes/Tela.jsx';
import { useToast } from '../componentes/Toast.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos } from '../tema.js';
import { RECIPIENTES } from '../utils/dadosExemplo.js';
import { temErros, validarPonto } from '../utils/validacao.js';

const VAZIO = { nome: '', endereco: '', bairro: '', horario: '', recipiente: RECIPIENTES[0], observacao: '' };

/** Formulário de cadastro (sem id) e de edição (com id). */
export default function PontoForm({ id }) {
  const { pontos, acoes } = useDados();
  const { navegar, voltar, trocarAba } = useNavegacao();
  const mostrarToast = useToast();
  const existente = id ? pontos.find((p) => p.id === id) : null;
  const [valores, setValores] = useState(() => (existente ? { ...VAZIO, ...existente } : VAZIO));
  const [erros, setErros] = useState({});
  const estilos = useEstilos(criarEstilos);

  if (id && !existente) {
    return (
      <Tela>
        <Vazio titulo="Ponto não encontrado" acao={<Botao titulo="Ver pontos" variante="secundario" aoPressionar={() => trocarAba('pontos')} />} />
      </Tela>
    );
  }

  function alterar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _, ...resto }) => resto);
  }

  function salvar() {
    const novosErros = validarPonto(valores);
    setErros(novosErros);
    if (temErros(novosErros)) return;

    if (existente) {
      acoes.editarPonto(id, valores);
      mostrarToast('Alterações salvas');
      voltar();
    } else {
      const novo = acoes.adicionarPonto(valores);
      mostrarToast(`"${novo.nome}" cadastrado`);
      voltar();
      navegar('pontoDetalhe', { id: novo.id });
    }
  }

  return (
    <Tela formulario>
      <Campo rotulo="Nome do ponto" erro={erros.nome}>
        <Entrada
          value={valores.nome}
          onChangeText={(v) => alterar('nome', v)}
          placeholder="Ex.: Mercado do Bairro"
          erro={erros.nome}
          accessibilityLabel="Nome do ponto"
        />
      </Campo>

      <Campo rotulo="Endereço" erro={erros.endereco}>
        <Entrada
          value={valores.endereco}
          onChangeText={(v) => alterar('endereco', v)}
          placeholder="Rua e número"
          erro={erros.endereco}
          accessibilityLabel="Endereço"
        />
      </Campo>

      <Campo rotulo="Bairro" erro={erros.bairro}>
        <Entrada
          value={valores.bairro}
          onChangeText={(v) => alterar('bairro', v)}
          placeholder="Ex.: Centro"
          erro={erros.bairro}
          accessibilityLabel="Bairro"
        />
      </Campo>

      <Campo rotulo="Horário de funcionamento" erro={erros.horario} dica="Ex.: Seg a sex, 8h às 18h">
        <Entrada
          value={valores.horario}
          onChangeText={(v) => alterar('horario', v)}
          placeholder="Seg a sex, 8h às 18h"
          erro={erros.horario}
          accessibilityLabel="Horário de funcionamento"
        />
      </Campo>

      <Campo rotulo="Como o óleo deve ser entregue">
        <SeletorModal
          titulo="Como o óleo deve ser entregue"
          valor={valores.recipiente}
          opcoes={RECIPIENTES.map((r) => ({ valor: r, rotulo: r }))}
          aoEscolher={(v) => alterar('recipiente', v)}
        />
      </Campo>

      <Campo rotulo="Observação" opcional dica="Ex.: entregar na portaria">
        <Entrada
          value={valores.observacao}
          onChangeText={(v) => alterar('observacao', v)}
          multiline
          numberOfLines={3}
          style={estilos.textoLongo}
          accessibilityLabel="Observação"
        />
      </Campo>

      <View style={estilos.acoes}>
        <Botao titulo="Cancelar" variante="secundario" style={estilos.acao} aoPressionar={voltar} />
        <Botao titulo={existente ? 'Salvar alterações' : 'Cadastrar ponto'} style={estilos.acao} aoPressionar={salvar} />
      </View>
    </Tela>
  );
}

const criarEstilos = () => ({
  textoLongo: { minHeight: 88, textAlignVertical: 'top' },
  acoes: { flexDirection: 'row', gap: 10, marginTop: 4 },
  acao: { flex: 1 },
});
