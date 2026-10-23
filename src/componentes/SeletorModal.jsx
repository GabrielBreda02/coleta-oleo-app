import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import { CampoToque } from './Campo.jsx';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/**
 * Lista de opções que abre numa janela (substitui o <select> da web).
 * opcoes: [{ valor, rotulo, detalhe }]
 */
export default function SeletorModal({ titulo, valor, opcoes, placeholder = 'Escolher', erro, aoEscolher }) {
  const [aberto, setAberto] = useState(false);
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  const escolhida = opcoes.find((o) => o.valor === valor);

  return (
    <>
      <CampoToque
        valor={escolhida?.rotulo}
        placeholder={placeholder}
        erro={erro}
        aoPressionar={() => setAberto(true)}
      />

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={estilos.fundo} onPress={() => setAberto(false)}>
          <Pressable style={estilos.folha} onPress={() => {}}>
            <View style={estilos.topo}>
              <Texto variante="titulo">{titulo}</Texto>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={() => setAberto(false)}
                style={estilos.fechar}
              >
                <Icone nome="fechar" tamanho={20} />
              </Pressable>
            </View>
            <ScrollView style={estilos.lista} contentContainerStyle={estilos.listaConteudo}>
              {opcoes.map((opcao) => {
                const ativa = opcao.valor === valor;
                return (
                  <Pressable
                    key={String(opcao.valor)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativa }}
                    onPress={() => {
                      aoEscolher(opcao.valor);
                      setAberto(false);
                    }}
                    style={({ pressed }) => [estilos.opcao, pressed && { backgroundColor: tema.superficie2 }]}
                  >
                    <View style={estilos.opcaoTexto}>
                      <Texto variante="medio">{opcao.rotulo}</Texto>
                      {opcao.detalhe && <Texto variante="pequeno">{opcao.detalhe}</Texto>}
                    </View>
                    {ativa && <Icone nome="check" tamanho={20} cor={tema.marcaTinta} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const criarEstilos = (t) => ({
  fundo: { flex: 1, backgroundColor: 'rgba(8,12,8,0.55)', justifyContent: 'flex-end' },
  folha: {
    backgroundColor: t.superficie,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '75%',
  },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  fechar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  lista: { borderTopWidth: 1, borderTopColor: t.linha },
  listaConteudo: { paddingVertical: 4 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  opcaoTexto: { flex: 1, gap: 2 },
});
