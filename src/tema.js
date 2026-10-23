// Cores e fontes do app. O tema escuro usa as mesmas "chaves", só muda o valor,
// então as telas nunca precisam saber qual tema está ativo.
import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

const FONTES = {
  titulo: 'BricolageGrotesque_700Bold',
  regular: 'Figtree_400Regular',
  media: 'Figtree_500Medium',
  semi: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
};

const CLARO = {
  nome: 'claro',
  fundo: '#f1f4ec',
  superficie: '#ffffff',
  superficie2: '#e7ece1',
  linha: '#d7ded0',
  linhaForte: '#b7c1ad',
  tinta: '#152015',
  tinta2: '#4a5745',
  tinta3: '#66725f',
  marca: '#1e7f46',
  marcaForte: '#17663a',
  marcaTexto: '#ffffff',
  marcaSuave: '#dcede0',
  marcaTinta: '#145c33',
  oleo: '#e3a11a',
  oleoSuperficie: '#f6c455',
  oleoSuave: '#fbf1da',
  oleoTinta: '#6e4a00',
  oleoNumero: '#3a2700',
  serie: '#1e7f46',
  grade: '#e3e8dd',
  eixo: '#b7c1ad',
  bom: '#0b7a2e',
  bomFundo: '#dcf0e1',
  ruim: '#b3261e',
  ruimTexto: '#ffffff',
  toastFundo: '#152015',
  toastTexto: '#f1f4ec',
  toastDestaque: '#f6c455',
  sombra: '#152015',
  barra: 'dark', // cor dos ícones da barra de status
};

const ESCURO = {
  nome: 'escuro',
  fundo: '#0e120d',
  superficie: '#171c16',
  superficie2: '#222a20',
  linha: '#2b3429',
  linhaForte: '#3d4839',
  tinta: '#ecf1e7',
  tinta2: '#b4bead',
  tinta3: '#929c8b',
  marca: '#3fa566',
  marcaForte: '#58b97b',
  marcaTexto: '#07140b',
  marcaSuave: '#1c3424',
  marcaTinta: '#8fd6a8',
  oleo: '#f0b43a',
  oleoSuperficie: '#f7cd6e',
  oleoSuave: '#2b2413',
  oleoTinta: '#f4cf7e',
  oleoNumero: '#2a1c00',
  serie: '#3fa566',
  grade: '#252c23',
  eixo: '#3d4839',
  bom: '#5cc97c',
  bomFundo: '#173020',
  ruim: '#f07a70',
  ruimTexto: '#2a0b08',
  toastFundo: '#ecf1e7',
  toastTexto: '#152015',
  toastDestaque: '#17663a',
  sombra: '#000000',
  barra: 'light',
};

export function useTema() {
  const esquema = useColorScheme();
  return esquema === 'dark' ? ESCURO : CLARO;
}

export { FONTES, CLARO, ESCURO };

// Guarda os estilos já criados para não recriar a cada renderização.
const cache = new Map();

/**
 * Usa uma função que recebe o tema e devolve os estilos:
 *   const estilos = useEstilos(criarEstilos);
 */
export function useEstilos(criar) {
  const tema = useTema();
  return useMemo(() => {
    let porTema = cache.get(criar);
    if (!porTema) {
      porTema = new Map();
      cache.set(criar, porTema);
    }
    if (!porTema.has(tema.nome)) porTema.set(tema.nome, StyleSheet.create(criar(tema)));
    return porTema.get(tema.nome);
  }, [criar, tema]);
}
