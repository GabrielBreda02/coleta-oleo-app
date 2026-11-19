# Guia de estudo para a apresentação

Este guia serve para responder ao professor quando ele perguntar **"como funciona?"** ou **"onde está isso no código?"**.

Cada assunto tem:

- 🔑 **Palavras-chave**: os termos técnicos para usar na resposta
- 🧠 **Comparação**: um exemplo do dia a dia para lembrar a ideia
- 📂 **Onde está**: o arquivo e a linha para abrir na hora
- 🗣️ **Como explicar**: uma frase pronta para falar

> **Atalho do VS Code:** aperte **Ctrl + P**, digite o nome do arquivo (ex.: `senha.js`) e dê Enter. Para ir direto a uma linha, aperte **Ctrl + G** e digite o número.

---

## Índice

1. [Mapa rápido: pergunta → arquivo](#1-mapa-rápido-pergunta--arquivo)
2. [Como o app começa (a "árvore" de providers)](#2-como-o-app-começa)
3. [Login e cadastro](#3-login-e-cadastro)
4. [Segurança da senha (hash + sal)](#4-segurança-da-senha-hash--sal)
5. [Outras proteções de segurança](#5-outras-proteções-de-segurança)
6. [Validação dos formulários](#6-validação-dos-formulários)
7. [Onde os dados ficam salvos (AsyncStorage)](#7-onde-os-dados-ficam-salvos-asyncstorage)
8. [Context + useReducer (o "cérebro" dos dados)](#8-context--usereducer)
9. [Navegação entre telas](#9-navegação-entre-telas)
10. [Funcionalidades das telas](#10-funcionalidades-das-telas)
11. [Tema claro e escuro](#11-tema-claro-e-escuro)
12. [Testes automáticos](#12-testes-automáticos)
13. [Hooks do React: resumo de 1 linha cada](#13-hooks-do-react-resumo)
14. [Perguntas difíceis que o professor pode fazer](#14-perguntas-difíceis)
15. [Cola final (revisar 5 min antes)](#15-cola-final)

---

## 1. Mapa rápido: pergunta → arquivo

| Se o professor perguntar… | Abra este arquivo | Linha |
|---|---|---|
| "Como foi feito o login?" | [`src/context/AutenticacaoContext.jsx`](../src/context/AutenticacaoContext.jsx#L78) | 78 (`entrar`) |
| "E o cadastro?" | [`src/context/AutenticacaoContext.jsx`](../src/context/AutenticacaoContext.jsx#L66) | 66 (`cadastrar`) |
| "Mostra a tela de login" | [`src/telas/Acesso.jsx`](../src/telas/Acesso.jsx#L46) | 46 (`enviar`) |
| "Como a senha é protegida?" | [`src/utils/senha.js`](../src/utils/senha.js#L102) | 102 (`hashSenha`) |
| "Como o app sabe se tem alguém logado?" | [`src/Aplicativo.jsx`](../src/Aplicativo.jsx#L55) | 55 |
| "Onde ficam as validações?" | [`src/utils/validacao.js`](../src/utils/validacao.js#L43) | 43 (cadastro), 18 (entrega) |
| "Onde os dados são salvos?" | [`src/utils/armazenamento.js`](../src/utils/armazenamento.js) | 6 |
| "Como funciona o gerenciamento de estado?" | [`src/context/dadosReducer.js`](../src/context/dadosReducer.js#L19) | 19 |
| "Como é a navegação?" | [`src/navegacao/NavegacaoContext.jsx`](../src/navegacao/NavegacaoContext.jsx#L29) | 29 |
| "Como sai da conta (logout)?" | [`src/telas/Ajustes.jsx`](../src/telas/Ajustes.jsx#L42) | 42 |
| "Como registra uma entrega?" | [`src/telas/Registrar.jsx`](../src/telas/Registrar.jsx#L59) | 59 |
| "Como funciona a busca?" | [`src/telas/Pontos.jsx`](../src/telas/Pontos.jsx#L15) | 15 e 35 |
| "Como abre o mapa?" | [`src/telas/PontoDetalhe.jsx`](../src/telas/PontoDetalhe.jsx#L22) | 22 e 86 |
| "Onde estão os cálculos do painel?" | [`src/utils/estatisticas.js`](../src/utils/estatisticas.js) | todo |
| "Como funciona o tema escuro?" | [`src/tema.js`](../src/tema.js#L82) | 82 |
| "Tem testes?" | pasta [`__tests__/`](../__tests__) | — |

---

## 2. Como o app começa

📂 **Onde está:** [`index.js`](../index.js) → [`App.js`](../App.js) → [`src/Aplicativo.jsx`](../src/Aplicativo.jsx)

🔑 **Palavras-chave:** *componente raiz*, *Provider*, *Context*, *renderização condicional*, *splash screen*

**Ordem de execução:**

1. `index.js` registra o componente `App` como a raiz do app (`registerRootComponent`).
2. `App.js` carrega as fontes e "embrulha" o app em vários **Providers** ([App.js:32-42](../App.js#L32)):

```jsx
<SafeAreaProvider>          // respeita o notch do iPhone
  <AutenticacaoProvider>    // quem está logado
    <DadosProvider>         // pontos, entregas e ajustes
      <ToastProvider>       // mensagens rápidas no rodapé
        <NavegacaoProvider> // qual tela está aberta
          <Aplicativo />
```

3. `Aplicativo.jsx` decide **qual tela mostrar**:
   - ainda carregando → mostra uma bolinha girando ([linha 45](../src/Aplicativo.jsx#L45))
   - **ninguém logado → mostra a tela de login** ([linha 55](../src/Aplicativo.jsx#L55))
   - logado → mostra o topo, a tela atual e a barra de abas

🧠 **Comparação:** os Providers funcionam como **bonecas russas (matrioscas)**: uma dentro da outra. A boneca de dentro (`Aplicativo`) tem acesso a tudo o que as de fora oferecem. Outra forma de pensar: é como o **Wi-Fi de casa**. O roteador (Provider) espalha o sinal e qualquer cômodo (tela) se conecta sem precisar puxar cabo.

🗣️ **Como explicar:** *"O App.js monta os Providers com Context API. Assim qualquer tela consegue acessar o usuário logado e os dados sem ficar passando props de pai para filho. No Aplicativo.jsx faço renderização condicional: se não tem usuário, mostro a tela de Acesso."*

---

## 3. Login e cadastro

📂 **Onde está:**
- A **lógica** fica em [`src/context/AutenticacaoContext.jsx`](../src/context/AutenticacaoContext.jsx)
- A **tela** fica em [`src/telas/Acesso.jsx`](../src/telas/Acesso.jsx)

🔑 **Palavras-chave:** *autenticação*, *sessão*, *Context API*, *hook personalizado (`useAutenticacao`)*, *async/await*, *estado controlado*

### Como funciona o cadastro ([linha 66](../src/context/AutenticacaoContext.jsx#L66))

```js
async cadastrar(dados) {
  const erros = validarCadastro(dados, { usuarios });  // 1. valida os campos
  if (temErros(erros)) return { ok: false, erros };     // 2. se tiver erro, para aqui
  const novo = criarUsuario(dados);                     // 3. cria o usuário com a senha em hash
  const lista = [...usuarios, novo];
  setUsuarios(lista);
  await armazenamento.salvar(CHAVE_USUARIOS, lista);    // 4. salva no celular
  await abrirSessao(novo.id);                           // 5. já entra logado
  return { ok: true, erros: {} };
}
```

A função `criarUsuario` ([linha 13](../src/context/AutenticacaoContext.jsx#L13)) gera um **sal** e salva **só o hash** da senha, nunca a senha em si.

### Como funciona o login ([linha 78](../src/context/AutenticacaoContext.jsx#L78))

1. Valida se o e-mail e a senha foram preenchidos (`validarLogin`).
2. Procura o usuário pelo e-mail (sempre em minúsculas, com `normalizarEmail`).
3. `conferirSenha` calcula o hash da senha digitada e compara com o hash salvo.
4. Se bater, `abrirSessao` guarda o id do usuário no AsyncStorage.

### Como o app "lembra" de quem está logado (sessão)

- Quando a pessoa entra, o app salva `{ usuarioId, desde }` na chave `coleta-oleo:sessao` ([linha 61](../src/context/AutenticacaoContext.jsx#L61)).
- Quando o app abre, o `useEffect` ([linha 38](../src/context/AutenticacaoContext.jsx#L38)) lê essa chave. Se o usuário existir, já entra direto.
- **Sair** (`sair`, [linha 90](../src/context/AutenticacaoContext.jsx#L90)) apaga a sessão. O botão fica em [`Ajustes.jsx:71`](../src/telas/Ajustes.jsx#L71) e pede confirmação antes.

### A tela de acesso ([`Acesso.jsx`](../src/telas/Acesso.jsx))

- Uma tela só, com **dois modos**: `'entrar'` e `'cadastrar'` (`useState`, [linha 26](../src/telas/Acesso.jsx#L26)).
- O campo de senha usa `secureTextEntry` ([linha 114](../src/telas/Acesso.jsx#L114)) para aparecer como ●●●●.
- A caixinha "Mostrar senha" troca esse valor.
- `enviando` impede o **clique duplo** no botão ([linha 47](../src/telas/Acesso.jsx#L47)).

🧠 **Comparação:** o login funciona como a **portaria de um prédio**.
- **Cadastro** = fazer a carteirinha de morador.
- **Login** = mostrar a carteirinha ao porteiro, que confere com a ficha dele.
- **Sessão** = a pulseira de festa: depois de entrar, você não precisa mostrar o ingresso de novo cada vez que vai ao bar.
- **Sair** = devolver a pulseira.

🗣️ **Como explicar:** *"A autenticação fica num Context próprio, o AutenticacaoContext. O cadastro valida os dados, gera um sal, guarda só o hash SHA-256 da senha e abre a sessão. O login refaz o hash com a senha digitada e compara. A sessão fica salva no AsyncStorage, então a pessoa não precisa logar toda vez."*

---

## 4. Segurança da senha (hash + sal)

📂 **Onde está:** [`src/utils/senha.js`](../src/utils/senha.js)

🔑 **Palavras-chave:** *hash*, *SHA-256*, *função de mão única*, *sal (salt)*, *iterações (key stretching)*, *ataque de força bruta*, *rainbow table*

### Os 3 conceitos

**1. Hash (SHA-256)**, na [linha 38](../src/utils/senha.js#L38)

O hash transforma qualquer texto numa "impressão digital" de 64 caracteres. É **de mão única**: dá para gerar o hash a partir da senha, mas não dá para voltar do hash para a senha.

```
"minhasenha123"  →  SHA-256  →  "a7f3c9…e21b" (64 caracteres)
```

🧠 **Comparação:** é como **moer café**. Do grão você faz o pó, mas do pó não volta ao grão. Outra: é como a **impressão digital**. Ela identifica você, mas ninguém consegue montar uma pessoa a partir dela.

**2. Sal**, em `gerarSal`, na [linha 95](../src/utils/senha.js#L95)

O sal é um texto aleatório diferente para **cada usuário**, misturado com a senha antes do hash. Assim, duas pessoas com a mesma senha "123456" ficam com hashes **diferentes**.

🧠 **Comparação:** é como o **tempero de cada cozinheiro**. Duas pessoas fazem a mesma receita (senha igual), mas cada uma põe um tempero secreto diferente, e o prato final (hash) sai diferente. Isso estraga as "tabelas prontas" que hackers usam (*rainbow tables*), que funcionam como um **gabarito pronto de prova**.

**3. Iterações (repetir 1.000 vezes)**, em `hashSenha`, na [linha 102](../src/utils/senha.js#L102)

```js
const ITERACOES = 1000;
export function hashSenha(senha, sal) {
  let hash = sha256(`${sal}:${senha}`);
  for (let i = 1; i < ITERACOES; i++) hash = sha256(`${sal}:${hash}`);
  return hash;
}
```

🧠 **Comparação:** é como uma **fechadura que demora 1 segundo para girar**. Para o morador, 1 segundo não incomoda. Para um ladrão testando 1 milhão de chaves, vira 11 dias. É o mesmo princípio do bcrypt e do PBKDF2.

### Como confere no login ([linha 109](../src/utils/senha.js#L109))

```js
export function conferirSenha(senha, usuario) {
  return Boolean(usuario) && hashSenha(senha, usuario.sal) === usuario.hashSenha;
}
```

O app **nunca descriptografa nada**: ele refaz a conta com a senha digitada e compara os resultados.

### Por que escrevi o SHA-256 "na mão"?

Porque as bibliotecas de criptografia (como `expo-crypto`) às vezes precisam de código nativo. Com JavaScript puro, o app roda no **Expo Go** sem instalar nada. O teste [`__tests__/senha.test.js`](../__tests__/senha.test.js) compara o resultado com os **valores oficiais** do SHA-256 para provar que está certo.

### O que fica salvo no celular

```json
{ "id": "u-...", "nome": "Gabriel", "email": "gabriel@email.com",
  "sal": "9f2a...", "hashSenha": "c41b...", "criadoEm": 1731000000000 }
```

👉 **Não existe nenhum campo "senha".**

🗣️ **Como explicar:** *"A senha nunca é salva. Guardo só o hash SHA-256 de sal + senha, repetido mil vezes. O sal é aleatório por usuário, então senhas iguais geram hashes diferentes. No login, refaço o cálculo e comparo. É o mesmo princípio que sites como o Gmail usam."*

---

## 5. Outras proteções de segurança

| Proteção | Onde está | Explicação | Comparação |
|---|---|---|---|
| **Mensagem genérica no login** | [`AutenticacaoContext.jsx:82-84`](../src/context/AutenticacaoContext.jsx#L82) | Se o e-mail OU a senha estiverem errados, a mensagem é a mesma: "E-mail ou senha incorretos." Assim ninguém descobre quais e-mails têm conta (*enumeração de usuários*). | O porteiro diz só "não posso deixar entrar". Ele não diz "esse morador não existe" nem "a senha está errada". |
| **Telas nunca veem o hash** | [`AutenticacaoContext.jsx:26`](../src/context/AutenticacaoContext.jsx#L26) (`publico`) | As telas recebem só id, nome e e-mail. O hash e o sal ficam escondidos (*princípio do menor privilégio*). | O caixa do banco vê seu nome, mas não vê sua senha do cartão. |
| **Senha mínima de 6 caracteres** | [`validacao.js:36`](../src/utils/validacao.js#L36) | Evita senhas muito fracas. | Uma fechadura com mais pinos é mais difícil de abrir. |
| **Confirmação de senha** | [`validacao.js:59`](../src/utils/validacao.js#L59) | Evita erro de digitação no cadastro. | Digitar o e-mail duas vezes num formulário do governo. |
| **E-mail único e normalizado** | [`validacao.js:39 e 53`](../src/utils/validacao.js#L39) | `Gabriel@Email.com ` e `gabriel@email.com` contam como o mesmo e-mail. Não deixa criar duas contas iguais. | Um CPF só por pessoa. |
| **Campo de senha oculto** | [`Acesso.jsx:114`](../src/telas/Acesso.jsx#L114) (`secureTextEntry`) | Mostra ●●●● e não deixa o teclado "aprender" a senha. | Cobrir o teclado no caixa eletrônico. |
| **Bloqueio de clique duplo** | [`Acesso.jsx:47`](../src/telas/Acesso.jsx#L47) | Enquanto envia, ignora novos toques. | O botão do elevador que não chama duas vezes. |
| **Confirmação antes de ações perigosas** | [`Ajustes.jsx:115`](../src/telas/Ajustes.jsx#L115) (`Confirmacao`) | Sair, apagar tudo e restaurar exemplos pedem "tem certeza?". | "Deseja realmente excluir?" do Windows. |
| **Desfazer** | [`Registrar.jsx:67`](../src/telas/Registrar.jsx#L67), [`Historico.jsx:63`](../src/telas/Historico.jsx#L63), [`PontoDetalhe.jsx:66`](../src/telas/PontoDetalhe.jsx#L66) | Depois de registrar ou excluir, aparece o botão "Desfazer". | O "Desfazer envio" do Gmail. |
| **Armazenamento à prova de falhas** | [`armazenamento.js:12-23`](../src/utils/armazenamento.js#L12) | Usa `try/catch`: se o AsyncStorage falhar, guarda na memória e o app não trava. | O gerador do hospital: se a luz cai, ele assume. |
| **Validação de dados** | [`validacao.js`](../src/utils/validacao.js) | Não aceita litros negativos, mais de 500 L nem data no futuro. | A balança do mercado que não aceita peso negativo. |

---

## 6. Validação dos formulários

📂 **Onde está:** [`src/utils/validacao.js`](../src/utils/validacao.js)

🔑 **Palavras-chave:** *função pura*, *regex (expressão regular)*, *objeto de erros*, *feedback ao usuário*

**O padrão:** cada função recebe os dados e devolve um **objeto de erros**.

```js
validarCadastro({ nome: '', email: 'abc', senha: '123' })
// → { nome: 'Informe seu nome.', email: 'E-mail inválido...', senha: 'A senha precisa ter pelo menos 6...' }
```

Se o objeto vier vazio `{}`, está tudo certo. Quem confere isso é `temErros` ([linha 71](../src/utils/validacao.js#L71)).

| Função | Linha | O que valida |
|---|---|---|
| `validarPonto` | [7](../src/utils/validacao.js#L7) | nome (mín. 3 letras), endereço, bairro, horário |
| `validarEntrega` | [18](../src/utils/validacao.js#L18) | ponto existe, litros entre 0 e 500, data válida e não futura |
| `validarCadastro` | [43](../src/utils/validacao.js#L43) | nome, e-mail válido e único, senha ≥ 6, confirmação |
| `validarLogin` | [64](../src/utils/validacao.js#L64) | e-mail e senha preenchidos |

**A regex do e-mail** ([linha 41](../src/utils/validacao.js#L41)):

```js
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
//  texto  @  texto  .  texto   → "nome@email.com" ✅   "nome@email" ❌
```

🧠 **Comparação:** a validação é o **fiscal da prova**. Antes de aceitar a folha, ele confere se tem nome, se está tudo preenchido e se não tem nada absurdo. A regex é um **molde de biscoito**: só passa o que tem o formato certo.

🗣️ **Como explicar:** *"As validações ficam separadas em funções puras no validacao.js. Elas devolvem um objeto com a mensagem de erro de cada campo, e a tela mostra a mensagem embaixo do campo. Por serem funções puras, são fáceis de testar."*

---

## 7. Onde os dados ficam salvos (AsyncStorage)

📂 **Onde está:** [`src/utils/armazenamento.js`](../src/utils/armazenamento.js)

🔑 **Palavras-chave:** *AsyncStorage*, *chave-valor*, *JSON.stringify / JSON.parse*, *persistência local*, *offline*, *try/catch*

- O **AsyncStorage** é o "localStorage" do React Native: guarda **texto** no celular no formato **chave → valor**.
- Como só aceita texto, os objetos são convertidos com `JSON.stringify` para salvar e `JSON.parse` para ler.
- O app usa 3 chaves:

| Chave | O que guarda | Definida em |
|---|---|---|
| `coleta-oleo:usuarios` | lista de contas (com hash) | [`AutenticacaoContext.jsx:7`](../src/context/AutenticacaoContext.jsx#L7) |
| `coleta-oleo:sessao` | quem está logado | [`AutenticacaoContext.jsx:8`](../src/context/AutenticacaoContext.jsx#L8) |
| `coleta-oleo:v1` | pontos, entregas e ajustes | [`dadosReducer.js:4`](../src/context/dadosReducer.js#L4) |

- **Salvamento automático:** sempre que os dados mudam, um `useEffect` salva tudo ([`DadosContext.jsx:32-34`](../src/context/DadosContext.jsx#L32)).

🧠 **Comparação:** o AsyncStorage é um **armário de gavetas com etiquetas**. Cada etiqueta é uma chave, e dentro da gaveta tem um papel (texto JSON). O `JSON.stringify` é **dobrar a roupa para caber na gaveta**, e o `JSON.parse` é **desdobrar** para usar.

🗣️ **Como explicar:** *"Os dados ficam no próprio celular com AsyncStorage, então o app funciona sem internet. Criei uma camada própria no armazenamento.js com try/catch. Se o armazenamento falhar, o app continua funcionando com os dados na memória."*

---

## 8. Context + useReducer

📂 **Onde está:** [`src/context/DadosContext.jsx`](../src/context/DadosContext.jsx) e [`src/context/dadosReducer.js`](../src/context/dadosReducer.js)

🔑 **Palavras-chave:** *estado global*, *Context API*, *useReducer*, *dispatch / ação*, *imutabilidade*, *spread operator (`...`)*, *prop drilling*

**O problema que resolve:** várias telas (Início, Pontos, Histórico…) precisam dos mesmos dados. Sem o Context, os dados teriam que passar de componente em componente (*prop drilling*).

**Como funciona:**

1. A tela chama uma ação, por exemplo `acoes.adicionarEntrega(...)` ([`DadosContext.jsx:52`](../src/context/DadosContext.jsx#L52)).
2. A ação faz um **dispatch**: `despachar({ tipo: 'adicionarEntrega', entrega })`.
3. O **reducer** ([`dadosReducer.js:19`](../src/context/dadosReducer.js#L19)) recebe o estado atual e a ação e devolve o **novo estado**:

```js
case 'adicionarEntrega':
  return { ...estado, entregas: [...estado.entregas, acao.entrega] };
```

4. O React redesenha as telas que usam esses dados, e o `useEffect` salva no celular.

**Imutabilidade:** o reducer **nunca altera** o estado antigo. Ele cria uma cópia nova com `...` (spread). É por isso que o React percebe a mudança.

**Detalhe:** excluir um ponto também exclui as entregas dele ([linha 35](../src/context/dadosReducer.js#L35)). É uma **exclusão em cascata**, como no banco de dados.

🧠 **Comparação:**
- **Context** = o **quadro de avisos da escola**: todo mundo olha o mesmo quadro, ninguém precisa passar bilhete de mão em mão.
- **Reducer** = o **caixa do banco**. Você não mexe no cofre diretamente: entrega um pedido (a ação, ex. "depositar 50") e o caixa devolve o saldo atualizado. Todas as mudanças passam por um único lugar.
- **Imutabilidade** = o **extrato bancário**: o banco não apaga a linha antiga, gera um extrato novo.

🗣️ **Como explicar:** *"Para o estado global usei Context com useReducer. Toda alteração passa pelo dadosReducer, que é uma função pura: recebe o estado e a ação e devolve um estado novo, sem modificar o antigo. Isso deixa o código previsível e fácil de testar."*

---

## 9. Navegação entre telas

📂 **Onde está:** [`src/navegacao/NavegacaoContext.jsx`](../src/navegacao/NavegacaoContext.jsx)

🔑 **Palavras-chave:** *pilha (stack)*, *push / pop*, *abas (tabs)*, *BackHandler*, *hook personalizado (`useNavegacao`)*

Fiz a navegação **sem biblioteca** (sem React Navigation), usando uma **pilha** de telas:

| Função | Linha | O que faz |
|---|---|---|
| `navegar(tela)` | [32](../src/navegacao/NavegacaoContext.jsx#L32) | empilha uma tela nova (ex.: abrir o detalhe de um ponto) |
| `voltar()` | [40](../src/navegacao/NavegacaoContext.jsx#L40) | tira a tela do topo |
| `trocarAba(tela)` | [36](../src/navegacao/NavegacaoContext.jsx#L36) | limpa a pilha e começa na aba escolhida |
| Botão voltar do Android | [51](../src/navegacao/NavegacaoContext.jsx#L51) | usa `BackHandler`; na última tela, deixa o Android fechar o app |

A lista de telas fica em [`Aplicativo.jsx:21`](../src/Aplicativo.jsx#L21) (objeto `TELAS`).

🧠 **Comparação:** a pilha é uma **pilha de pratos**. Abrir uma tela é colocar um prato em cima, voltar é tirar o de cima. Trocar de aba é guardar todos os pratos e começar uma pilha nova. Também lembra o **Ctrl+Z**: desfaz na ordem inversa.

🗣️ **Como explicar:** *"Implementei a navegação com uma pilha num Context. navegar empilha, voltar desempilha e trocar de aba reinicia a pilha. Também tratei o botão voltar do Android com BackHandler."*

---

## 10. Funcionalidades das telas

| Tela | Arquivo | Destaques para mostrar |
|---|---|---|
| **Início** | [`telas/Inicio.jsx`](../src/telas/Inicio.jsx) | total arrecadado, garrafa da meta ([`MedidorGarrafa.jsx`](../src/componentes/MedidorGarrafa.jsx), feita com **SVG**), gráfico de 6 meses ([`GraficoColunas.jsx`](../src/componentes/GraficoColunas.jsx)), ranking |
| **Pontos** | [`telas/Pontos.jsx`](../src/telas/Pontos.jsx) | **busca sem acento** ([linha 15](../src/telas/Pontos.jsx#L15)): "sao" encontra "São". Usa `normalize('NFD')`, que separa a letra do acento, e depois remove o acento. Também tem filtro por bairro ([linha 36](../src/telas/Pontos.jsx#L36)) |
| **Detalhe do ponto** | [`telas/PontoDetalhe.jsx`](../src/telas/PontoDetalhe.jsx) | **"Como chegar"** monta um link do Google Maps ([linha 22](../src/telas/PontoDetalhe.jsx#L22)) e abre com `Linking.openURL` ([linha 86](../src/telas/PontoDetalhe.jsx#L86)). O `encodeURIComponent` converte espaços e acentos para caber na URL |
| **Novo/editar ponto** | [`telas/PontoForm.jsx`](../src/telas/PontoForm.jsx) | a mesma tela serve para criar e editar (se recebe `id`, edita) |
| **Registrar** | [`telas/Registrar.jsx`](../src/telas/Registrar.jsx#L59) | valida → salva → mostra Toast com "Desfazer". Guarda **quem registrou** (`registradoPor: usuario.id`, [linha 64](../src/telas/Registrar.jsx#L64)) |
| **Histórico** | [`telas/Historico.jsx`](../src/telas/Historico.jsx) | filtro por mês e por ponto, exclusão com desfazer |
| **Ajustes** | [`telas/Ajustes.jsx`](../src/telas/Ajustes.jsx) | dados da conta, **Sair**, cidade, meta, apagar tudo |
| **Cálculos** | [`utils/estatisticas.js`](../src/utils/estatisticas.js) | `somaLitros` usa `reduce`; `comparativoMesmoPeriodo` ([linha 57](../src/utils/estatisticas.js#L57)) compara 1 a 19/09 com 1 a 19/08, para ser justo com o mês pela metade |
| **Aviso com animação** | [`componentes/Toast.jsx`](../src/componentes/Toast.jsx) | `Animated.timing` faz o aviso aparecer e sumir suavemente |

🧠 **Comparações rápidas:**
- **Busca sem acento**: como o **Google**, que acha "pao" quando você queria "pão".
- **Linking.openURL**: como um **link no WhatsApp** que abre outro app.
- **Toast com Desfazer**: o **"Desfazer envio" do Gmail**.
- **`reduce`**: a **calculadora da maquininha do mercado**, que vai somando item por item até dar o total.
- **Comparação do mesmo período**: comparar seu **salário até o dia 15** com o salário **até o dia 15 do mês passado**, e não com o mês inteiro.

---

## 11. Tema claro e escuro

📂 **Onde está:** [`src/tema.js`](../src/tema.js)

🔑 **Palavras-chave:** *useColorScheme*, *design tokens*, *StyleSheet*, *useMemo (cache)*

- `useColorScheme()` ([linha 83](../src/tema.js#L83)) pergunta ao celular se ele está no modo escuro.
- Os temas `CLARO` e `ESCURO` têm **as mesmas chaves** com valores diferentes, por exemplo `fundo: '#f1f4ec'` e `fundo: '#0e120d'`. Assim as telas usam `tema.fundo` e não precisam saber qual tema está ativo.
- `useEstilos` guarda em **cache** os estilos já criados, para não recriar a cada renderização ([linha 96](../src/tema.js#L96)).

🧠 **Comparação:** é como o **controle remoto universal**: o botão "volume" (a chave `fundo`) é sempre o mesmo, só muda a TV que ele controla (claro ou escuro).

---

## 12. Testes automáticos

📂 **Onde está:** pasta [`__tests__/`](../__tests__) · rodar com `npm test`

🔑 **Palavras-chave:** *Jest*, *Testing Library*, *teste unitário*, *teste de integração*, *função pura*

| Arquivo | O que testa |
|---|---|
| [`senha.test.js`](../__tests__/senha.test.js) | SHA-256 comparado com os valores oficiais, sal e conferência de senha |
| [`validacao.test.js`](../__tests__/validacao.test.js) | regras dos formulários |
| [`estatisticas.test.js`](../__tests__/estatisticas.test.js) | somas, médias, ranking, meta |
| [`utils.test.js`](../__tests__/utils.test.js) | datas, formatação, armazenamento (inclusive quando falha) |
| [`App.test.jsx`](../__tests__/App.test.jsx) | fluxos completos: criar conta, entrar, senha errada, e-mail repetido, sair, registrar, desfazer… |

🧠 **Comparação:** os testes são o **checklist do piloto antes de decolar**. Toda vez que mudo algo, rodo o checklist e vejo se nada quebrou.

🗣️ **Como explicar:** *"Tenho testes unitários para as funções puras e testes de integração que simulam o usuário tocando na tela: criar conta, errar a senha, registrar entrega. Isso garante que uma mudança não quebra outra parte."*

---

## 13. Hooks do React: resumo

| Hook | Para que serve | Exemplo no projeto | Comparação |
|---|---|---|---|
| `useState` | guardar um valor que muda na tela | campos do formulário em [`Acesso.jsx:27`](../src/telas/Acesso.jsx#L27) | um **quadro branco**: você apaga e escreve de novo |
| `useEffect` | fazer algo "depois" de desenhar (carregar, salvar) | carregar contas em [`AutenticacaoContext.jsx:38`](../src/context/AutenticacaoContext.jsx#L38) | um **alarme**: quando algo muda, ele dispara |
| `useReducer` | estado complexo com várias ações | [`DadosContext.jsx:16`](../src/context/DadosContext.jsx#L16) | o **caixa do banco** |
| `useContext` | ler dados globais | `useAutenticacao()`, `useDados()` | o **quadro de avisos** |
| `useMemo` | lembrar um cálculo para não refazer à toa | [`AutenticacaoContext.jsx:56`](../src/context/AutenticacaoContext.jsx#L56) | a **cola anotada**: não precisa recalcular |
| `useCallback` | lembrar uma função | `navegar` em [`NavegacaoContext.jsx:32`](../src/navegacao/NavegacaoContext.jsx#L32) | igual ao useMemo, só que para funções |
| `useRef` | guardar algo sem redesenhar a tela | animação em [`Toast.jsx:13`](../src/componentes/Toast.jsx#L13) | um **bolso**: guarda, mas ninguém vê |
| **Hook próprio** | juntar lógica reutilizável | `useNavegacao`, `useAutenticacao`, `useEstilos` | uma **receita de família** que todo mundo usa |

---

## 14. Perguntas difíceis

**"Isso é seguro de verdade? Dá para hackear?"**
> "Para um app local, sim: a senha nunca fica salva, só o hash com sal. Mas como não tem servidor, a conta vale só para aquele celular. Numa versão com backend, eu usaria uma API ou o Firebase Auth, com bcrypt e HTTPS, e os dados ficariam sincronizados."

**"Por que não usou Firebase/banco de dados?"**
> "O requisito era rodar no Expo Go e funcionar sem internet (RNF01 e RNF02 na [modelagem](modelagem.md)). Por isso usei o AsyncStorage. Mas o código está separado em camadas: para trocar por uma API, mudaria só o `armazenamento.js` e o `AutenticacaoContext`."

**"O sal usa `Math.random`. Isso é seguro?"**
> "Para o sal serve, porque o papel dele é ser **único** por usuário, não secreto. Numa versão em produção, eu usaria um gerador criptográfico, como o `expo-crypto`." *(Resposta honesta: o professor gosta quando você conhece os limites.)*

**"Por que não usou React Navigation?"**
> "Quis entender como a navegação funciona por dentro e manter o app leve. Fiz uma pilha num Context, com suporte ao botão voltar do Android."

**"O que é um Provider?"**
> "É o componente que disponibiliza um Context para todos os componentes de dentro dele. É como o roteador de Wi-Fi da casa."

**"Qual a diferença entre props e state?"**
> "**Props** são os dados que o componente recebe do pai, como os **parâmetros de uma função**. **State** é a memória interna do componente, que ele mesmo altera. Exemplo: o `Botao` recebe o `titulo` por props; a tela de Acesso guarda os campos digitados em state."

**"Onde fica o MVC / a arquitetura?"**
> "Separei em camadas: **telas** (o que aparece), **componentes** (peças reutilizáveis), **context** (estado e regras) e **utils** (funções puras: validação, cálculos e senha). O diagrama está no [`modelagem.md`](modelagem.md), seção 7."

---

## 15. Cola final

```
LOGIN ............ src/context/AutenticacaoContext.jsx  (entrar L78 · cadastrar L66 · sair L90)
TELA DE LOGIN .... src/telas/Acesso.jsx                  (enviar L46 · secureTextEntry L114)
SENHA (HASH) ..... src/utils/senha.js                     (sha256 L38 · gerarSal L95 · hashSenha L102 · conferir L109)
"ESTÁ LOGADO?" ... src/Aplicativo.jsx L55                 (if (!usuario) return <Acesso />)
VALIDAÇÕES ....... src/utils/validacao.js                 (entrega L18 · cadastro L43 · login L64)
SALVAR NO CEL .... src/utils/armazenamento.js             (AsyncStorage + try/catch)
ESTADO GLOBAL .... src/context/dadosReducer.js L19        (useReducer + Context)
NAVEGAÇÃO ........ src/navegacao/NavegacaoContext.jsx     (pilha · BackHandler L51)
BUSCA SEM ACENTO . src/telas/Pontos.jsx L15
COMO CHEGAR ...... src/telas/PontoDetalhe.jsx L22 e L86
TEMA ESCURO ...... src/tema.js L82
TESTES ........... __tests__/  →  npm test
```

**5 frases para decorar:**

1. *"A senha nunca é salva: guardo só um hash SHA-256 com sal, repetido 1.000 vezes."*
2. *"O login usa Context API; se não há usuário, o app mostra a tela de Acesso."*
3. *"Os dados ficam no celular com AsyncStorage, então o app funciona offline."*
4. *"Toda alteração nos dados passa por um reducer, que é uma função pura e imutável."*
5. *"As regras ficam em funções puras no utils, cobertas por testes com Jest."*

Boa apresentação! 🍀
