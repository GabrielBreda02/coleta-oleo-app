import { Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import { formatarLitros } from '../utils/formatar.js';
import Texto from './Texto.jsx';

/**
 * Ranking em barras horizontais.
 * itens: [{ chave, rotulo, valor, descricao }]
 */
export default function GraficoBarras({ itens, aoEscolher, formatarValor = formatarLitros }) {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);
  const maior = Math.max(0, ...itens.map((i) => i.valor));

  return (
    <View>
      {itens.map((item, posicao) => {
        const proporcao = maior > 0 ? item.valor / maior : 0;
        return (
          <Pressable
            key={item.chave}
            accessibilityRole="button"
            accessibilityLabel={`${posicao + 1}º lugar: ${item.rotulo}, ${formatarValor(item.valor)}${item.descricao ? `, ${item.descricao}` : ''}`}
            onPress={() => aoEscolher?.(item)}
            style={({ pressed }) => [estilos.linha, pressed && { backgroundColor: tema.superficie2 }]}
          >
            <Texto variante="pequenoForte" cor={tema.tinta3} style={estilos.posicao}>
              {posicao + 1}
            </Texto>
            <View style={estilos.conteudo}>
              <Texto variante="medio" numberOfLines={2}>{item.rotulo}</Texto>
              <View style={estilos.trilho}>
                <View style={estilos.faixa}>
                  <View style={[estilos.barra, { flexGrow: Math.max(proporcao, 0.02), backgroundColor: tema.serie }]} />
                  <View style={{ flexGrow: Math.max(1 - proporcao, 0.001) }} />
                </View>
                <Texto variante="pequenoForte" style={estilos.valor}>{formatarValor(item.valor)}</Texto>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const criarEstilos = () => ({
  linha: { flexDirection: 'row', gap: 10, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12, marginHorizontal: -6 },
  posicao: { width: 14, paddingTop: 2 },
  conteudo: { flex: 1, gap: 6 },
  trilho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faixa: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  barra: { height: 12, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  valor: { minWidth: 56, textAlign: 'right' },
});
