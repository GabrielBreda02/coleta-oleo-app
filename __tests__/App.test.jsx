import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Aplicativo from '../src/Aplicativo.jsx';
import { ToastProvider } from '../src/componentes/Toast.jsx';
import {
  AutenticacaoProvider,
  CHAVE_SESSAO,
  CHAVE_USUARIOS,
  criarUsuario,
} from '../src/context/AutenticacaoContext.jsx';
import { DadosProvider } from '../src/context/DadosContext.jsx';
import { CHAVE_ARMAZENAMENTO } from '../src/context/dadosReducer.js';
import { NavegacaoProvider } from '../src/navegacao/NavegacaoContext.jsx';
import { criarArmazenamento } from '../src/utils/armazenamento.js';
import { gerarEntregasExemplo } from '../src/utils/dadosExemplo.js';
import { somaLitros } from '../src/utils/estatisticas.js';
import { formatarNumero } from '../src/utils/formatar.js';

const HOJE = '2026-09-19';
const MEDIDAS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

const MARIA = { nome: 'Maria Souza', email: 'maria@email.com', senha: 'oleo123' };

/** Deixa uma conta salva no aparelho e, se pedido, já logada. */
async function prepararConta({ logado = true } = {}) {
  const usuario = criarUsuario(MARIA);
  await AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify([usuario]));
  if (logado) await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify({ usuarioId: usuario.id }));
  return usuario;
}

async function montarApp(telaInicial = 'inicio') {
  // Armazenamento novo a cada teste, para a cópia de reserva na memória
  // não levar dados de um teste para o outro
  const armazenamento = criarArmazenamento();
  return render(
    <SafeAreaProvider initialMetrics={MEDIDAS}>
      <AutenticacaoProvider armazenamento={armazenamento}>
        <DadosProvider hoje={HOJE} armazenamento={armazenamento}>
          <ToastProvider>
            <NavegacaoProvider telaInicial={telaInicial}>
              <Aplicativo />
            </NavegacaoProvider>
          </ToastProvider>
        </DadosProvider>
      </AutenticacaoProvider>
    </SafeAreaProvider>,
  );
}

/** Abre o app já com a Maria logada. */
async function abrirApp(telaInicial = 'inicio') {
  await prepararConta();
  return montarApp(telaInicial);
}

