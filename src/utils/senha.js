// Proteção da senha: o app nunca guarda a senha digitada, só um "hash" dela.
// Hash é uma impressão digital de mão única: dá para conferir se a senha
// bate, mas não dá para descobrir a senha a partir do hash.
//
// Usamos SHA-256 escrito em JavaScript puro, para não depender de nenhuma
// biblioteca nativa (o app continua rodando no Expo Go sem instalar nada).
// Cada usuário tem um "sal" aleatório, para que duas senhas iguais gerem
// hashes diferentes, e o hash é repetido várias vezes para deixar ataques
// de tentativa e erro mais lentos.

const ITERACOES = 1000;

// Constantes do SHA-256: partes fracionárias das raízes dos primeiros primos.
const PRIMOS = [];
for (let n = 2; PRIMOS.length < 64; n++) {
  if (PRIMOS.every((p) => n % p !== 0)) PRIMOS.push(n);
}
const fracao = (x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
const K = PRIMOS.map((p) => fracao(Math.cbrt(p)));
const H_INICIAL = PRIMOS.slice(0, 8).map((p) => fracao(Math.sqrt(p)));

/** Converte texto em bytes UTF-8 (para acentos e emojis funcionarem). */
function paraBytes(texto) {
  const bytes = [];
  for (const caractere of texto) {
    const c = caractere.codePointAt(0);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return bytes;
}

const girar = (x, n) => (x >>> n) | (x << (32 - n));

/** SHA-256 de um texto, devolvido em hexadecimal (64 caracteres). */
export function sha256(texto) {
  const bytes = paraBytes(texto);
  const tamanhoEmBits = bytes.length * 8;

  // Preenchimento: 1 bit "1", zeros e o tamanho original em 64 bits
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const alto = Math.floor(tamanhoEmBits / 0x100000000);
  for (let i = 3; i >= 0; i--) bytes.push((alto >>> (i * 8)) & 255);
  for (let i = 3; i >= 0; i--) bytes.push((tamanhoEmBits >>> (i * 8)) & 255);

  const h = [...H_INICIAL];
  const w = new Array(64);

  for (let bloco = 0; bloco < bytes.length; bloco += 64) {
    for (let i = 0; i < 16; i++) {
      const j = bloco + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = girar(w[i - 15], 7) ^ girar(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = girar(w[i - 2], 17) ^ girar(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = girar(e, 6) ^ girar(e, 11) ^ girar(e, 25);
      const escolha = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + escolha + K[i] + w[i]) >>> 0;
      const S0 = girar(a, 2) ^ girar(a, 13) ^ girar(a, 22);
      const maioria = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maioria) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  return h.map((x) => x.toString(16).padStart(8, '0')).join('');
}

/** Gera um sal aleatório (32 caracteres hexadecimais). */
export function gerarSal() {
  let sal = '';
  for (let i = 0; i < 4; i++) sal += Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');
  return sal;
}

/** Hash da senha com o sal do usuário. */
export function hashSenha(senha, sal) {
  let hash = sha256(`${sal}:${senha}`);
  for (let i = 1; i < ITERACOES; i++) hash = sha256(`${sal}:${hash}`);
  return hash;
}

/** Confere se a senha digitada bate com o hash salvo. */
export function conferirSenha(senha, usuario) {
  return Boolean(usuario) && hashSenha(senha, usuario.sal) === usuario.hashSenha;
}
