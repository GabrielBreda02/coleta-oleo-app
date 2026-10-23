import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALTURA_ABAS } from '../navegacao/BarraAbas.jsx';
import { useEstilos } from '../tema.js';

/** Área rolável padrão das telas, já com espaço para a barra de abas. */
export default function Tela({ children, formulario = false }) {
  const estilos = useEstilos(criarEstilos);
  const margens = useSafeAreaInsets();
  return (
    <ScrollView
      style={estilos.rolagem}
      contentContainerStyle={[estilos.conteudo, { paddingBottom: ALTURA_ABAS + margens.bottom + 28 }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={formulario}
    >
      <View style={estilos.pilha}>{children}</View>
    </ScrollView>
  );
}

const criarEstilos = () => ({
  rolagem: { flex: 1 },
  conteudo: { paddingHorizontal: 16, paddingTop: 14 },
  pilha: { gap: 16 },
});
