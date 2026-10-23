import { Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/**
 * Botão do app.
 * variante: 'primario' | 'secundario' | 'perigo' | 'perigoContorno'
 */
export default function Botao({
  titulo,
  icone,
  variante = 'primario',
  pequeno = false,
  bloco = false,
  aoPressionar,
  style,
}) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const cores = {
    primario: { fundo: tema.marca, borda: tema.marca, texto: tema.marcaTexto },
    secundario: { fundo: tema.superficie, borda: tema.linhaForte, texto: tema.tinta },
    perigo: { fundo: tema.ruim, borda: tema.ruim, texto: tema.ruimTexto },
    perigoContorno: { fundo: 'transparent', borda: tema.ruim, texto: tema.ruim },
  }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={aoPressionar}
      style={({ pressed }) => [
        estilos.botao,
        pequeno && estilos.pequeno,
        bloco && estilos.bloco,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        pressed && estilos.pressionado,
        style,
      ]}
    >
      <View style={estilos.conteudo}>
        {icone && <Icone nome={icone} tamanho={pequeno ? 17 : 19} cor={cores.texto} />}
        <Texto variante={pequeno ? 'pequenoForte' : 'medio'} cor={cores.texto} style={estilos.texto} numberOfLines={1}>
          {titulo}
        </Texto>
      </View>
    </Pressable>
  );
}

const criarEstilos = () => ({
  botao: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pequeno: { minHeight: 40, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  bloco: { alignSelf: 'stretch' },
  pressionado: { opacity: 0.75 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: 'Figtree_700Bold', flexShrink: 1 },
});
