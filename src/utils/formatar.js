// Formatação de números no padrão brasileiro (vírgula decimal).

const umaCasa = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

// Espaço que não quebra linha, para "12,5 L" nunca ficar separado.
const ESPACO = ' ';

export const formatarNumero = (n) => umaCasa.format(n);

export const formatarInteiro = (n) => inteiro.format(n);

/** 12.5 -> "12,5 L" */
export const formatarLitros = (n) => `${umaCasa.format(n)}${ESPACO}L`;

/** 56.4 -> "56%" */
export const formatarPercentual = (n) => `${inteiro.format(n)}%`;

/** Lê um número digitado pelo usuário, aceitando vírgula: "2,5" -> 2.5 */
export function lerNumero(valor) {
  if (typeof valor === 'number') return valor;
  const texto = String(valor ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (texto === '') return NaN;
  return Number(texto);
}

/** "entrega" / "entregas" conforme a quantidade. */
export function plural(n, singular, pluralTexto = `${singular}s`) {
  return `${formatarInteiro(n)} ${n === 1 ? singular : pluralTexto}`;
}
