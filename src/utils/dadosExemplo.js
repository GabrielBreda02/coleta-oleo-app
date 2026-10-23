// Dados de exemplo para o app não abrir vazio na apresentação.
// Os pontos são fictícios: troque pelos pontos reais da sua cidade
// (ou apague tudo em Ajustes).
import { anoMesDe, diasNoMes, somarMeses } from './datas.js';

export const RECIPIENTES = ['Garrafa PET fechada', 'Qualquer recipiente fechado', 'Galão ou garrafa PET'];

export const CONFIG_PADRAO = { cidade: 'Caxias do Sul', meta: 50 };

export const PONTOS_EXEMPLO = [
  { id: 'p1', nome: 'Associação de Moradores do Pio X', endereco: 'Rua das Acácias, 210', bairro: 'Pio X', horario: 'Seg a sex, 8h às 18h', recipiente: 'Garrafa PET fechada', observacao: 'Deixar na caixa verde ao lado da portaria.' },
  { id: 'p2', nome: 'Mercado Vizinhança', endereco: 'Rua dos Ipês, 845', bairro: 'São Pelegrino', horario: 'Todos os dias, 7h às 21h', recipiente: 'Garrafa PET fechada', observacao: 'O coletor fica perto dos caixas.' },
  { id: 'p3', nome: 'Escola Comunitária Rio Branco', endereco: 'Rua das Violetas, 57', bairro: 'Rio Branco', horario: 'Seg a sex, 7h30 às 17h30', recipiente: 'Qualquer recipiente fechado', observacao: 'Entregar na secretaria.' },
  { id: 'p4', nome: 'Ecoponto Desvio Rizzo', endereco: 'Rua dos Plátanos, 1320', bairro: 'Desvio Rizzo', horario: 'Ter a sáb, 8h às 17h', recipiente: 'Galão ou garrafa PET', observacao: '' },
  { id: 'p5', nome: 'Paróquia de Lourdes', endereco: 'Rua das Hortênsias, 400', bairro: 'Lourdes', horario: 'Sábados, 14h às 18h', recipiente: 'Garrafa PET fechada', observacao: '' },
  { id: 'p6', nome: 'Padaria da Praça', endereco: 'Rua Central, 1010', bairro: 'Centro', horario: 'Seg a sáb, 6h às 20h', recipiente: 'Garrafa PET fechada', observacao: 'Pedir no balcão.' },
  { id: 'p7', nome: 'Condomínio Parque Exposição', endereco: 'Rua dos Cedros, 76', bairro: 'Exposição', horario: 'Todos os dias, 8h às 22h', recipiente: 'Garrafa PET fechada', observacao: 'Aberto aos vizinhos: avisar na portaria.' },
  { id: 'p8', nome: 'Cozinha Comunitária Petrópolis', endereco: 'Rua das Palmeiras, 233', bairro: 'Petrópolis', horario: 'Seg a sex, 9h às 16h', recipiente: 'Qualquer recipiente fechado', observacao: '' },
];

// Peso de cada ponto (pontos com mais movimento recebem mais entregas)
const PESOS = { p1: 2, p2: 3, p3: 2, p4: 2, p5: 1, p6: 3, p7: 1.5, p8: 1 };
// Entregas por mês, do mais antigo ao atual (mostra a campanha crescendo)
const ENTREGAS_POR_MES = [10, 12, 14, 17, 19, 22];
const LITROS_POSSIVEIS = [0.5, 1, 1, 1.5, 2, 2, 2, 3, 5];
const NOMES = ['Ana', 'Marcos', 'Júlia', 'Pedro', 'Lúcia', 'Roberto', 'Camila', 'Sérgio'];

// Gerador de números "aleatórios" previsível: sempre gera os mesmos dados.
function criarAleatorio(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sortearPonto(aleatorio) {
  const total = Object.values(PESOS).reduce((s, p) => s + p, 0);
  let sorteio = aleatorio() * total;
  for (const [id, peso] of Object.entries(PESOS)) {
    sorteio -= peso;
    if (sorteio < 0) return id;
  }
  return 'p1';
}

/** Gera entregas dos últimos 6 meses (incluindo o mês atual até hoje). */
export function gerarEntregasExemplo(hoje, semente = 42) {
  const aleatorio = criarAleatorio(semente);
  const mesAtual = anoMesDe(hoje);
  const diaHoje = Number(hoje.slice(8, 10));
  const entregas = [];

  ENTREGAS_POR_MES.forEach((quantidadeMesCheio, i) => {
    const anoMes = somarMeses(mesAtual, i - (ENTREGAS_POR_MES.length - 1));
    const ehMesAtual = anoMes === mesAtual;
    const totalDias = diasNoMes(anoMes);
    const ultimoDia = ehMesAtual ? diaHoje : totalDias;
    const quantidade = ehMesAtual
      ? Math.max(1, Math.round((quantidadeMesCheio * diaHoje) / totalDias))
      : quantidadeMesCheio;

    for (let k = 0; k < quantidade; k++) {
      const dia = 1 + Math.floor(aleatorio() * ultimoDia);
      const data = `${anoMes}-${String(dia).padStart(2, '0')}`;
      const temNome = aleatorio() < 0.35;
      entregas.push({
        id: `e-${anoMes}-${k}`,
        pontoId: sortearPonto(aleatorio),
        litros: LITROS_POSSIVEIS[Math.floor(aleatorio() * LITROS_POSSIVEIS.length)],
        data,
        doador: temNome ? NOMES[Math.floor(aleatorio() * NOMES.length)] : '',
        observacao: '',
        criadoEm: i * 1000 + k,
      });
    }
  });

  return entregas;
}

/** Estado completo com dados de exemplo. */
export function criarDadosExemplo(hoje) {
  return {
    pontos: PONTOS_EXEMPLO.map((p) => ({ ...p })),
    entregas: gerarEntregasExemplo(hoje),
    config: { ...CONFIG_PADRAO },
    avisoExemplo: true,
  };
}
