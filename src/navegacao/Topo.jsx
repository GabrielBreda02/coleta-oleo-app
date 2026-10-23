import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icone from '../componentes/Icone.jsx';
import Texto from '../componentes/Texto.jsx';
import { useEstilos, useTema } from '../tema.js';

/** Barra de cima: voltar (ou logo), título e atalho para Ajustes. */
export default function Topo({ titulo, subtitulo, podeVoltar, mostrarAjustes = true, aoVoltar, aoAbrirAjustes }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  const margens = useSafeAreaInsets();

  return (
    <View style={[estilos.topo, { paddingTop: margens.top }]}>
      <View style={estilos.conteudo}>
        {podeVoltar ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={aoVoltar}
            style={({ pressed }) => [estilos.iconeBotao, pressed && { opacity: 0.6 }]}
          >
            <Icone nome="voltar" tamanho={22} />
          </Pressable>
        ) : (
          <View style={estilos.marca}>
            <Icone nome="gota" tamanho={20} cor={tema.oleoSuperficie} />
          </View>
        )}

        <View style={estilos.titulos}>
          <Texto variante="titulo" numberOfLines={1}>{titulo}</Texto>
          {subtitulo && <Texto variante="pequeno" numberOfLines={1}>{subtitulo}</Texto>}
        </View>

        {mostrarAjustes && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            onPress={aoAbrirAjustes}
            style={({ pressed }) => [estilos.iconeBotao, pressed && { opacity: 0.6 }]}
          >
            <Icone nome="ajustes" tamanho={22} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const criarEstilos = (t) => ({
  topo: { backgroundColor: t.fundo, borderBottomWidth: 1, borderBottomColor: t.linha },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16 },
  marca: { width: 38, height: 38, borderRadius: 12, backgroundColor: t.marca, alignItems: 'center', justifyContent: 'center' },
  titulos: { flex: 1 },
  iconeBotao: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
