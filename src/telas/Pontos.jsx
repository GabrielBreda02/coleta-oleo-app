import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Botao from '../componentes/Botao.jsx';
import { Entrada } from '../componentes/Campo.jsx';
import Chip from '../componentes/Chip.jsx';
import Icone from '../componentes/Icone.jsx';
import Tela from '../componentes/Tela.jsx';
import Texto from '../componentes/Texto.jsx';
import Vazio from '../componentes/Vazio.jsx';
import { useDados } from '../context/DadosContext.jsx';
import { useNavegacao } from '../navegacao/NavegacaoContext.jsx';
import { useEstilos, useTema } from '../tema.js';
import { formatarLitros, plural } from '../utils/formatar.js';

// Remove acentos para a busca: "sao" encontra "São"
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Pontos() {
  const { pontos, entregas } = useDados();
  const { navegar } = useNavegacao();
  const [busca, setBusca] = useState('');
  const [bairro, setBairro] = useState('Todos');
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const bairros = [...new Set(pontos.map((p) => p.bairro))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const totais = new Map();
  for (const e of entregas) {
    const t = totais.get(e.pontoId) ?? { litros: 0, entregas: 0 };
    t.litros += e.litros;
    t.entregas += 1;
    totais.set(e.pontoId, t);
  }

  const termo = normalizar(busca.trim());
  const filtrados = pontos
    .filter((p) => bairro === 'Todos' || p.bairro === bairro)
    .filter((p) => !termo || normalizar(`${p.nome} ${p.endereco} ${p.bairro}`).includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (pontos.length === 0) {
    return (
      <Tela>
        <Vazio
          icone="pontos"
          titulo="Nenhum ponto cadastrado"
          texto="Cadastre mercados, escolas e associações que recebem óleo usado."
          acao={<Botao titulo="Cadastrar ponto" icone="mais" aoPressionar={() => navegar('pontoForm')} />}
        />
      </Tela>
    );
  }

  return (
    <Tela>
      <View style={estilos.busca}>
        <View style={estilos.buscaIcone} pointerEvents="none">
          <Icone nome="busca" tamanho={20} cor={tema.tinta3} />
        </View>
        <Entrada
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, rua ou bairro"
          accessibilityLabel="Buscar pontos de coleta"
          style={estilos.buscaEntrada}
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.chips}
        style={estilos.chipsArea}
      >
        {['Todos', ...bairros].map((b) => (
          <Chip key={b} rotulo={b} ativo={bairro === b} aoPressionar={() => setBairro(b)} />
        ))}
      </ScrollView>

      <View style={estilos.listaTopo}>
        <Texto variante="medio" cor={tema.tinta2}>{plural(filtrados.length, 'ponto')}</Texto>
        <Botao titulo="Novo ponto" icone="mais" pequeno aoPressionar={() => navegar('pontoForm')} />
      </View>

      {filtrados.length === 0 ? (
        <Vazio
          icone="busca"
          titulo="Nenhum ponto encontrado"
          texto="Tente outro nome ou bairro."
          acao={
            <Botao
              titulo="Limpar filtros"
              variante="secundario"
              aoPressionar={() => {
                setBusca('');
                setBairro('Todos');
              }}
            />
          }
        />
      ) : (
        <View style={estilos.lista}>
          {filtrados.map((p, i) => {
            const t = totais.get(p.id) ?? { litros: 0, entregas: 0 };
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`${p.nome}, ${p.bairro}, ${formatarLitros(Math.round(t.litros * 10) / 10)}`}
                onPress={() => navegar('pontoDetalhe', { id: p.id })}
                style={({ pressed }) => [
                  estilos.linha,
                  i > 0 && estilos.bordaTopo,
                  pressed && { backgroundColor: tema.superficie2 },
                ]}
              >
                <View style={estilos.linhaTexto}>
                  <Texto variante="forte" numberOfLines={2}>{p.nome}</Texto>
                  <View style={estilos.linhaSub}>
                    <View style={estilos.tag}>
                      <Texto variante="mini" cor={tema.marcaTinta} style={estilos.tagTexto}>{p.bairro}</Texto>
                    </View>
                    <Texto variante="pequeno" style={estilos.horario} numberOfLines={1}>{p.horario}</Texto>
                  </View>
                </View>
                <View style={estilos.linhaTotal}>
                  <Texto variante="forte">{formatarLitros(Math.round(t.litros * 10) / 10)}</Texto>
                  <Texto variante="mini">{plural(t.entregas, 'entrega')}</Texto>
                </View>
                <Icone nome="seta" tamanho={18} cor={tema.tinta3} />
              </Pressable>
            );
          })}
        </View>
      )}
    </Tela>
  );
}

const criarEstilos = (t) => ({
  busca: { justifyContent: 'center' },
  buscaIcone: { position: 'absolute', left: 14, zIndex: 1 },
  buscaEntrada: { paddingLeft: 44 },
  chipsArea: { marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  listaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  lista: { backgroundColor: t.superficie, borderWidth: 1, borderColor: t.linha, borderRadius: 18, overflow: 'hidden' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingLeft: 16, paddingRight: 12 },
  bordaTopo: { borderTopWidth: 1, borderTopColor: t.linha },
  linhaTexto: { flex: 1, gap: 5 },
  linhaSub: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: t.marcaSuave, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  tagTexto: { fontFamily: 'Figtree_700Bold' },
  horario: { flexShrink: 1 },
  linhaTotal: { alignItems: 'flex-end' },
});
