import { View } from 'react-native';
import Icone from '../componentes/Icone.jsx';
import Painel from '../componentes/Painel.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import { useEstilos, useTema } from '../tema.js';

const PASSOS = [
  ['Espere esfriar.', 'Óleo quente pode deformar a garrafa e causar queimaduras.'],
  ['Coe os restos de comida', 'com uma peneira ou um pano. Só o óleo vai para a garrafa.'],
  ['Guarde numa garrafa PET com tampa.', 'Pode ir juntando aos poucos, até encher.'],
  ['Leve até um ponto de coleta', 'com a garrafa bem fechada e registre a entrega no app.'],
];

const PROBLEMAS = [
  'O óleo gruda nos canos, junta com a sujeira e causa entupimentos em casa e na rede de esgoto.',
  'Deixa o tratamento da água mais difícil e mais caro.',
  'Quando chega a rios e ao solo, forma uma camada que prejudica plantas e animais.',
];

const VIRA = ['Sabão', 'Detergente', 'Biodiesel', 'Tintas e vernizes'];

const NAO_MISTURE = [
  'Água, vinagre ou outros líquidos.',
  'Óleo de motor de carro ou moto: ele tem coleta própria, em oficinas e postos.',
  'Gordura sólida com restos de carne.',
];

export default function Dicas() {
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  return (
    <Tela>
      <Painel style={estilos.destaque}>
        <Texto variante="rotulo" cor={tema.marcaTexto} style={estilos.destaqueRotulo}>Óleo usado não vai na pia</Texto>
        <Texto variante="tituloGrande" cor={tema.marcaTexto}>Esfriou, coou, engarrafou, entregou.</Texto>
        <Texto variante="apoio" cor={tema.marcaTexto} style={estilos.destaqueTexto}>
          Guardar o óleo usado dá pouco trabalho e evita entupimentos, poluição da água e do solo.
        </Texto>
      </Painel>

      <Painel titulo="Como guardar o óleo usado">
        <View style={estilos.passos}>
          {PASSOS.map(([forte, resto], i) => (
            <View key={forte} style={estilos.passo}>
              <View style={estilos.numero}>
                <Texto variante="pequenoForte" cor={tema.oleoNumero}>{i + 1}</Texto>
              </View>
              <Texto variante="apoio" style={estilos.passoTexto}>
                <Texto variante="medio">{forte} </Texto>
                {resto}
              </Texto>
            </View>
          ))}
        </View>
      </Painel>

      <Painel titulo="Por que não jogar na pia">
        <View style={estilos.itens}>
          {PROBLEMAS.map((texto) => (
            <View key={texto} style={estilos.item}>
              <Icone nome="fechar" tamanho={18} cor={tema.ruim} />
              <Texto variante="apoio" style={estilos.itemTexto}>{texto}</Texto>
            </View>
          ))}
        </View>
      </Painel>

      <Painel titulo="O que o óleo vira depois">
        <Texto variante="apoio">O óleo coletado é reciclado e pode virar:</Texto>
        <View style={estilos.etiquetas}>
          {VIRA.map((item) => (
            <View key={item} style={estilos.etiqueta}>
              <Texto variante="pequenoForte" cor={tema.oleoTinta}>{item}</Texto>
            </View>
          ))}
        </View>
      </Painel>

      <Painel titulo="Não misture na garrafa">
        <View style={estilos.itens}>
          {NAO_MISTURE.map((texto) => (
            <View key={texto} style={estilos.item}>
              <Icone nome="info" tamanho={18} cor={tema.oleoTinta} />
              <Texto variante="apoio" style={estilos.itemTexto}>{texto}</Texto>
            </View>
          ))}
        </View>
      </Painel>
    </Tela>
  );
}

const criarEstilos = (t) => ({
  destaque: { backgroundColor: t.marca, borderColor: 'transparent', gap: 8 },
  destaqueRotulo: { opacity: 0.85 },
  destaqueTexto: { opacity: 0.9 },
  passos: { gap: 14, marginTop: 4 },
  passo: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  numero: { width: 32, height: 32, borderRadius: 16, backgroundColor: t.oleo, alignItems: 'center', justifyContent: 'center' },
  passoTexto: { flex: 1 },
  itens: { gap: 12, marginTop: 4 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  itemTexto: { flex: 1 },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  etiqueta: { backgroundColor: t.oleoSuave, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
