import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import { anoMesDe, deISO, diasNoMes, formatarData, nomeMes, paraISO, somarMeses } from '../utils/datas.js';
import { CampoToque } from './Campo.jsx';
import Chip from './Chip.jsx';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Calendário simples, feito com Views (não depende de biblioteca nativa). */
export default function SeletorData({ valor, hoje, erro, aoEscolher }) {
  const [aberto, setAberto] = useState(false);
  const [mesVisivel, setMesVisivel] = useState(() => anoMesDe(valor || hoje));
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const ontem = paraISO(new Date(deISO(hoje).getTime() - 24 * 60 * 60 * 1000));
  const rotulo = valor === hoje ? `Hoje, ${formatarData(valor)}` : valor === ontem ? `Ontem, ${formatarData(valor)}` : formatarData(valor);

  const [ano, mes] = mesVisivel.split('-').map(Number);
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const total = diasNoMes(mesVisivel);
  const celulas = [...Array(primeiroDiaSemana).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const podeAvancar = somarMeses(mesVisivel, 1) <= anoMesDe(hoje);

  function escolher(dia) {
    const iso = `${mesVisivel}-${String(dia).padStart(2, '0')}`;
    if (iso > hoje) return;
    aoEscolher(iso);
    setAberto(false);
  }

  return (
    <>
      <CampoToque valor={rotulo} placeholder="Escolher data" icone="calendario" erro={erro} aoPressionar={() => setAberto(true)} />

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={estilos.fundo} onPress={() => setAberto(false)}>
          <Pressable style={estilos.folha} onPress={() => {}}>
            <View style={estilos.topo}>
              <Texto variante="titulo">Data da entrega</Texto>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setAberto(false)} style={estilos.iconeBotao}>
                <Icone nome="fechar" tamanho={20} />
              </Pressable>
            </View>

            <View style={estilos.atalhos}>
              <Chip rotulo="Hoje" ativo={valor === hoje} aoPressionar={() => { aoEscolher(hoje); setAberto(false); }} />
              <Chip rotulo="Ontem" ativo={valor === ontem} aoPressionar={() => { aoEscolher(ontem); setAberto(false); }} />
            </View>

            <View style={estilos.mes}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mês anterior"
                onPress={() => setMesVisivel(somarMeses(mesVisivel, -1))}
                style={estilos.iconeBotao}
              >
                <Icone nome="voltar" tamanho={20} />
              </Pressable>
              <Texto variante="medio">{nomeMes(mesVisivel, { comAno: true })}</Texto>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Próximo mês"
                disabled={!podeAvancar}
                onPress={() => podeAvancar && setMesVisivel(somarMeses(mesVisivel, 1))}
                style={[estilos.iconeBotao, !podeAvancar && { opacity: 0.3 }]}
              >
                <Icone nome="seta" tamanho={20} />
              </Pressable>
            </View>

            <View style={estilos.semana}>
              {DIAS_SEMANA.map((d, i) => (
                <Texto key={i} variante="mini" style={estilos.celulaTexto}>{d}</Texto>
              ))}
            </View>

            <View style={estilos.grade}>
              {celulas.map((dia, i) => {
                if (dia === null) return <View key={`vazio-${i}`} style={estilos.celula} />;
                const iso = `${mesVisivel}-${String(dia).padStart(2, '0')}`;
                const selecionado = iso === valor;
                const futuro = iso > hoje;
                return (
                  <Pressable
                    key={iso}
                    accessibilityRole="button"
                    accessibilityLabel={formatarData(iso)}
                    accessibilityState={{ selected: selecionado, disabled: futuro }}
                    disabled={futuro}
                    onPress={() => escolher(dia)}
                    style={estilos.celula}
                  >
                    <View style={[estilos.dia, selecionado && { backgroundColor: tema.marca }]}>
                      <Texto
                        variante="medio"
                        cor={selecionado ? tema.marcaTexto : futuro ? tema.tinta3 : tema.tinta}
                      >
                        {dia}
                      </Texto>
                    </View>
                  </Pressable>
                );
              })}
            </View>
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
    paddingHorizontal: 16,
    gap: 14,
  },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconeBotao: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  atalhos: { flexDirection: 'row', gap: 8 },
  mes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  semana: { flexDirection: 'row' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  celulaTexto: { width: `${100 / 7}%`, textAlign: 'center' },
  dia: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