/** Lê o que o app salvou no aparelho. */
async function lerSalvo() {
  return JSON.parse(await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(async () => {
  await AsyncStorage.clear();
});

describe('Início', () => {
  it('abre com os dados de exemplo, mostrando total, meta e gráficos', async () => {
    await abrirApp();
    const total = formatarNumero(somaLitros(gerarEntregasExemplo(HOJE)));
    expect(await screen.findByText(total)).toBeTruthy();
    expect(screen.getByText('Meta de setembro')).toBeTruthy();
    expect(screen.getByText('Litros por mês')).toBeTruthy();
    expect(screen.getByText('Pontos que mais arrecadaram')).toBeTruthy();
    expect(screen.getByText(/Você está vendo dados de exemplo/)).toBeTruthy();
  });

  it('troca o gráfico por tabela', async () => {
    await abrirApp();
    await fireEvent.press((await screen.findAllByText('Ver como tabela'))[0]);
    expect(screen.getAllByText('Ver gráfico').length).toBeGreaterThan(0);
    expect(screen.getByText('setembro (até hoje)')).toBeTruthy();
  });

  it('fecha o aviso de dados de exemplo', async () => {
    await abrirApp();
    await fireEvent.press(await screen.findByLabelText('Fechar aviso'));
    expect(screen.queryByText(/Você está vendo dados de exemplo/)).toBeNull();
  });
});

describe('Navegação', () => {
  it('vai do Início para a lista de pontos e abre o detalhe', async () => {
    await abrirApp();
    await fireEvent.press(await screen.findByLabelText('Pontos'));
    expect(await screen.findByText('8 pontos')).toBeTruthy();

    await fireEvent.press(screen.getByText('Padaria da Praça'));
    expect(await screen.findByText('Entregas recentes')).toBeTruthy();
    expect(screen.getByText('Como chegar')).toBeTruthy();

    // o botão voltar leva de volta para a lista
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(await screen.findByText('8 pontos')).toBeTruthy();
  });

  it('filtra os pontos por bairro', async () => {
    await abrirApp('pontos');
    await fireEvent.press((await screen.findAllByText('Centro'))[0]);
    expect(await screen.findByText('1 ponto')).toBeTruthy();
    expect(screen.getByText('Padaria da Praça')).toBeTruthy();
  });
});

describe('Registrar entrega', () => {
  it('avisa quando o formulário está vazio', async () => {
    await abrirApp('registrar');
    await fireEvent.press(await screen.findByRole('button', { name: 'Registrar entrega' }));
    expect(await screen.findByText('Escolha o ponto de coleta.')).toBeTruthy();
    expect(screen.getByText(/Informe a quantidade em litros/)).toBeTruthy();
  });

  it('registra a entrega, salva no aparelho e permite desfazer', async () => {
    await abrirApp('registrar');

    // escolhe o ponto na janela de seleção
    await fireEvent.press(await screen.findByText('Escolha o ponto'));
    await fireEvent.press(await screen.findByText('Mercado Vizinhança'));

    // usa o atalho de 2 L
    await fireEvent.press(screen.getByText(/^2 L$/));
    await fireEvent.changeText(screen.getByLabelText('Quem entregou'), 'Escola Municipal');
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar entrega' }));

    expect(await screen.findByText(/registrados em Mercado Vizinhança/)).toBeTruthy();

    await waitFor(async () => {
      const salvo = await lerSalvo();
      expect(salvo.entregas.some((e) => e.litros === 2 && e.doador === 'Escola Municipal')).toBe(true);
    });

    const antes = (await lerSalvo()).entregas.length;
    await fireEvent.press(screen.getByText('Desfazer'));
    await waitFor(async () => {
      expect((await lerSalvo()).entregas).toHaveLength(antes - 1);
    });
  });

  it('aceita quantidade com vírgula', async () => {
    await abrirApp('registrar');
    await fireEvent.press(await screen.findByText('Escolha o ponto'));
    await fireEvent.press(await screen.findByText('Padaria da Praça'));
    await fireEvent.changeText(screen.getByLabelText('Quantidade de óleo'), '1,5');
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar entrega' }));

    expect(await screen.findByText(/1,5 L registrados em Padaria da Praça/)).toBeTruthy();
  });
});

describe('Cadastro de ponto', () => {
  it('valida e cadastra um ponto novo', async () => {
    await abrirApp('pontos');
    await fireEvent.press(await screen.findByText('Novo ponto'));

    await fireEvent.press(await screen.findByRole('button', { name: 'Cadastrar ponto' }));
    expect(await screen.findByText('Informe o nome do ponto.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Nome do ponto'), 'Horta da Vila');
    await fireEvent.changeText(screen.getByLabelText('Endereço'), 'Rua Nova, 10');
    await fireEvent.changeText(screen.getByLabelText('Bairro'), 'Cinquentenário');
    await fireEvent.changeText(screen.getByLabelText('Horário de funcionamento'), 'Sábados, 9h às 12h');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar ponto' }));

    expect(await screen.findByText('Horta da Vila')).toBeTruthy();
    expect(screen.getByText('Nenhuma entrega neste ponto ainda.')).toBeTruthy();

    await waitFor(async () => {
      const salvo = await lerSalvo();
      expect(salvo.pontos.some((p) => p.nome === 'Horta da Vila')).toBe(true);
    });
  });
});

describe('Histórico', () => {
  it('exclui uma entrega e desfaz', async () => {
    await abrirApp('historico');
    await screen.findByText(/entregas/);

    // espera o app terminar de salvar o estado inicial no aparelho
    let antes = 0;
    await waitFor(async () => {
      const salvo = await lerSalvo();
      expect(salvo).not.toBeNull();
      antes = salvo.entregas.length;
      expect(antes).toBeGreaterThan(0);
    });

    const botoes = await screen.findAllByLabelText(/Excluir entrega/);
    await fireEvent.press(botoes[0]);
    expect(await screen.findByText(/excluída/)).toBeTruthy();
    await waitFor(async () => {
      expect((await lerSalvo()).entregas).toHaveLength(antes - 1);
    });

    await fireEvent.press(screen.getByText('Desfazer'));
    await waitFor(async () => {
      expect((await lerSalvo()).entregas).toHaveLength(antes);
    });
  });
});

describe('Ajustes', () => {
  it('muda a meta mensal e o Início passa a usar o novo valor', async () => {
    await abrirApp();
    await fireEvent.press(await screen.findByLabelText('Ajustes'));
    await fireEvent.changeText(await screen.findByLabelText('Meta mensal'), '80');
    await fireEvent.press(screen.getByText('Salvar ajustes'));
    expect(await screen.findByText('Ajustes salvos')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(await screen.findByText(/de 80 L/)).toBeTruthy();
  });

  it('apaga todos os dados', async () => {
    await abrirApp();
    await fireEvent.press(await screen.findByLabelText('Ajustes'));
    await fireEvent.press(await screen.findByText('Apagar todos os dados'));
    await fireEvent.press(await screen.findByText('Apagar tudo'));
    await fireEvent.press(screen.getByLabelText('Voltar'));

    expect(await screen.findByText('Comece cadastrando um ponto de coleta')).toBeTruthy();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});

describe('Cadastro e autenticação', () => {
  it('sem ninguém logado, abre na tela de entrar', async () => {
    await montarApp();
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByText('Ainda não tem conta?')).toBeTruthy();
    expect(screen.queryByText('Meta de setembro')).toBeNull();
  });

  it('valida o cadastro, cria a conta, guarda só o hash da senha e entra no app', async () => {
    await montarApp();
    await fireEvent.press(await screen.findByText('Criar conta'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Informe seu nome.')).toBeTruthy();
    expect(screen.getByText('Informe seu e-mail.')).toBeTruthy();
    expect(screen.getByText('Crie uma senha.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'João Lima');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), ' Joao@Email.com ');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirme a senha'), 'segredo2');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('As senhas não são iguais.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Confirme a senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Meta de setembro')).toBeTruthy();

    const usuarios = JSON.parse(await AsyncStorage.getItem(CHAVE_USUARIOS));
    expect(usuarios).toHaveLength(1);
    expect(usuarios[0].email).toBe('joao@email.com');
    expect(usuarios[0].hashSenha).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(usuarios)).not.toContain('segredo1');
  });

  it('não deixa criar duas contas com o mesmo e-mail', async () => {
    await prepararConta({ logado: false });
    await montarApp();
    await fireEvent.press(await screen.findByText('Criar conta'));
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Outra Maria');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'MARIA@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), '123456');
    await fireEvent.changeText(screen.getByLabelText('Confirme a senha'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Já existe uma conta com esse e-mail.')).toBeTruthy();
  });

  it('recusa senha errada e entra com a senha certa', async () => {
    await prepararConta({ logado: false });
    await montarApp();
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'maria@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'errada');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Senha'), MARIA.senha);
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Meta de setembro')).toBeTruthy();

    // a sessão fica salva: ao abrir o app de novo, entra direto
    const sessao = JSON.parse(await AsyncStorage.getItem(CHAVE_SESSAO));
    expect(sessao.usuarioId).toBeTruthy();
  });

  it('mostra a conta em Ajustes e sai, voltando para a tela de entrar', async () => {
    await abrirApp();
    await fireEvent.press(await screen.findByLabelText('Ajustes'));
    expect(await screen.findByText(MARIA.nome)).toBeTruthy();
    expect(screen.getByText(MARIA.email)).toBeTruthy();

    await fireEvent.press(screen.getByText('Sair da conta'));
    await fireEvent.press(await screen.findByText('Sair'));
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeTruthy();
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(CHAVE_SESSAO)).toBeNull();
    });
  });

  it('registra a entrega ligada ao usuário logado', async () => {
    const usuario = await prepararConta();
    await montarApp('registrar');
    await fireEvent.press(await screen.findByText('Escolha o ponto'));
    await fireEvent.press(await screen.findByText('Padaria da Praça'));
    await fireEvent.press(screen.getByText(/^1 L$/));
    await fireEvent.press(screen.getByRole('button', { name: 'Registrar entrega' }));

    await waitFor(async () => {
      const salvo = await lerSalvo();
      expect(salvo.entregas.some((e) => e.registradoPor === usuario.id)).toBe(true);
    });
  });
});
