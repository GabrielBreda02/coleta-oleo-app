import { View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/** Mensagem para quando uma lista está vazia. */
export default function Vazio({ icone = 'info', titulo, texto, acao }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  return (
    <View style={estilos.vazio}>
      <View style={estilos.icone}>
        <Icone nome={icone} tamanho={26} cor={tema.marcaTinta} />
      </View>
      <Texto variante="forte" style={estilos.titulo}>{titulo}</Texto>
      {texto && <Texto variante="apoio" style={estilos.texto}>{texto}</Texto>}
      {acao}
    </View>
  );
}

const criarEstilos = (t) => ({
  vazio: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, gap: 8 },
  icone: { width: 56, height: 56, borderRadius: 18, backgroundColor: t.marcaSuave, alignItems: 'center', justifyContent: 'center' },
  titulo: { marginTop: 6, textAlign: 'center' },
  texto: { textAlign: 'center', maxWidth: 300, marginBottom: 8 },
});
