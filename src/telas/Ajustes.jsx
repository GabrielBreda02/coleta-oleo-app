import { useState } from 'react';
import { View } from 'react-native';
import Botao from '../componentes/Botao.jsx';
import { Campo, Entrada } from '../componentes/Campo.jsx';
import Confirmacao from '../componentes/Confirmacao.jsx';
import Icone from '../componentes/Icone.jsx';
import Painel from '../componentes/Painel.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import { useToast } from '../componentes/Toast.jsx';
import { useAutenticacao } from '../context/AutenticacaoContext.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { lerNumero } from '../utils/formatar.js';

export default function Ajustes() {
  const { config, acoes } = useDados();
  const { usuario, acoes: conta } = useAutenticacao();
  const { trocarAba } = useNavegacao();
  const mostrarToast = useToast();
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const [cidade, setCidade] = useState(config.cidade);
  const [meta, setMeta] = useState(String(config.meta).replace('.', ','));
  const [erros, setErros] = useState({});
  const [confirmar, setConfirmar] = useState(null); // 'apagar' | 'exemplo' | 'sair' | null

  function salvar() {
    const novosErros = {};
    const metaNumero = lerNumero(meta);
    if (!cidade.trim()) novosErros.cidade = 'Informe a cidade.';
    if (Number.isNaN(metaNumero) || metaNumero <= 0) novosErros.meta = 'A meta precisa ser um número maior que zero.';
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    acoes.atualizarConfig({ cidade: cidade.trim(), meta: metaNumero });
    mostrarToast('Ajustes salvos');
  }

  function confirmarAcao() {
    if (confirmar === 'sair') {
      setConfirmar(null);
      trocarAba('inicio'); // quem entrar depois começa pelo Início
      conta.sair();
      return;
    }
    if (confirmar === 'apagar') {
      acoes.apagarTudo();
      mostrarToast('Todos os dados foram apagados');
    } else {
      acoes.restaurarExemplo();
      mostrarToast('Dados de exemplo restaurados');
    }
    setConfirmar(null);
  }

  return (
    <Tela formulario>
      <Painel titulo="Sua conta">
        <View style={estilos.conta}>
          <View style={estilos.avatar}>
            <Icone nome="usuario" tamanho={22} cor={tema.marcaTinta} />
          </View>
          <View style={estilos.contaTexto}>
            <Texto variante="forte" numberOfLines={1}>{usuario?.nome}</Texto>
            <Texto variante="pequeno" numberOfLines={1}>{usuario?.email}</Texto>
          </View>
        </View>
        <Botao titulo="Sair da conta" icone="sair" variante="secundario" bloco style={estilos.sair} aoPressionar={() => setConfirmar('sair')} />
      </Painel>

      <Painel titulo="Campanha">
        <View style={estilos.formulario}>
          <Campo rotulo="Cidade" erro={erros.cidade} dica="Usada no botão “Como chegar”.">
            <Entrada value={cidade} onChangeText={setCidade} erro={erros.cidade} accessibilityLabel="Cidade" />
          </Campo>
          <Campo rotulo="Meta mensal" erro={erros.meta} dica="Quantos litros a comunidade quer juntar por mês.">
            <Entrada
              value={meta}
              onChangeText={setMeta}
              keyboardType="decimal-pad"
              sufixo="L"
              erro={erros.meta}
              accessibilityLabel="Meta mensal"
            />
          </Campo>
          <Botao titulo="Salvar ajustes" aoPressionar={salvar} />
        </View>
      </Painel>

      <Painel titulo="Dados">
        <Texto variante="apoio">Os dados ficam salvos neste aparelho.</Texto>
        <View style={estilos.botoes}>
          <Botao titulo="Restaurar dados de exemplo" variante="secundario" bloco aoPressionar={() => setConfirmar('exemplo')} />
          <Botao
            titulo="Apagar todos os dados"
            icone="lixo"
            variante="perigoContorno"
            bloco
            aoPressionar={() => setConfirmar('apagar')}
          />
        </View>
      </Painel>

      <Painel titulo="Sobre">
        <Texto variante="apoio" style={estilos.sobre}>
          Coleta de Óleo Usado · versão 1.0{'\n'}
          Projeto final da disciplina de Programação para Dispositivos Móveis.{'\n'}
          Feito em React Native com Expo, por Gabriel Breda.
        </Texto>
      </Painel>

      <Confirmacao
        aberta={confirmar !== null}
        titulo={TEXTOS_CONFIRMACAO[confirmar]?.titulo ?? ''}
        texto={TEXTOS_CONFIRMACAO[confirmar]?.texto ?? ''}
        rotuloConfirmar={TEXTOS_CONFIRMACAO[confirmar]?.botao ?? ''}
        perigo={confirmar === 'apagar'}
        aoConfirmar={confirmarAcao}
        aoCancelar={() => setConfirmar(null)}
      />
    </Tela>
  );
}

const TEXTOS_CONFIRMACAO = {
  sair: {
    titulo: 'Sair da conta?',
    texto: 'Os pontos e entregas continuam salvos no aparelho. Para voltar, é só entrar com seu e-mail e senha.',
    botao: 'Sair',
  },
  apagar: {
    titulo: 'Apagar todos os dados?',
    texto: 'Todos os pontos e entregas serão apagados deste aparelho. Isso não pode ser desfeito.',
    botao: 'Apagar tudo',
  },
  exemplo: {
    titulo: 'Restaurar dados de exemplo?',
    texto: 'Os pontos e entregas atuais serão trocados pelos dados de exemplo.',
    botao: 'Restaurar',
  },
};

const criarEstilos = (t) => ({
  conta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.marcaSuave, alignItems: 'center', justifyContent: 'center' },
  contaTexto: { flex: 1 },
  sair: { marginTop: 14 },
  formulario: { gap: 16 },
  botoes: { gap: 10, marginTop: 14 },
  sobre: { marginTop: 4, lineHeight: 24 },
});
