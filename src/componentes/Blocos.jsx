import { View } from 'react-native';
import { useEstilos } from '../tema.js';
import Painel from './Painel.jsx';
import Texto from './Texto.jsx';

/**
 * Grade de números (ex.: "Neste mês 25,5 L").
 * itens: [{ chave, rotulo, valor, extra }]
 */
export default function Blocos({ itens, colunas = 2 }) {
  const estilos = useEstilos(criarEstilos);
  const linhas = [];
  for (let i = 0; i < itens.length; i += colunas) linhas.push(itens.slice(i, i + colunas));

  return (
    <Painel semPadding>
      {linhas.map((linha, indiceLinha) => (
        <View key={indiceLinha} style={[estilos.linha, indiceLinha > 0 && estilos.bordaTopo]}>
          {linha.map((item, indiceColuna) => (
            <View key={item.chave} style={[estilos.bloco, indiceColuna > 0 && estilos.bordaEsquerda]}>
              <Texto variante="pequeno">{item.rotulo}</Texto>
              <Texto variante="numero" style={estilos.valor}>{item.valor}</Texto>
              {typeof item.extra === 'string' ? <Texto variante="mini">{item.extra}</Texto> : item.extra}
            </View>
          ))}
          {linha.length < colunas &&
            Array.from({ length: colunas - linha.length }, (_, i) => (
              <View key={`vazio-${i}`} style={[estilos.bloco, estilos.bordaEsquerda]} />
            ))}
        </View>
      ))}
    </Painel>
  );
}

const criarEstilos = (t) => ({
  linha: { flexDirection: 'row' },
  bordaTopo: { borderTopWidth: 1, borderTopColor: t.linha },
  bordaEsquerda: { borderLeftWidth: 1, borderLeftColor: t.linha },
  bloco: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 2 },
  valor: { marginTop: 2 },
});
