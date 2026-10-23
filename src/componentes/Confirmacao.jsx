import { Modal, Pressable, View } from 'react-native';
import { useEstilos } from '../tema.js';
import Botao from './Botao.jsx';
import Texto from './Texto.jsx';

/** Caixa de confirmação (ex.: "Excluir este ponto?"). */
export default function Confirmacao({ aberta, titulo, texto, rotuloConfirmar = 'Confirmar', perigo = false, aoConfirmar, aoCancelar }) {
  const estilos = useEstilos(criarEstilos);
  return (
    <Modal visible={aberta} transparent animationType="fade" onRequestClose={aoCancelar}>
      <Pressable style={estilos.fundo} onPress={aoCancelar}>
        <Pressable style={estilos.caixa} onPress={() => {}}>
          <Texto variante="titulo">{titulo}</Texto>
          {texto && <Texto variante="apoio" style={estilos.texto}>{texto}</Texto>}
          <View style={estilos.acoes}>
            <Botao titulo="Cancelar" variante="secundario" aoPressionar={aoCancelar} style={estilos.acao} />
            <Botao
              titulo={rotuloConfirmar}
              variante={perigo ? 'perigo' : 'primario'}
              aoPressionar={aoConfirmar}
              style={estilos.acao}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const criarEstilos = (t) => ({
  fundo: { flex: 1, backgroundColor: 'rgba(8,12,8,0.55)', justifyContent: 'flex-end', padding: 16 },
  caixa: { backgroundColor: t.superficie, borderRadius: 22, padding: 20, gap: 8 },
  texto: { marginBottom: 12 },
  acoes: { flexDirection: 'row', gap: 10 },
  acao: { flex: 1 },
});
