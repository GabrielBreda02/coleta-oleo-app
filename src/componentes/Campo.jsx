import { Pressable, TextInput, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/** Rótulo + campo + dica/erro. */
export function Campo({ rotulo, opcional = false, dica, erro, children }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <View style={estilos.campo}>
      {rotulo && (
        <Texto variante="medio">
          {rotulo}
          {opcional && <Texto variante="apoio">{'  (opcional)'}</Texto>}
        </Texto>
      )}
      {children}
      {dica && !erro && <Texto variante="pequeno">{dica}</Texto>}
      {erro && (
        <Texto variante="pequenoForte" cor={tema.ruim} accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      )}
    </View>
  );
}

/** Caixa de texto. */
export function Entrada({ erro, sufixo, style, ...resto }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <View>
      <TextInput
        style={[estilos.entrada, erro && { borderColor: tema.ruim }, sufixo && { paddingRight: 44 }, style]}
        placeholderTextColor={tema.tinta3}
        {...resto}
      />
      {sufixo && (
        <View style={estilos.sufixo} pointerEvents="none">
          <Texto variante="medio" cor={tema.tinta3}>{sufixo}</Texto>
        </View>
      )}
    </View>
  );
}

/** Campo que parece uma caixa de texto, mas abre uma lista/calendário ao tocar. */
export function CampoToque({ valor, placeholder, icone = 'seta', erro, aoPressionar }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={aoPressionar}
      style={({ pressed }) => [estilos.entrada, estilos.toque, erro && { borderColor: tema.ruim }, pressed && { opacity: 0.7 }]}
    >
      <Texto variante="corpo" cor={valor ? tema.tinta : tema.tinta3} style={estilos.toqueTexto} numberOfLines={1}>
        {valor || placeholder}
      </Texto>
      <Icone nome={icone} tamanho={18} cor={tema.tinta2} />
    </Pressable>
  );
}

const criarEstilos = (t) => ({
  campo: { gap: 7 },
  entrada: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: t.linhaForte,
    borderRadius: 14,
    backgroundColor: t.superficie,
    color: t.tinta,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 16,
  },
  toque: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  toqueTexto: { flex: 1 },
  sufixo: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
});
