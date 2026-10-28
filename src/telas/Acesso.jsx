import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Botao from '../componentes/Botao.jsx';
import { Campo, Entrada } from '../componentes/Campo.jsx';
import Icone from '../componentes/Icone.jsx';
import Painel from '../componentes/Painel.jsx';
import Texto from '../componentes/Texto.jsx';
import { useAutenticacao } from '../context/AutenticacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { SENHA_MINIMO } from '../utils/validacao.js';

const VAZIO = { nome: '', email: '', senha: '', confirmacao: '' };

/**
 * Tela de acesso: alterna entre "Entrar" e "Criar conta".
 * Aparece sempre que não há ninguém logado.
 */
export default function Acesso() {
  const { acoes } = useAutenticacao();
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  const margens = useSafeAreaInsets();

  const [modo, setModo] = useState('entrar'); // 'entrar' | 'cadastrar'
  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cadastrando = modo === 'cadastrar';

  function alterar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo] || erros.geral) setErros(({ [campo]: _, geral, ...resto }) => resto);
  }

  function trocarModo() {
    setModo(cadastrando ? 'entrar' : 'cadastrar');
    setValores((v) => ({ ...VAZIO, email: v.email }));
    setErros({});
    setMostrarSenha(false);
  }

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    const resultado = cadastrando ? await acoes.cadastrar(valores) : await acoes.entrar(valores);
    setEnviando(false);
    if (!resultado.ok) setErros(resultado.erros);
  }

  return (
    <View style={estilos.app}>
      <StatusBar style={tema.barra} />
      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingTop: margens.top + 36, paddingBottom: margens.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={estilos.cabecalho}>
          <View style={estilos.marca}>
            <Icone nome="gota" tamanho={30} cor={tema.oleoSuperficie} />
          </View>
          <Texto variante="tituloGrande" style={estilos.centro}>Coleta de Óleo</Texto>
          <Texto variante="apoio" style={estilos.centro}>
            {cadastrando
              ? 'Crie sua conta para registrar entregas e acompanhar a meta da comunidade.'
              : 'Entre para registrar entregas e acompanhar a meta da comunidade.'}
          </Texto>
        </View>

        <Painel titulo={cadastrando ? 'Criar conta' : 'Entrar'}>
          <View style={estilos.formulario}>
            {cadastrando && (
              <Campo rotulo="Nome" erro={erros.nome}>
                <Entrada
                  value={valores.nome}
                  onChangeText={(v) => alterar('nome', v)}
                  placeholder="Como você quer ser chamado"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  erro={erros.nome}
                  accessibilityLabel="Nome"
                />
              </Campo>
            )}

            <Campo rotulo="E-mail" erro={erros.email}>
              <Entrada
                value={valores.email}
                onChangeText={(v) => alterar('email', v)}
                placeholder="nome@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                erro={erros.email}
                accessibilityLabel="E-mail"
              />
            </Campo>

            <Campo
              rotulo="Senha"
              erro={erros.senha}
              dica={cadastrando ? `Pelo menos ${SENHA_MINIMO} caracteres.` : undefined}
            >
              <Entrada
                value={valores.senha}
                onChangeText={(v) => alterar('senha', v)}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={cadastrando ? 'new-password' : 'current-password'}
                textContentType={cadastrando ? 'newPassword' : 'password'}
                erro={erros.senha}
                accessibilityLabel="Senha"
              />
            </Campo>

            {cadastrando && (
              <Campo rotulo="Confirme a senha" erro={erros.confirmacao}>
                <Entrada
                  value={valores.confirmacao}
                  onChangeText={(v) => alterar('confirmacao', v)}
                  secureTextEntry={!mostrarSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType={cadastrando ? 'newPassword' : 'password'}
                  erro={erros.confirmacao}
                  accessibilityLabel="Confirme a senha"
                />
              </Campo>
            )}

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: mostrarSenha }}
              onPress={() => setMostrarSenha((m) => !m)}
              style={({ pressed }) => [estilos.mostrar, pressed && { opacity: 0.6 }]}
            >
              <View style={[estilos.caixa, mostrarSenha && estilos.caixaMarcada]}>
                {mostrarSenha && <Icone nome="check" tamanho={14} cor={tema.marcaTexto} />}
              </View>
              <Texto variante="pequeno">Mostrar senha</Texto>
            </Pressable>

            {erros.geral && (
              <View style={estilos.alerta} accessibilityLiveRegion="polite">
                <Icone nome="info" tamanho={18} cor={tema.ruim} />
                <Texto variante="pequenoForte" cor={tema.ruim} style={estilos.alertaTexto}>{erros.geral}</Texto>
              </View>
            )}

            <Botao
              titulo={enviando ? 'Aguarde…' : cadastrando ? 'Criar conta' : 'Entrar'}
              icone={cadastrando ? 'usuario' : undefined}
              bloco
              aoPressionar={enviar}
            />
          </View>
        </Painel>

        <View style={estilos.troca}>
          <Texto variante="apoio">{cadastrando ? 'Já tem conta?' : 'Ainda não tem conta?'}</Texto>
          <Pressable accessibilityRole="button" onPress={trocarModo} hitSlop={8}>
            {({ pressed }) => (
              <Texto variante="forte" cor={tema.marca} style={pressed && { opacity: 0.6 }}>
                {cadastrando ? 'Entrar' : 'Criar conta'}
              </Texto>
            )}
          </Pressable>
        </View>

        <Texto variante="mini" style={estilos.centro}>
          A conta fica salva só neste aparelho. A senha é guardada protegida, nunca em texto puro.
        </Texto>
      </ScrollView>
    </View>
  );
}

const criarEstilos = (t) => ({
  app: { flex: 1, backgroundColor: t.fundo },
  conteudo: { paddingHorizontal: 20, gap: 20, flexGrow: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  cabecalho: { alignItems: 'center', gap: 8, marginBottom: 4 },
  marca: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: t.marca,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  centro: { textAlign: 'center' },
  formulario: { gap: 16 },
  mostrar: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', paddingVertical: 2 },
  caixa: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: t.linhaForte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: { backgroundColor: t.marca, borderColor: t.marca },
  alerta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertaTexto: { flex: 1 },
  troca: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
});
