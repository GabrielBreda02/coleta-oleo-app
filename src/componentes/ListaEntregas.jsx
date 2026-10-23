import { Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import { formatarData, rotuloDia } from '../utils/datas.js';
import { formatarLitros } from '../utils/formatar.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/** Uma linha de entrega. */
export function LinhaEntrega({ entrega, nomePonto, hoje, mostrarPonto = true, mostrarData = true, aoExcluir, primeira = false }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const titulo = mostrarPonto ? nomePonto : rotuloDia(entrega.data, hoje);
  const detalhes = [
    mostrarPonto && mostrarData ? rotuloDia(entrega.data, hoje) : null,
    entrega.doador || null,
    entrega.observacao || null,
  ].filter(Boolean);

  return (
    <View style={[estilos.linha, !primeira && estilos.comBorda]}>
      <View style={estilos.icone}>
        <Icone nome="gota" tamanho={18} cor={tema.oleoTinta} />
      </View>
      <View style={estilos.texto}>
        <Texto variante="medio" numberOfLines={2}>{titulo}</Texto>
        {detalhes.length > 0 && (
          <Texto variante="pequeno" numberOfLines={2}>{detalhes.join(' · ')}</Texto>
        )}
      </View>
      <Texto variante="forte">{formatarLitros(entrega.litros)}</Texto>
      {aoExcluir && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir entrega de ${formatarLitros(entrega.litros)} em ${formatarData(entrega.data)}`}
          onPress={() => aoExcluir(entrega)}
          style={({ pressed }) => [estilos.excluir, pressed && { opacity: 0.6 }]}
        >
          <Icone nome="lixo" tamanho={18} cor={tema.tinta3} />
        </Pressable>
      )}
    </View>
  );
}

export default function ListaEntregas({ entregas, pontos, hoje, mostrarPonto = true, mostrarData = true, aoExcluir }) {
  const estilos = useEstilos(criarEstilos);
  const nomes = new Map(pontos.map((p) => [p.id, p.nome]));

  return (
    <View style={estilos.lista}>
      {entregas.map((e, i) => (
        <LinhaEntrega
          key={e.id}
          entrega={e}
          nomePonto={nomes.get(e.pontoId) ?? 'Ponto removido'}
          hoje={hoje}
          mostrarPonto={mostrarPonto}
          mostrarData={mostrarData}
          aoExcluir={aoExcluir}
          primeira={i === 0}
        />
      ))}
    </View>
  );
}

const criarEstilos = (t) => ({
  lista: { backgroundColor: t.superficie, borderWidth: 1, borderColor: t.linha, borderRadius: 18, overflow: 'hidden' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 14, paddingRight: 12 },
  comBorda: { borderTopWidth: 1, borderTopColor: t.linha },
  icone: { width: 36, height: 36, borderRadius: 12, backgroundColor: t.oleoSuave, alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1, gap: 2 },
  excluir: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginRight: -6 },
});
