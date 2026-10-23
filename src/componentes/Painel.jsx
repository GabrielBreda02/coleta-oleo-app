import { View } from 'react-native';
import { useEstilos } from '../tema.js';
import Texto from './Texto.jsx';

/** Cartão branco (ou escuro) com borda, usado para agrupar conteúdo. */
export default function Painel({ titulo, subtitulo, semPadding = false, style, children }) {
  const estilos = useEstilos(criarEstilos);
  return (
    <View style={[estilos.painel, semPadding && estilos.semPadding, style]}>
      {(titulo || subtitulo) && (
        <View style={estilos.topo}>
          {titulo && <Texto variante="painel" style={estilos.titulo}>{titulo}</Texto>}
          {subtitulo && <Texto variante="pequeno">{subtitulo}</Texto>}
        </View>
      )}
      {children}
    </View>
  );
}

const criarEstilos = (t) => ({
  painel: {
    backgroundColor: t.superficie,
    borderColor: t.linha,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  semPadding: { padding: 0, overflow: 'hidden' },
  topo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  titulo: { flexShrink: 1 },
});
