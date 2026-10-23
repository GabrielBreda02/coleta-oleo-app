import { Text } from 'react-native';
import { FONTES, useTema } from '../tema.js';

// Centraliza a tipografia: em vez de repetir fontFamily e tamanho em cada tela,
// usamos <Texto variante="apoio">.
const VARIANTES = {
  hero: { fonte: FONTES.titulo, tamanho: 60, altura: 60, espaco: -1.6 },
  titulo: { fonte: FONTES.titulo, tamanho: 21, altura: 25, espaco: -0.3 },
  tituloGrande: { fonte: FONTES.titulo, tamanho: 28, altura: 31, espaco: -0.6 },
  painel: { fonte: FONTES.titulo, tamanho: 18, altura: 23, espaco: -0.2 },
  numero: { fonte: FONTES.titulo, tamanho: 24, altura: 28, espaco: -0.3 },
  numeroGrande: { fonte: FONTES.titulo, tamanho: 32, altura: 36, espaco: -0.5 },
  corpo: { fonte: FONTES.regular, tamanho: 16, altura: 23 },
  medio: { fonte: FONTES.semi, tamanho: 15, altura: 20 },
  forte: { fonte: FONTES.bold, tamanho: 16, altura: 22 },
  apoio: { fonte: FONTES.regular, tamanho: 15, altura: 21, cor: 'tinta2' },
  pequeno: { fonte: FONTES.regular, tamanho: 13, altura: 18, cor: 'tinta2' },
  pequenoForte: { fonte: FONTES.bold, tamanho: 13, altura: 18 },
  mini: { fonte: FONTES.regular, tamanho: 11.5, altura: 15, cor: 'tinta3' },
  rotulo: { fonte: FONTES.bold, tamanho: 12, altura: 16, espaco: 0.9, cor: 'tinta2', maiusculas: true },
};

export default function Texto({ variante = 'corpo', cor, style, children, ...resto }) {
  const tema = useTema();
  const v = VARIANTES[variante] ?? VARIANTES.corpo;
  const corFinal = cor ?? tema[v.cor ?? 'tinta'];

  return (
    <Text
      style={[
        {
          fontFamily: v.fonte,
          fontSize: v.tamanho,
          lineHeight: v.altura,
          letterSpacing: v.espaco ?? 0,
          color: corFinal,
          textTransform: v.maiusculas ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...resto}
    >
      {children}
    </Text>
  );
}
