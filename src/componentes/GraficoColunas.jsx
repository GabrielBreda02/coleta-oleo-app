import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import { escalaAmigavel } from '../utils/escala.js';
import { formatarLitros, formatarNumero } from '../utils/formatar.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

/**
 * Gráfico de colunas (litros por mês), feito só com Views.
 * Toque numa coluna para ver o detalhe na linha de cima.
 * dados: [{ chave, rotulo, rotuloLongo, valor, quantidade, detalhe }]
 */
export default function GraficoColunas({ dados, altura = 150, formatarValor = formatarLitros }) {
  const ultimo = dados.length - 1;
  const [selecionado, setSelecionado] = useState(ultimo);
  const [interagiu, setInteragiu] = useState(false);
  const [verTabela, setVerTabela] = useState(false);
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const maior = Math.max(0, ...dados.map((d) => d.valor));
  const { max, ticks } = escalaAmigavel(maior);
  const atual = dados[selecionado] ?? dados[ultimo];

  return (
    <View>
      {verTabela ? (
        <View style={estilos.tabela}>
          <View style={[estilos.linhaTabela, estilos.cabecalho]}>
            <Texto variante="mini" style={estilos.colunaNome}>Mês</Texto>
            <Texto variante="mini" style={estilos.colunaNumero}>Litros</Texto>
            <Texto variante="mini" style={estilos.colunaNumero}>Entregas</Texto>
          </View>
          {dados.map((d) => (
            <View key={d.chave} style={estilos.linhaTabela}>
              <Texto variante="pequeno" cor={tema.tinta} style={estilos.colunaNome}>{d.rotuloLongo}</Texto>
              <Texto variante="pequeno" cor={tema.tinta} style={estilos.colunaNumero}>{formatarValor(d.valor)}</Texto>
              <Texto variante="pequeno" cor={tema.tinta} style={estilos.colunaNumero}>{d.quantidade ?? '—'}</Texto>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={estilos.leitura} accessibilityLiveRegion="polite">
            <Texto variante="numero">{formatarValor(atual.valor)}</Texto>
            <Texto variante="apoio" style={estilos.leituraTexto}>
              {atual.rotuloLongo}
              {atual.detalhe ? ` · ${atual.detalhe}` : ''}
            </Texto>
          </View>

          <View style={estilos.area}>
            <View style={[estilos.eixo, { height: altura }]}>
              {ticks.map((t) => (
                <Texto key={t} variante="mini" style={[estilos.tick, { bottom: `${(t / max) * 100}%` }]}>
                  {formatarNumero(t)}
                </Texto>
              ))}
            </View>

            <View style={estilos.plot}>
              <View style={{ height: altura }}>
                {ticks.map((t) => (
                  <View
                    key={t}
                    style={[
                      estilos.grade,
                      { bottom: `${(t / max) * 100}%`, backgroundColor: t === 0 ? tema.eixo : tema.grade },
                    ]}
                  />
                ))}
                <View style={estilos.colunas}>
                  {dados.map((d, i) => {
                    const proporcao = max > 0 ? (d.valor / max) * 100 : 0;
                    const ativa = i === selecionado;
                    return (
                      <Pressable
                        key={d.chave}
                        accessibilityRole="button"
                        accessibilityState={{ selected: ativa }}
                        accessibilityLabel={`${d.rotuloLongo}: ${formatarValor(d.valor)}${d.detalhe ? `, ${d.detalhe}` : ''}`}
                        onPress={() => {
                          setSelecionado(i);
                          setInteragiu(true);
                        }}
                        style={estilos.coluna}
                      >
                        <View
                          style={[
                            estilos.barra,
                            {
                              height: `${proporcao}%`,
                              backgroundColor: tema.serie,
                              opacity: interagiu && !ativa ? 0.4 : 1,
                            },
                          ]}
                        />
                        {ativa && d.valor > 0 && (
                          <Texto variante="pequenoForte" style={[estilos.valor, { bottom: `${proporcao}%` }]}>
                            {formatarNumero(d.valor)}
                          </Texto>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={estilos.rotulos}>
                {dados.map((d, i) => (
                  <Texto
                    key={d.chave}
                    variante={i === selecionado ? 'pequenoForte' : 'mini'}
                    cor={i === selecionado ? tema.tinta : tema.tinta3}
                    style={estilos.rotulo}
                  >
                    {d.rotulo}
                  </Texto>
                ))}
              </View>
            </View>
          </View>
        </>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => setVerTabela((v) => !v)}
        style={({ pressed }) => [estilos.link, pressed && { opacity: 0.7 }]}
      >
        <Icone nome={verTabela ? 'grafico' : 'tabela'} tamanho={16} cor={tema.marcaTinta} />
        <Texto variante="pequenoForte" cor={tema.marcaTinta}>
          {verTabela ? 'Ver gráfico' : 'Ver como tabela'}
        </Texto>
      </Pressable>
    </View>
  );
}

const criarEstilos = (t) => ({
  leitura: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  leituraTexto: { flexShrink: 1 },
  area: { flexDirection: 'row', gap: 8, paddingTop: 20 },
  eixo: { width: 28 },
  tick: { position: 'absolute', right: 0, marginBottom: -7, textAlign: 'right', width: 28 },
  plot: { flex: 1 },
  grade: { position: 'absolute', left: 0, right: 0, height: 1 },
  colunas: { flexDirection: 'row', height: '100%' },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  barra: { width: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 0 },
  valor: { position: 'absolute', marginBottom: 4 },
  rotulos: { flexDirection: 'row', paddingTop: 6 },
  rotulo: { flex: 1, textAlign: 'center' },
  tabela: { borderTopWidth: 1, borderTopColor: t.linha, marginTop: 4 },
  linhaTabela: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.linha, gap: 8 },
  cabecalho: { borderBottomColor: t.linhaForte },
  colunaNome: { flex: 1 },
  colunaNumero: { width: 72, textAlign: 'right' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginTop: 4 },
});
