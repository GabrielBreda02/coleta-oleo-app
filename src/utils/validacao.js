// Validação dos formulários. Cada função devolve um objeto de erros:
// { campo: 'mensagem' }. Objeto vazio = tudo certo.
import { lerNumero } from './formatar.js';

export const LITROS_MAXIMO = 500;

export function validarPonto(ponto) {
  const erros = {};
  const nome = ponto.nome?.trim() ?? '';
  if (!nome) erros.nome = 'Informe o nome do ponto.';
  else if (nome.length < 3) erros.nome = 'O nome precisa ter pelo menos 3 letras.';
  if (!ponto.endereco?.trim()) erros.endereco = 'Informe o endereço (rua e número).';
  if (!ponto.bairro?.trim()) erros.bairro = 'Informe o bairro.';
  if (!ponto.horario?.trim()) erros.horario = 'Informe quando o ponto recebe óleo.';
  return erros;
}

export function validarEntrega(entrega, { pontos, hoje }) {
  const erros = {};

  if (!entrega.pontoId) erros.pontoId = 'Escolha o ponto de coleta.';
  else if (!pontos.some((p) => p.id === entrega.pontoId)) erros.pontoId = 'Esse ponto não existe mais. Escolha outro.';

  const litros = lerNumero(entrega.litros);
  if (Number.isNaN(litros)) erros.litros = 'Informe a quantidade em litros (ex.: 2 ou 1,5).';
  else if (litros <= 0) erros.litros = 'A quantidade precisa ser maior que zero.';
  else if (litros > LITROS_MAXIMO) erros.litros = `Confira a quantidade: o máximo por entrega é ${LITROS_MAXIMO} L.`;

  if (!entrega.data) erros.data = 'Informe a data da entrega.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(entrega.data)) erros.data = 'Data inválida.';
  else if (entrega.data > hoje) erros.data = 'A data não pode ser no futuro.';

  return erros;
}

export const SENHA_MINIMO = 6;

/** Deixa o e-mail num formato só (sem espaços e em minúsculas) para comparar. */
export const normalizarEmail = (email) => (email ?? '').trim().toLowerCase();

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCadastro(dados, { usuarios = [] } = {}) {
  const erros = {};

  const nome = dados.nome?.trim() ?? '';
  if (!nome) erros.nome = 'Informe seu nome.';
  else if (nome.length < 2) erros.nome = 'O nome precisa ter pelo menos 2 letras.';

  const email = normalizarEmail(dados.email);
  if (!email) erros.email = 'Informe seu e-mail.';
  else if (!EMAIL_VALIDO.test(email)) erros.email = 'E-mail inválido. Ex.: nome@email.com';
  else if (usuarios.some((u) => u.email === email)) erros.email = 'Já existe uma conta com esse e-mail.';

  const senha = dados.senha ?? '';
  if (!senha) erros.senha = 'Crie uma senha.';
  else if (senha.length < SENHA_MINIMO) erros.senha = `A senha precisa ter pelo menos ${SENHA_MINIMO} caracteres.`;

  if (!erros.senha && dados.confirmacao !== senha) erros.confirmacao = 'As senhas não são iguais.';

  return erros;
}

export function validarLogin(dados) {
  const erros = {};
  if (!normalizarEmail(dados.email)) erros.email = 'Informe seu e-mail.';
  if (!dados.senha) erros.senha = 'Informe sua senha.';
  return erros;
}

export const temErros = (erros) => Object.keys(erros).length > 0;
