// Gera um id único simples. (crypto.randomUUID não funciona quando o app
// é aberto pelo IP da rede no celular, por isso usamos esta versão.)
export function gerarId(prefixo = 'id') {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
