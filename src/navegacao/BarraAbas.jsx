import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icone from '../componentes/Icone.jsx';
import Texto from '../componentes/Texto.jsx';
import { useEstilos, useTema } from '../tema.js';
import { ABAS } from './NavegacaoContext.jsx';

/** Barra de navegação de baixo, com o botão de registrar em destaque. */
export default function BarraAbas({ abaAtiva, aoEscolher }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  const margens = useSafeAreaInsets();

  return (
    <View style={[estilos.barra, { paddingBottom: margens.bottom }]}>
      <View style={estilos.itens}>
        {ABAS.map((aba) => {
          const ativa = abaAtiva === aba.id;
          const corIcone = aba.destaque ? tema.marcaTexto : ativa ? tema.marcaTinta : tema.tinta3;
          return (
            <Pressable
              key={aba.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativa }}
              accessibilityLabel={aba.rotulo}
              onPress={() => aoEscolher(aba.id)}
              style={({ pressed }) => [estilos.aba, pressed && { opacity: 0.7 }]}
            >
              <View
                style={[
                  estilos.icone,
                  ativa && !aba.destaque && { backgroundColor: tema.marcaSuave },
                  aba.destaque && estilos.destaque,
                  aba.destaque && { backgroundColor: ativa ? tema.marcaForte : tema.marca, borderColor: tema.superficie },
                ]}
              >
                <Icone nome={aba.icone} tamanho={aba.destaque ? 26 : 22} cor={corIcone} />
              </View>
              <Texto variante="mini" cor={ativa ? tema.marcaTinta : tema.tinta3} style={estilos.rotulo}>
                {aba.rotulo}
              </Texto>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const ALTURA_ABAS = 68;

const criarEstilos = (t) => ({
  barra: { backgroundColor: t.superficie, borderTopWidth: 1, borderTopColor: t.linha },
  itens: { flexDirection: 'row', height: ALTURA_ABAS, maxWidth: 560, width: '100%', alignSelf: 'center' },
  aba: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icone: { width: 54, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  destaque: { width: 52, height: 52, borderRadius: 18, marginTop: -22, borderWidth: 4 },
  rotulo: { fontFamily: 'Figtree_600SemiBold' },
});
