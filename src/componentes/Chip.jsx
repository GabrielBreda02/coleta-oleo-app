import { Pressable } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import Texto from './Texto.jsx';

/** Botão redondo de filtro/atalho (ex.: bairros, 0,5 L, 1 L...). */
export default function Chip({ rotulo, ativo = false, aoPressionar }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={aoPressionar}
      style={({ pressed }) => [estilos.chip, ativo && estilos.ativo, pressed && { opacity: 0.75 }]}
    >
      <Texto variante="pequenoForte" cor={ativo ? tema.marcaTexto : tema.tinta2}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const criarEstilos = (t) => ({
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: t.linhaForte,
    backgroundColor: t.superficie,
  },
  ativo: { backgroundColor: t.marca, borderColor: t.marca },
});
