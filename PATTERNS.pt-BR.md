# Padrões de verificação

22 padrões, todos no mesmo formato: **sintoma, caso real, regra, como checar**.

Todos os casos vêm de logs anonimizados de trabalho real com agentes de IA. Nome de marca, de
cliente e caminho local saíram; os números não. Cada caso carrega a procedência:

- **(medido)** - número que um comando produziu e que ficou registrado.
- **(dito)** - alguém afirmou; ninguém rodou o comando de novo.
- **(inferido)** - reconstruído depois, sem medição.

Caso sem número medido aparece sem número. Nada aqui foi arredondado para ficar mais bonito.

---

## Índice

**Ler a ausência**

1. [Vazio não é ausência](#1-vazio-não-é-ausência)
2. [O zero que confirma você é o mais caro](#2-o-zero-que-confirma-você-é-o-mais-caro)
3. [Controle positivo prova que o instrumento acha, não que ele acha a classe que falha](#3-controle-positivo-prova-que-o-instrumento-acha-não-que-ele-acha-a-classe-que-falha)

**O que o verde significa**

4. [Exit 0 prova término, não trabalho](#4-exit-0-prova-término-não-trabalho)
5. [Smoke prova resposta; dry-run prova o caminho seco](#5-smoke-prova-resposta-dry-run-prova-o-caminho-seco)
6. [Um sinal só prova execução se não pudesse existir sem ela](#6-um-sinal-só-prova-execução-se-não-pudesse-existir-sem-ela)

**Detectores**

7. [Detector que nunca acusou nada não é evidência de saúde](#7-detector-que-nunca-acusou-nada-não-é-evidência-de-saúde)
8. [O teste negativo tem que falhar pelo motivo que você afirma](#8-o-teste-negativo-tem-que-falhar-pelo-motivo-que-você-afirma)
9. [Meça efeito, não declaração](#9-meça-efeito-não-declaração)
10. [A régua não pode morar dentro do sistema medido](#10-a-régua-não-pode-morar-dentro-do-sistema-medido)
11. [Contagem de detector não é fila de trabalho](#11-contagem-de-detector-não-é-fila-de-trabalho)
12. [Fixture sintética não carrega a patologia do material real](#12-fixture-sintética-não-carrega-a-patologia-do-material-real)
13. [O processo carrega a cópia instalada, não a sua edição](#13-o-processo-carrega-a-cópia-instalada-não-a-sua-edição)

**Gates**

14. [Suíte verde não prova que o gate roda](#14-suíte-verde-não-prova-que-o-gate-roda)
15. [Gate é afirmação positiva, nunca ausência do proibido](#15-gate-é-afirmação-positiva-nunca-ausência-do-proibido)
16. [Suíte abortada é gate cego, e o vermelho também mente](#16-suíte-abortada-é-gate-cego-e-o-vermelho-também-mente)

**Números e afirmações**

17. [Número sem o instrumento é depoimento](#17-número-sem-o-instrumento-é-depoimento)
18. [Declarado não é feito](#18-declarado-não-é-feito)
19. [Fato de segunda mão, e fonte que venceu](#19-fato-de-segunda-mão-e-fonte-que-venceu)

**Antes de culpar o alvo**

20. [Suspeite do seu próprio instrumento primeiro](#20-suspeite-do-seu-próprio-instrumento-primeiro)
21. [Rode o comando que responde *aquela* pergunta](#21-rode-o-comando-que-responde-aquela-pergunta)

**Antes de medir qualquer coisa**

22. [Pergunte o que é sucesso antes de otimizar](#22-pergunte-o-que-é-sucesso-antes-de-otimizar)

---

## 1. Vazio não é ausência

**Sintoma.** O comando não devolve nada, sai limpo, e o agente escreve "não existe X".

**Casos.**

- Um comando de inventário de tarefas agendadas devolveu **0 linhas**, sem erro e sem exit code
  ruim. A máquina tinha **17 tarefas**, uma delas rodando diariamente havia meses (medido). O
  comando não existia naquele shell e devolveu nada em vez de falhar.
- Uma busca em plataforma de trabalho devolveu "zero vagas nesse nicho". Virou veredito de
  negócio (parar de gastar créditos, derrubar o portfólio) e valeu **6 dias**. Remedido com a
  rota funcionando, o mesmo nicho tinha **62 / 23 / 910 / 266** vagas (medido). A busca nunca
  havia sido executada: o CDN devolvia 403 antes de renderizar.
- Uma CLI de issues reportou "30 abertas", duas vezes. O número real era **38** (medido): aquela
  CLI corta em 30 itens por página, em silêncio.
- Uma consulta de DNS num subnome errado devolveu NXDOMAIN e o agente afirmou que o domínio não
  estava autenticado. A autenticação existia um rótulo acima, na raiz. Na sessão seguinte, o
  mesmo registro voltou NXDOMAIN num resolvedor público grande e correto em três outros: cache
  negativo de antes da criação (medido).
- Um endpoint de lista devolveu **HTTP 200 com `[]`**, e a interface disse "nenhum workspace".
  Pedir um workspace conhecido pelo id devolveu **403 "API access is not enabled"** (medido).
  Coleção vazia engoliu a negativa de permissão e devolveu com cara de inventário.

**Regra.** Zero é o único resultado que um instrumento quebrado e um mundo vazio produzem de
forma idêntica. Qualquer outro número levanta suspeita; o zero passa por resposta.

**Como checar.**

- Rode o mesmo inventário por um segundo caminho independente antes de "não achei" virar "não
  existe".
- Ou prove o instrumento com um caso que **tem** que aparecer.
- Em qualquer CLI ou API paginada, passe limite explícito e compare com o total que a própria
  plataforma imprime.
- Em coleção autenticada vazia, busque um item conhecido pelo id. `200 []` e `403` são fatos
  diferentes.
- Inventário aparente de interface paginada não é inventário. Uma listagem renderizava 12 cards
  por vez e o dono concluiu que uma categoria não existia naquele site; a API que a própria
  página consome devolveu **1.037 anúncios, 47 deles da categoria** (medido).
- Decisão apoiada num zero herda a data e a rota daquele zero. Rota mudou, decisão reabre.
- O espelho merece a mesma atenção: campo **preenchido** lido como validado. Numa base de
  contatos, registros sem nada no campo de origem tinham uma URL não relacionada na coluna
  `website` e o rótulo "site OK", então a linha que mais precisava de atenção recebia a nota
  mais baixa. Um registro foi de 42 para 67 quando conferido, e o mesmo padrão pegava 9 linhas
  (medido).

---

## 2. O zero que confirma você é o mais caro

**Sintoma.** O resultado vazio concorda com o que você já acreditava, então ninguém audita.

**Caso.** A pergunta era se um terceiro roda anúncio pago. Duas ferramentas públicas de
transparência foram consultadas. Uma devolveu **HTTP 403 com challenge JS**; a outra devolveu
**HTTP 200 com o shell da aplicação e nenhuma lista renderizada** (medido). As duas produzem
exatamente a tela de "este anunciante não tem anúncio". Havia também uma afirmação de segunda
mão em jogo: que o crescimento deles é orgânico, não pago (dito). Ler o vazio como ausência
teria **fabricado a confirmação** dessa afirmação, e ela entraria numa decisão como fato
medido.

**Regra.** Zero que contraria o que você espera levanta suspeita sozinho. Zero que confirma, não.
O zero que confirma é justamente o que precisa do segundo caminho.

**Como checar.** Registre toda coleta que termina sem dado como uma de duas coisas, por escrito:

- **Vácuo de fato**, a ferramenta respondeu: `nenhum anúncio ativo encontrado em <data>,
  consultado em <URL>`.
- **Vácuo de instrumento**, a ferramenta recusou: `a biblioteca recusou a consulta (403,
  challenge JS) em <data>; não determinável por esta sessão`, **mais a linha de qual instrumento
  resolveria** (browser real, sessão autenticada, os relatórios nativos do cliente). Sem ela o
  registro só diz que está velho, não como sair da dúvida.

Reflexo irmão da mesma frente: dois subagentes seguidos relataram não ter automação de browser
no conjunto de ferramentas, apesar de o briefing pedir (medido). O segundo acertou ao parar e
declarar o limite em vez de repetir uma chamada HTTP simples e devolver o mesmo vazio com cara de
achado. Mas daí não sai "a máquina não tem browser": isso é outra afirmação de ausência, e pede
a própria checagem.

---

## 3. Controle positivo prova que o instrumento acha, não que ele acha a classe que falha

**Sintoma.** A sonda foi validada contra um caso que você sabia que apareceria, e mesmo assim ela
perde uma categoria inteira.

**Casos.**

- Uma consulta buscava a ficha de um diretório público de empresas **por um identificador que os
  registros carregavam**, e **19 de 22** consultas voltaram "nenhuma ficha" (medido). Aquele
  diretório indexa **outro identificador**, não o que estava em mãos. Um registro que claramente
  tinha ficha saiu como ausente. O mesmo run só testava um TLD de país, então um negócio
  anunciado em `.com`
  também virou "ausente". Todos os controles positivos passaram, porque eram leads cuja chave por
  acaso casava.
- Uma sonda leu `input[type=file].files.length === 0` e concluiu que o upload tinha falhado. O
  arquivo estava anexado; o framework limpa o input depois de consumir o `File`. O controle
  positivo disponível, uma miniatura que se sabia estar lá, devolvia `0` na mesma sonda, e nunca
  foi rodado.
- Três rodadas de QA provaram "0 ocorrências de uma string proibida" no build e no ar, cada uma
  com controle positivo válido. A página continuava servindo aquela string ao visitante: o texto
  vem de um **catálogo no banco**, não de arquivo do repositório. Um grep sobre o diretório
  construído nunca poderia vê-lo.

**Regra.** Controle positivo prova que o instrumento acha *alguma coisa*. Não prova que ele acha a
classe que está falhando. E gate de conformidade que roda sobre o repositório é cego para
conteúdo servido por banco, API ou CMS.

**Como checar.** Antes de aceitar ausência em massa, pergunte **por qual chave o índice é
construído** e se é a chave que você tem em mãos. Depois teste de propósito um caso da classe
**suspeita**, não um da classe em que você já confia. Antes de declarar uma superfície limpa,
enumere de onde vem cada texto público e cubra as fontes dinâmicas abrindo a tela ou chamando o
endpoint.

---

## 4. Exit 0 prova término, não trabalho

**Sintoma.** Um painel de tarefas todo verde, e nenhum artefato em lugar nenhum.

**Casos.**

- Uma tarefa agendada rodou todo dia às 08:30 com código de sucesso por **25 dias**. O script caía
  num `if hoje > FIM_DO_PILOTO: print(...); return`, um return sem valor, logo exit 0. O artefato
  mais recente em disco era de quatro semanas antes (medido). Vinte e cinco dias de sucesso vazio.
- Um leitor escrito como `existsSync(caminho) ? ler(caminho) : ''` imprimia um relatório bem
  formado, `{"episodios":0,"retrabalhoTotal":0,"serie":[]}`, e saía 0 para um caminho com typo.
  Para uma ferramenta cujo trabalho inteiro é dizer **onde** está o problema, "nenhum problema" é
  a resposta mais cara: ninguém investiga um verde.
- Um auditor de repositórios pulava o repo quando a API não devolvia o estado
  (`if observado.get(nome) is not False: continue`). Rate limit, timeout, mudança de formato: em
  qualquer um deles ele saía **verde**, afirmando conformidade que nunca mediu.
- Um subagente entregou um PDF reportando "zero FAIL" na checklist inteira. A contagem de páginas
  batia, o compilador saía 0, o log não tinha marcador de erro, a camada de texto extraía limpa, e
  o PDF renderizado imprimia lixo de caractere de controle acima da assinatura. Dois bytes `0x08`
  tinham sido gravados na fonte por um heredoc de shell. Nenhum comando da checklist enxerga isso,
  e grep também não, porque byte de controle não vira texto no arquivo.

**Regra.** Exit code mede que o processo terminou. "Não sei" é violação com código próprio, nunca
silêncio verde.

**Como checar.**

- Para qualquer tarefa agendada: liste o diretório de saída e compare a data do artefato mais
  recente com a última execução esperada. Sem artefato novo, a tarefa está morta por mais verde
  que esteja. Ao criar tarefa cujo sucesso importa, inclua a checagem de artefato com data no
  mesmo ato.
- Leitor cuja fonte não existe sai com erro nomeando o caminho. Série vazia só existe quando a
  fonte existe e não tem linha. Vale igual para carimbo de versão: gravar `v: 1` e não conferir no
  parser é a mesma mentira adiada, com v1 e v2 na mesma média.
- "Não deu para auditar" e "auditei e achei violação" saem com **códigos diferentes** (2 e 1). Num
  gate de CI, confundir os dois transforma ferramenta quebrada em repo aprovado.
- Documento gerado por agente se abre e se olha antes de dar por pronto.

---

## 5. Smoke prova resposta; dry-run prova o caminho seco

**Sintoma.** Uma checagem barata passa e é escrita no handoff como "confirmado funcionando",
virando premissa da sessão seguinte.

**Casos.**

- Uma rota foi declarada "de pé" a partir de um **smoke de 4 chamadas** (exit 0 em 10s). Quarenta
  minutos depois, mesma rota e mesmo gateway, uma tarefa multi-passo devolveu **1x 200 e depois
  11x 429, exit 3, nada escrito**; a rota de fallback deu **3x 504, exit 124, nada escrito**
  (medido). Nada mudou no alvo entre as duas medições: mudou o tamanho da tarefa. A janela maior
  também expôs um vazamento de provedor que o smoke curto não tinha como pegar.
- Quatro dry-runs de um disparo passaram limpos. O run real quebrou exatamente nas duas coisas que
  dry-run não exercita: um campo de seleção única recusou texto livre com **422** (dry-run não
  escreve, logo não valida schema de escrita), e uma trava fail-closed de armazenamento nunca
  tinha sido tocada em produção, então o envio real morreu num erro de ambiente ausente. Fatia de
  1 antes da fatia de 13 não é cautela decorativa: é o único instrumento do tamanho do trabalho.
- Uma requisição anônima passou de `307` para `401` depois de um conserto de proxy, e o problema
  foi declarado resolvido. O `401` só provava que o **transporte** estava certo. O mesmo GET **com
  o token real** devolveu `200` e corpo vazio: a causa real vivia no ramo autenticado, num filtro
  de escopo aplicado só a principais por token e não a cookie de sessão (medido). Por isso a
  interface mostrava o recurso e o cliente recebia lista vazia.
- Um patch de failover foi "validado" por um run que terminou limpo em 25s. O run abortou numa
  guarda de liveness pré-voo que roda **antes** do código novo, então nenhuma linha do laço novo
  executou. Uma checagem de sintaxe tinha passado, e por um instante isso pareceu evidência.

**Regra.** Health check de uma chamada é filtro de exclusão, nunca aprovação. Código de status de
chamada anônima mede rota, nunca autorização: filtro de escopo, tenancy e feature flag por
principal moram depois do auth e só aparecem com a credencial real na mão. Teste que morre numa
camada mais rasa que o patch não é teste fraco, é teste ausente, e parece um teste que rodou
porque o comando saiu limpo.

**Como checar.** Antes de declarar rota, serviço ou modelo utilizável, rode **uma tarefa do
tamanho do trabalho real**, com um alvo real, e audite a janela inteira de chamadas em vez da
amostra que coube. Antes de chamar um patch de validado, aponte a linha de saída que só existe
**se o caminho novo executou**. Não achou essa linha na saída real, escreva "implementado, não
validado" no commit e no handoff, com o que falta para exercitá-lo. Quando é a guarda anterior que
aborta, ou se desarma a guarda para o teste, ou se espera a janela em que ela deixa passar.

---

## 6. Um sinal só prova execução se não pudesse existir sem ela

**Sintoma.** Você lê um valor na página, conclui "o script roda", e manda a investigação para
baixo de uma premissa falsa.

**Casos.**

- Diagnosticando um hero em branco, um agente mediu `getElementById('year').textContent ===
  "2026"` e afirmou "o script RODA, então o defeito está depois". O `2026` estava hardcoded no
  HTML. A causa real: o arquivo nunca teve `</script>`, `</body>` nem `</html>`, terminava no meio
  de um bloco, e o IIFE inteiro jamais executou desde o primeiro commit. `grep -c '<script'` (4)
  contra `'</script>'` (3) resolvia em um comando (medido). O subagente acertou porque
  **desobedeceu** à hipótese do briefing e mediu do zero.
- Um painel mostrava "sonda ainda não respondeu" em todos os cards **enquanto a aba de rede
  mostrava as requisições voltando 200**. O 200 foi usado para descartar o front e culpar o
  backend, duas vezes, errado. A montagem dupla do framework descartava a primeira renderização
  junto com o resultado. A requisição existiu; o que morreu foi a atualização de estado da
  instância descartada.
- Duas rodadas de QA provaram uma medição visual "feita" enquanto os dois PNGs capturados eram
  **100% brancos**. Os critérios de aceite liam o DOM, e todos passam numa página que não
  renderizou. O conserto, hoje linha fixa de briefing visual: **conte os pixels não brancos do
  próprio PNG e imprima o número**, 0% na rodada ruim contra 100% na boa. Artefato visual exige
  asserção sobre o próprio artefato, nunca só sobre o estado que o gerou.

**Regra.** Um sinal só prova execução se for **impossível** sem ela: valor calculado em runtime,
ou marcador que você mesmo injetou. "Requisição 200" e "a tela recebeu o dado" são dois fatos
distintos. Sintaxe válida prova que o arquivo parseia, nunca que a lógica roda.

**Como checar.** Pergunte se o sinal poderia existir com o código desligado. Se puder, não é prova.
Em página que não desenha, compare a contagem de tags de abertura e fechamento antes de qualquer
teoria sobre lógica. E ao briefar diagnóstico, marque a hipótese **como hipótese a confirmar ou
derrubar por medição**: foi o que salvou o primeiro caso.

---

## 7. Detector que nunca acusou nada não é evidência de saúde

**Sintoma.** Um verificador passou a sessão inteira verde enquanto o defeito está visível na tela.

**Casos.**

- Um auditor mobile devolveu `imgNoReservedSpace: 0` a sessão inteira enquanto um logotipo do
  cabeçalho estava **visivelmente achatado** na tela. O detector media a *ausência* de
  `width`/`height` no HTML, não a *proporção errada* no render. Quem achou o bug foi olho humano
  depois de várias rodadas verdes.
- Um teste de segurança provava que um bucket era privado buscando `media/probe.txt`, arquivo que
  **não existe**, e aceitando `status >= 400`. Bucket público devolve 400 para caminho
  inexistente, então o teste passava exatamente no cenário que deveria acusar, sobre um bucket de
  arquivos privados de usuário que estava aberto a quem tivesse a URL. O mesmo defeito valia para
  duas RPCs que não existem no banco, onde 404 também é `>= 400`.
- Um passo de CI afirmava "a suíte executou testes de verdade" com um grep por qualquer contagem
  positiva. A suíte inteira foi apagada de propósito e o **CI saiu verde** (medido): o runner sai
  0 sobre um arquivo esvaziado e ainda reporta um teste passando, porque o arquivo vazio conta
  como teste. Corrigido com piso numérico somando as execuções.

**Regra.** Detector que nunca acusou nada não é evidência de saúde, é ausência de medição. Prove os
dois lados: injete o defeito e exija a acusação; exija silêncio no estado limpo. Calado nos dois
está quebrado; acusando nos dois é ruído.

**Como checar.**

- Asserção de faixa (`status >= 400`) contra recurso que o teste não criou mede inexistência, não
  autorização. Exija o código exato e crie o recurso antes de sondar.
- Quando o defeito temido é **encolhimento** (testes apagados, itens sumindo de uma lista,
  arquivos que deixam de ser copiados), asserção booleana de existência é decorativa. Use contagem
  com piso, e mova o piso junto com o trabalho, nos **dois** sentidos: remover código morto com os
  testes dele baixa o piso no mesmo commit, senão o gate fica vermelho por uma remoção correta.
- Suíte verde não dispensa review. O ciclo vermelho para verde prova que o código faz o que o
  teste pede; ele nunca pergunta se o contrato está certo. Num caso, a suíte inteira estava verde e
  quem achou o defeito foi a revisão de código.
- Detalhe prático para injetar defeito sem perder trabalho: **commite antes de injetar e desfaça
  por edição inversa**. Descartar com checkout do arquivo apaga trabalho não commitado no mesmo
  arquivo. Aconteceu três vezes, duas delas depois de a regra já estar escrita. A forma que fecha a
  porta não é lembrar, é só plantar defeito em arquivo já commitado.

---

## 8. O teste negativo tem que falhar pelo motivo que você afirma

**Sintoma.** Você injeta um defeito, o teste fica vermelho, e você conta isso como prova de outra
coisa.

**Casos.**

- Uma suíte de CLI checava que montar um vídeo sem o WAV da narração falha nomeando o arquivo.
  Remover a guarda `if not wav.exists()` deixou o teste **verde** (medido): sem ela o codificador
  estoura sozinho, com código de saída diferente de zero e o nome do WAV no stderr dele. Todo
  caminho de erro downstream imita esse sintoma.
- Uma trava foi testada através de um shell que não divide argumento separado por vírgula em
  array. O bloqueio aconteceu, exit 1, mas a mensagem nomeava o agente como a string única
  `'agent-a,agent-b'`. Bloqueou porque aquilo não é nome de agente nenhum, não porque discriminou o
  que deveria. O bloqueio era real e a conclusão era falsa.
- Uma mutação feita por substituição de string num arquivo CRLF não casou. O arquivo saiu **byte a
  byte idêntico**, o teste passou, e o detector quase foi declarado provado. Ele não rodou contra
  defeito nenhum.
- Uma substituição sem flag global pegou a **primeira** ocorrência, que estava numa função irmã
  que nenhum teste chama. Um teste honesto quase foi reprovado por isso.
- Um defeito foi injetado num ponto que a execução real nunca percorre (o despacho desviava antes)
  e a suíte ficou 28/28 verde. A conclusão disponível, "o teste é cego", estava errada: não tinha
  sido plantado defeito, tinha sido plantado código morto. Só depois de reconstituir o
  comportamento antigo nos **dois** pontos e medir a saída por fora (2 linhas gravadas contra 1) o
  veredito passou a significar algo, e aí sim o teste era cego, porque chamava a função interna por
  fora e nunca exercitava o **roteamento** até ela, que era o que a mudança alterava.
- Uma frase de teste de detector de prosa carregava **dois** gatilhos. Quem disparava era o
  segundo. Sem ele, o primeiro, a forma atenuada que era o critério de aceite nomeado, passava
  batido. Dois testes verdes cobrindo um caso que nenhum dos dois testava.
- Um teste negativo injetou o defeito errado: um detector de mojibake tinha autoteste 5/5 feito
  injetando o caractere de substituição Unicode, que é **irrecuperável por definição**. O defeito
  real em produção era outro, na direção inversa, e o detector concluiu "0 corrompidos". Custou um
  diagnóstico errado em produção.

**Regra.** Teste negativo só vale se o defeito injetado for **o defeito temido**, e se ele falhar
pelo motivo que você afirma. "Ficou vermelho" é sintoma compatível com bug no arnês do próprio
teste, e vale em dobro quando o teste atravessa fronteira de shell, onde o argumento pode chegar
com outra forma.

**Como checar.**

- **Forma mais barata, e que não depende de lembrar de nada: remova a GUARDA em vez de injetar um
  defeito.** Se o teste seguir verde sem a proteção, ele mede outra coisa. É mais barato que forjar
  o cenário e ataca exatamente a pergunta certa.
- Asserte três coisas juntas, não uma: a mensagem **própria** do script, literal; a **ausência de
  traceback** (falha por guarda, não por exceção); a **ausência de efeito colateral** (nenhum
  arquivo escrito).
- Sequência: injeta, **mede a saída fora do teste**, e só então lê o veredito. Pular o passo do
  meio gera os dois erros opostos com a mesma facilidade.
- Imprima o diff no mesmo comando da injeção, antes de julgar o resultado. Âncora de busca é a
  assinatura da função, não a linha de dentro dela. Prove que a mutação mudou o arquivo (comparar
  antes e depois, abortar se igual) antes de olhar o teste.
- A asserção nomeia a **regra** que disparou, nunca só o exit code. Frase de teste carrega **um**
  gatilho.
- Escreva em uma frase qual defeito você está injetando, antes de injetá-lo. Se a frase não
  descreve o cenário real de falha, o 5/5 é decorativo.
- Mudança de despacho se testa pela **porta real** do programa (stdin, CLI, subprocesso), não
  chamando a função interna.
- Cuidado com a camada de captura: ler a saída de um subprocesso como UTF-8 num console que emite
  outra página de código estoura erro de decodificação **dentro da thread leitora**, o runner
  reporta como aviso, e o stderr capturado chega **vazio**. Dois testes negativos passaram sem ter
  lido nada (medido). Capture sempre com substituição de erro.

---

## 9. Meça efeito, não declaração

**Sintoma.** O gate grita sobre uma propriedade enquanto o comportamento está certo, ou cala
enquanto o comportamento está quebrado.

**Casos.**

- Um gate mobile acusou **34** imagens de empurrar o layout. Medindo o efeito, **33 não mexiam em
  nada** (medido). Sobrou 1 caso real. A invariante lia `width`/`height` na `img`, mas quem reserva
  o espaço é o **container** (`aspect-ratio`, altura fixa).
- O inverso, no mesmo dia: o auditor acusava âncoras sem a propriedade de deslocamento de scroll
  lendo a declaração computada. O comportamento (navegar até o id e medir se o cabeçalho fixo cobre
  o topo) estava certo, porque o scroller já carregava a propriedade equivalente, e as duas somam.
  Auditar propriedade é auditar a sua hipótese; auditar comportamento é auditar o site. A armadilha
  é pior **assada dentro de um script**, onde parece medição objetiva e não opinião.
- Deslocamento foi medido na **caixa do próprio elemento**, que vai de 0x0 ao tamanho final mesmo
  quando nada se move. Ele se mede na caixa do ancestral, ou na altura do documento.
- Um teste que **aborta** a imagem dispara o `onerror` da tag, o elemento some, e o resultado não
  tem relação com o mundo real. Chegou a inverter o sinal duas vezes, mostrando salto onde não
  havia e escondendo o conserto depois de aplicado. O teste fiel é recurso **lento**, não ausente.
  Quando o HTML tem tratamento de erro, simular falha testa o tratamento, não a espera.
- Todas as páginas davam deslocamento ~0 em servidor local. Só com rede degradada **e rolando até
  o fim** (lazy não dispara com a página parada) o defeito apareceu: 0,1416 numa página (medido).

**Regra.** Invariante boa mede efeito observável, não declaração no código. Se a invariante
pergunta "está escrito?" em vez de "acontece?", ela vai gritar no lugar errado, e gate barulhento
morre sem ninguém desligar. Ausência da propriedade que você esperava não é ausência do
comportamento: quase sempre existe mais de um jeito de produzir o mesmo efeito.

**Como checar.** Para defeito comportamental, execute a ação e meça o resultado na tela. Degrade a
rede antes de afirmar número de performance. Pergunte onde mora a evidência do efeito antes de
escolher o que amostrar. E note que escrever a regra não imuniza contra ela: dez minutos depois de
escrever "sempre medir em contexto móvel" dentro de uma skill, o mesmo agente mediu numa página
desktop padrão e acusou o conserto alheio de não existir, porque ele vivia dentro de uma media
query de celular. A regra tem que estar no script, não no texto.

---

## 10. A régua não pode morar dentro do sistema medido

**Sintoma.** Toda invariante tem teste negativo e o relatório continua majoritariamente falso.

**Casos.**

- Um verificador mobile tinha teste negativo em todas as invariantes e mesmo assim entregou **33
  de 34 acusações falsas** (medido), escondendo o único defeito real. O buraco não estava no juízo
  e sim na **coleta**: o snapshot comparava o estouro com a largura interna da janela, e no mobile
  o layout viewport se infla para caber exatamente o conteúdo que deveria vazar (um elemento em
  425px, a janela respondendo 425).
- Duas sessões independentes auditaram o mesmo site e as duas fecharam nos mesmos "8 achados". As
  duas estavam erradas: rodaram o mesmo auditor defeituoso. Concordância só conta como confirmação
  se os caminhos de medição forem diferentes. Com o mesmo instrumento, ela mede o instrumento.
  Vale igual para dois subagentes com o mesmo prompt.

**Regra.** Detector tem duas peças: o **fotógrafo** (coleta) e o **juiz** (invariante). Teste
negativo só no juiz não prova nada.

**Como checar.** Pergunte: **de onde vem o número contra o qual eu comparo?** Se vier do próprio
alvo, presuma cegueira até provar o contrário. A referência tem que ser externa: constante de
configuração, viewport de dispositivo emulado, resposta real do host, resultado da fórmula em vez
do texto dela. Feche com um teste de duas pontas **na função real de coleta**: com a referência
externa o defeito aparece; reproduzindo a referência corrompida ele some. O segundo é o guarda: se
ficar verde com a lista cheia, a cegueira voltou. Bissecção também vale para detector: um worktree
num commit anterior mais o mesmo comando de medida isola se a variação veio do conserto ou do
ruído. Numa sessão isso provou que a subida de uma métrica vinha de um conserto de grid feito horas
antes, não do arquivo que ia ser culpado.

---

## 11. Contagem de detector não é fila de trabalho

**Sintoma.** Um scan devolve um número grande e o número é reportado como trabalho.

**Casos.**

- Um scan de um acervo de skills acusou **87 quebradas**. Abrindo à mão: **87, 57, 17, 4**, e das 4
  restantes só **2** eram defeito de verdade, nenhuma delas nossa (medido). Cada queda foi uma
  família inteira de falso positivo morrendo de uma vez. Nada disso apareceu lendo o código do
  detector; apareceu abrindo o arquivo acusado.
- As sete famílias, todas variações do detector confundindo produto com insumo, ou olhando o lugar
  errado do disco: cópia velha em cache (10 versões do mesmo plugin multiplicando um achado por
  10); artefato do alvo auditado em vez de recurso da ferramenta; arquivo gerado em runtime pela
  própria coisa auditada; referência relativa a uma raiz mais alta; caminho didático em
  documentação; recurso compartilhado com o vizinho; âncora dentro de um arquivo que existe.
- Oitava família: um detector de prosa acusou **a documentação do próprio conserto**, porque o
  comentário citava a string proibida para explicar por que ela tinha saído. Uma versão parente
  acusou **15 de 200** arquivos de memória, **100% falso positivo**, justamente os que *defendem* a
  honestidade, porque citam a frase proibida para proibi-la. Detector de prosa erra nas duas
  direções ao mesmo tempo, e só a varredura contra o **acervo real** mostra as duas; fixture nunca
  encosta na prosa que as pessoas escrevem de verdade.
- Nona: um guarda registrado atrás de um teste de existência, apontando para um caminho que não
  existe. No-op silencioso, nunca rodou, nunca reclamou, e o relatório de infra o listava como
  configurado.
- O **corte** que decide quem o detector julga é parte do detector. Usar data de modificação do
  arquivo como "só julga o que é novo" mede a última vez que alguém encostou, nunca quando o
  conteúdo nasceu: num corpus, **62 das 84** ocorrências vinham de um único arquivo de 406 linhas
  cheio de fatos escritos semanas antes por sessões mortas (medido).

**Regra.** Não reporte contagem de detector como fila enquanto cada achado não tiver sido aberto à
mão pelo menos uma vez. Enquanto sobrar falso positivo conhecido no relatório, o número não é
dizível: "restam N quebradas" é mentira educada. "87 achados, e não sei quantos valem" é melhor.

**Como checar.**

- Por família: conserto no classificador mais **duas fixtures congeladas**, o caso legítimo real
  copiado byte a byte, que **não** pode acusar, e o defeito injetado de propósito, que **tem** que
  acusar. Sem a ponta negativa o conserto vira anistia silenciosa.
- Antes de commitar o conserto, guarde-o de lado e rode só a classe de teste nova: ela tem que
  **falhar**. Teste que passa dos dois lados não testou nada.
- Detector de prosa separa **menção de uso** antes de classificar: texto entre crases ou em bloco é
  citação e sai do julgamento, e a máscara precisa preservar offset e quebra de linha, porque o
  span real atravessa linha. Declare a troca que você aceita em vez de escondê-la: num caso,
  alargar a isenção só moveria o falso positivo, então o preço aceito foi que certas formas de
  citação escapam do gate, e isso ficou registrado como preço, não escondido.
- Guarda registrado com teste de existência tem que **falhar alto** quando o alvo não existe, ou
  sair da config. Guarda que degrada para nada quando o caminho quebra é pior que guarda ausente:
  o ausente ninguém conta como cobertura.
- Opt-in do corte é aceitável; opt-in silencioso não. Cobertura perdida sem contador é o mesmo que
  não ter detector: estado próprio, balde próprio no resumo, aviso nomeando os arquivos.
- O reflexo errado é tratar o vermelho como fila e carimbar. Carimbar procedência que você não
  conhece produz acervo que **parece** ter origem, com o selo do gate por cima, que é o defeito
  que o detector existia para matar, agora certificado.
- Fixture prova comportamento **por item**, nunca **o tamanho da varredura**. Se um filtro novo
  comer demais, a suíte continua verde e a contagem cai calada. Registre como lacuna conhecida em
  vez de deixar virar escopo silencioso.
- Corolário incômodo: o detector acusa justamente os itens **mais bem escritos**, que documentam o
  que produzem. Acervo bom, relatório sujo.
- Vocabulário conta aqui. Uma sessão adotou jargão emprestado que nunca foi combinado no projeto, e
  o dono teve que parar e perguntar o que aquilo significava. Termo que só vive na sua cabeça não é
  vocabulário do projeto; se o dono precisa de tradução, a explicação está errada, não ele.

---

## 12. Fixture sintética não carrega a patologia do material real

**Sintoma.** A suíte do detector está verde, com testes negativos, e o detector continua errado
sobre o corpus real.

**Casos.**

- Um detector acusou **45 de 120** itens de não ter uma cláusula obrigatória. Antes de classificar
  qualquer coisa, um caso positivo foi reproduzido no arquivo cru: a cláusula estava lá, o detector
  é que não via. O parser de frontmatter próprio dele truncava campo multi-linha em arquivo
  **CRLF**. Depois do conserto: **45 para 24**. **21 das 45 (47%) eram o instrumento** (medido). A
  suíte estava **13/13 verde com 6 negativos**, todas as fixtures escritas em LF limpo pelo mesmo
  autor.
- Um conserto de match de lead passou **424/424 com controle negativo** e não mudou nada em
  produção: a query restringia a lista de campos pedidos, e o campo de que o conserto dependia não
  estava nela, então chegava vazio ao handler. A fixture montava o registro **já com** o campo.
  Testou o consumidor, nunca o caminho que traz o dado.
- O agregador de um contador foi provado com fixture sintética e declarado entregue. Uma chamada
  real depois marcou **0**. O sistema tinha duas metades rodando de lugares diferentes: o
  **leitor** do repositório, o **escritor** de uma cópia instalada que nunca tinha sido
  sincronizada (grep do padrão novo dava 2 na fonte e **0** no cache). Fixture sintética alimenta o
  agregador com linhas que você mesmo escreveu; ela nunca exercita quem **produz** o dado.
- Fixture recortada dá falso verde: cortar um log de sessão no que parecia a última linha relevante
  fez um caso negativo passar por engano, porque o classificador lê o stream inteiro. Fixture é a
  saída real integral, com varredura de segredo antes de versionar.

**Regra.** Teste negativo não basta. A fixture tem que herdar a patologia do acervo: CRLF, BOM,
acento, multi-linha, campo vazio, e a projeção de campos da query real. Campo que a query não pede
não existe para o código.

**Como checar.**

- Antes de classificar ou contar o resultado de um detector, **reproduza um positivo no arquivo
  cru, no mesmo turno**. Achado que cobre cerca de um terço do universo é sinal de defeito de
  instrumento, não de acervo podre.
- Escreva fixture de parser copiando um arquivo real do alvo, em vez de digitar um limpo.
- Conserto que depende de um campo novo precisa de teste que trave a **lista de campos pedida**,
  não só a função que consome.
- Pergunte *quem escreve o dado que meu detector lê, e de onde esse escritor roda*, e prove com a
  cobaia real, não com a fixture.
- Nunca escreva artefato de decisão (baldes, "desinstalar X") em cima de contagem não reproduzida.

---

## 13. O processo carrega a cópia instalada, não a sua edição

**Sintoma.** Você mede uma edição que o processo sob teste nunca carregou, e o resultado é 100%
verde.

**Casos.**

- Uma bateria ia rodar contra um componente patchado. O patch estava no repositório (23.366 bytes,
  um sha); o harness carrega esse componente de um **cache de plugin** que ainda servia 23.390
  bytes e o sha **antigo**, exatamente o alvo do "antes" (medido). Pego conferindo sha por acaso,
  não por processo. Teria voltado 100%, idêntico ao antes, com todos os critérios de aceite
  marcados e um veredito de não-regressão emitido sem uma linha do patch ter sido carregada. O modo
  de falha é silencioso e verde; nada acusa.
- O mesmo contador depois marcou **0** por um segundo motivo: uma frente paralela tinha aposentado
  um marcador e, ao fazê-lo, **removido o hook do bloco de eventos da configuração do harness**. O
  regex estava certo, a função estava certa, o evento nunca chegava. Fixture testa a **função**; o
  registro decide se ela é **chamada**. São dois artefatos, e verde num não diz nada do outro,
  então instrumento que depende de evento leva um caso negativo que lê a **configuração** e exige o
  registro.
- Depois de instalar uma versão nova, o registro de plugins atualizou caminho e versão e deixou o
  sha do commit e o timestamp **três commits atrás**. Um procedimento que provasse a instalação por
  aquele campo teria reprovado uma instalação que pegou. Repetiu na instalação seguinte com outro
  sha, então não foi acaso.
- Um modelo local foi removido da máquina. Dias depois a config continuava apontando para ele como
  padrão. Ler a config e achar o valor certo pela listagem do runtime **não corrigiu nada**: o
  arquivo que o processo carrega seguia mentindo.

**Regra.** Entre o arquivo que você edita e o que o processo carrega quase sempre existe uma cópia:
cache de plugin, diretório de dependências, saída de build, imagem de container, CDN. Achar o valor
certo é diagnóstico, não conserto; o conserto é editar o arquivo e provar por um segundo comando
que ele agora reflete a máquina.

**Como checar.**

- sha256 dos dois caminhos, comparados no mesmo turno. "Eu instalei" não vale; o número vale.
- Um probe positivo barato que só passa se o texto novo estiver vivo.
- O relatório grava o sha do que foi **carregado**, não o do repositório.
- Prove a instalação com grep de um **trecho novo do patch dentro do arquivo no caminho de
  instalação**, nunca pelo campo do registro, nunca por "já instalado", nunca por número agregado
  de recarga.
- Número de versão escrito em handoff vence em horas: dois bumps seguidos colidiram com números que
  outra frente já tinha publicado no remoto (medido). Leia o remoto antes de bumpar.
- Depois de mexer no ambiente, **re-sonde antes de concluir que ele não mudou**. Duas sondagens
  negativas medem o estado, não a regra. Num caso, uma recarga foi declarada sem efeito, isso virou
  fato escrito e **propagou para três sessões irmãs**, uma delas gravando na própria memória e
  replanejando um ticket em cima. Uma segunda recarga, cuja saída imprimia o número de hooks
  carregados (a evidência que estava lá e não foi lida), fez o campo aparecer na hora, na mesma
  sessão. Fato que já saiu para outras sessões volta como correção explícita, não como silêncio.

---

## 14. Suíte verde não prova que o gate roda

**Sintoma.** O check existe, os testes passam, e nada impede o defeito de subir.

**Casos.**

- Um gate foi escrito e a invariante declarada "protegida". O workflow de CI **não rodava o comando
  de teste**: montava o site e checava um contrato, e mais nada. Os 102 testes e o gate existiam só
  numa máquina. Um commit reintroduzindo a chamada proibida passaria o CI verde.
- Um auditor media o CI de repositórios de terceiros como `total_count > 0` na API de execuções:
  existir corrida registrada bastava para absolver. Um repo ficou **6 dias com o build falhando**
  enquanto a auditoria diária imprimia "executou" e fechava com "todos os repos no estado
  desejado", **10 rodadas verdes seguidas** sem enxergar o vermelho (medido).
- Um gate extraía o veredito com regex sobre o **placar humano** do detector: a guarda era
  `!/0 pendente/.test(resumo)` contra a frase `"14 pendente(s)"`. `0 pendente` casa como substring
  de **`10 pendente`**, e a migração seguinte passa exatamente por 10. Pior: se o detector mudasse
  o texto do placar, nenhuma regex casaria, a variável ficaria vazia e o gate publicaria `ok` em
  branco, fail-open dependendo de um contrato que ninguém declarou.
- Um detector **contraiu** (aviso virou reprova; uma causa de exit 1 virou duas) e todo consumidor
  que ramificava pelo exit code passou a acusar a causa errada: veredito certo, explicação errada,
  que é o modo de falha que ninguém confere. Ele imprimia "o auditor está quebrado, o defeito é em
  <o próprio auditor>" quando o defeito estava no arquivo auditado, mandando consertar o artefato
  saudável e nunca nomeando o culpado. A suíte seguiu 29/29 e o exit seguiu 1.
- Três hooks anti-vazamento tinham suíte negativa 9/9 havia semanas e **nenhuma evidência de terem
  disparado** com o runtime rodando. Sondar custou 3 chamadas de ferramenta e fechou um item aberto
  havia três semanas.

**Regra.** Entregar qualquer check responde, no mesmo turno, **quem executa isso quando eu não
estiver aqui**. Enquanto ninguém além de você roda, a frase honesta é "gate de honra", não "está
protegido".

**Como checar.**

- Leia o workflow do CI e cite a linha. "Tem CI" não significa "roda o meu check". Em repositório
  privado de plano gratuito, job vermelho sinaliza mas não barra merge: diga isso em vez de vender
  proteção que não existe.
- Prove o negativo no **caminho de execução**, não só no script: ver o gate vermelho na sua máquina
  prova que ele detecta; provar que ele protege exige ver o CI vermelho com o defeito num branch
  descartável, e verde sem ele.
- Rode o check num **clone limpo** antes de ligar o job. Uma suíte pode estar verde por estado de
  máquina: um harness lia um diretório de resultados gitignored cheio de rodadas locais, e ficou
  vermelho na hora em que rodou a partir de um arquivo extraído do repositório.
- Rode o check solto **antes** da suíte dentro do job. Dentro do runner o log só diz "um teste
  falhou"; solto, ele diz qual arquivo e qual linha, e é essa a primeira mensagem na tela de quem
  revisa.
- Extrair código para um módulo compartilhado inclui, no mesmo commit, o item de gate que roda a
  suíte dele, e ele roda antes dos consumidores. Módulo compartilhado sem item próprio é pior que
  teste ausente: os dois consumidores leem por ele e, se ele quebra, cada detector diz que está são.
- Gate consome a **saída estruturada** do detector (`--json`, parse, contar campos), nunca regex
  sobre a linha humana. Parse que falha é erro explícito, não `ok` vazio. Em modo JSON o stdout é só
  JSON: placar humano no mesmo canal quebra o parse do consumidor. E a suíte do detector **não**
  cobre o consumidor dele: 29 casos passavam enquanto o gate lia errado.
- Detector de CI de terceiro pergunta a **conclusão da última corrida concluída**, e só sucesso
  absolve; cancelada e expirada são corridas que terminaram sem provar nada. Consulte apenas
  corridas completas, senão você julga run em andamento, cuja conclusão é nula.
- Quando um detector contrai, faça grep pelo exit code nos leitores e abra cada um. Consumidor lê o
  **dado**; o exit code serve para conferir se os dois contam a mesma história, e a divergência
  entre eles vira erro nomeado. Uma mensagem por conserto: somar dois defeitos numa mensagem manda
  consertar errado. Ao rodar a injeção, **leia a mensagem, não o exit**.
- A linha de resumo é derivada do **mesmo veredito** que decide o exit code. Escrita à mão, ela
  mente sem quebrar teste nenhum: um contador somava causas distintas e mandava consertar o alvo
  errado; um trecho incondicional afirmava o oposto do exit code no mesmo fôlego. Uma causa, um
  número; no caso verde o resumo é o único output que o operador lê.
- Auditar a saída de um gate começa **sem filtro**. Fazer grep na saída do caso negativo antes de
  conhecer a forma dela corta a evidência: quase produziu um relatório de que "o detector não nomeia
  o agente" quando ele nomeava, linha a linha.

---

## 15. Gate é afirmação positiva, nunca ausência do proibido

**Sintoma.** Toda checagem de proibição está verde e o artefato está vazio, quebrado, ou sem o que
importa.

**Casos.**

- Um diretório de build **vazio** foi publicado e derrubou o site inteiro, 404 na raiz e em todas
  as páginas, duas vezes seguidas, no meio de uma remoção urgente de conteúdo. Um servidor de
  medição rodava com o diretório de trabalho dentro da pasta de build, o rebuild bateu em erro de
  recurso ocupado, a limpeza falhou e a pasta deixou de existir. A ferramenta de deploy subiu isso
  sem reclamar, reportando deploy bem-sucedido. Todo grep de proibição (`refs proibidas: 0`,
  `fontes de design: 0`, `arquivos proibidos: 0`) passou verde: **pasta vazia passa em todos**. O
  que salvou foi um **controle positivo no mesmo comando** da prova de 404: pedir `index.html`
  esperando 200, e receber 404.
- Um gate de design escrito como blocklist deixou passar **exatamente a fonte que a decisão existia
  para matar**. Mais dois defeitos no mesmo gate: um grep por `serif` casava `sans-serif` e
  reprovava o estado *correto*; e todos os greps liam a saída de build, que é gitignored, então
  rodar o gate antes do build passava em silêncio.

**Regra.** Blocklist só pega o que alguém lembrou de listar. Escreva o gate como afirmação
positiva: allowlist fechada do que é permitido, falhando em qualquer coisa fora; contagem de
arquivos e páginas que têm que existir; ausência do alvo como **erro**, nunca como aprovação.

**Como checar.**

- `test -d <alvo> || exit 2`, flags estritas de shell, e a ordem build, depois gate, no mesmo job
  do CI.
- **O controle negativo é escrito por quem audita, não pelo autor do gate.** Num caso, os dois
  controles do autor passaram e o terceiro, do auditor, derrubou tudo.
- Mantenha o servidor de medição **fora** da árvore do alvo, com diretório absoluto, e mate no fim.
  Processo que falhou ao tomar a porta continua vivo segurando o handle; porta ocupada por outra
  sessão serve outra pasta e devolve 404 em arquivo que existe.
- Checagem de contrato roda nas **duas direções**. Um validador conferia só código para banco (todo
  valor declarado existe lá) e nunca o inverso, então a base acumulou um valor que o código não
  conhecia, sem nenhum alarme.
- Gate que não roda no ambiente que ele guarda é outra falha: um gate dependia de artefato que o CI
  de propósito não instala e ficava vermelho lá. **"Não conferido" e "reprovado" pedem severidades
  opostas**, aviso ruidoso e erro. Meça gate novo num worktree limpo a partir do main remoto, que é
  a reprodução barata do CI, não só na máquina do autor.

---

## 16. Suíte abortada é gate cego, e o vermelho também mente

**Sintoma.** Um exit diferente de zero que significa "nunca mediu", lido como "mediu e reprovou".

**Casos.**

- Uma bancada saiu com **exit 99 / "ABORTADO: patch não aplicou"** logo depois de uma edição, e a
  edição pareceu culpada. Guardar a edição de lado e rodar de novo deu **o mesmo exit 99**: a
  bancada estava cega desde um commit **do dia anterior**, e ninguém viu. Consertada, ela achou na
  hora um segundo defeito velho, uma asserção que exigia um valor que o código tinha sido mudado
  para nunca produzir.
- Um arquivo de teste importava sua fonte de um diretório **gitignored**. Na máquina local o
  arquivo existe e a suíte dava 158/158; no runner o import estourava no topo e o arquivo inteiro
  morria, então **33 testes não rodavam no CI**, incluindo as invariantes que protegiam o disparo.
- Um harness tinha três vereditos: passou, falhou, inválido. Mas a doutrina que ele mede **manda
  parar** em duas situações. Nos três casos em que o alvo parou corretamente, o placar marcou
  **falhou**, e um 1/4 cru virou "não roteia" quando a leitura do log dizia o contrário. O
  instrumento reprovava exatamente o comportamento que a regra ordena.

**Regra.** Exit diferente de zero numa suíte tem dois significados opostos que a saída embaralha:
*reprovou* (mediu e o alvo falhou) e *abortou* (não chegou a medir). O segundo é um gate cego: não
protege nada e não avisa que parou de proteger. Se o alvo tem estado legítimo de não agir de
propósito, o espaço de vereditos precisa de um nome para ele, senão o número pune obediência e
empurra você a "consertar" quem estava certo.

**Como checar.**

- Antes de culpar a própria mudança por uma suíte quebrada: **guarde de lado e rode de novo**. É o
  controle mais barato que existe, e vale igual para "isso começou a falhar agora".
- Leia a linha que diz **quantos casos rodaram**, não só o exit. `casos: 14 | ok: 14` é evidência;
  `ABORTADO` com exit 99 não é veredito nenhum.
- Verde local mais CI vermelho no **mesmo commit** significa suspeitar de arquivo que o teste lê e o
  git não versiona, antes de suspeitar do código.
- Separe **invariante** (roda sempre, depende só do que é versionado) de **conferência com a
  fonte** (condicional, e quando pula, **pula alto**, com o motivo na saída). Prove o conserto com
  controle positivo: renomeie a fonte, rode, veja os skips aparecerem.
- Liste os desfechos legítimos do alvo **antes** dos critérios e confira que cada um tem veredito.
  Binário só serve quando o alvo não pode se abster. O veredito de abstenção precisa de critério tão
  duro quanto o de sucesso, senão vira desculpa: no caso acima, "parou certo" exigia nomear o gate
  ou o especialista no texto final mais uma pergunta ou oferta, e parada muda continuava contando
  como falha. Cada fixture declara o desfecho esperado.
- Fixture cuja resposta certa é "não há o que fazer" não mede nada: repare a premissa ou transforme
  em caso de parada declarada.
- Quando o placar contradiz a leitura do log, o suspeito número 1 é o **medidor**.
- Falha de plataforma ("você atingiu o limite da sessão") é **inválido**, não reprovação: custou
  zero e não é defeito do alvo. Rode de novo depois do reset.
- Suíte consertada roda **inteira** antes de commitar; o conserto do arranque costuma destapar
  asserções velhas que ninguém executava. Registre no comentário do código **desde quando** estava
  cega e o que a desatou, senão a próxima sessão repete o diagnóstico.

---

## 17. Número sem o instrumento é depoimento

**Sintoma.** Um número entra em ticket, briefing ou relatório, e não há como explicar por que o de
hoje é diferente.

**Casos.**

- Um comparador fail-closed foi construído contra **7 números congelados**. Tudo verde, teste
  negativo feito, uma rodada paga de US$ 2,06. Dois cenários estouraram o limite e a causa não
  estava no alvo: **o baseline nunca teve lastro**, os 7 números tinham sido digitados à mão num
  documento de design, e a busca por logs crus daquela janela deu vazio. Pior, entre as duas
  medições o runtime se atualizou e o arquivo de configuração mudou, e como nada disso foi gravado,
  a investigação terminou sem veredito possível. A estimativa da spec era US$ 8 a 10; o real foi
  US$ 2,06.
- Uma medição do "antes" deu **3/3 = 100% com o componente intocado**. Isso não é aprovação do
  patch, é efeito-teto: com o baseline saturado o "depois" só pode empatar (não prova nada) ou
  piorar. Quem faz a coisa certa, medir antes de editar, é justamente quem descobre a saturação a
  tempo.
- Um baseline de comparação foi montado com `HEAD` em vez de hash literal, e uma sessão irmã
  commitou entre esse comando e a medição. O diff acusou **"+3 violações novas"** que eram do
  commit do vizinho; o delta real era zero regressão. Aquele commit ainda levou junto uma edição do
  working tree, então o baseline nem rodava.
- Uma sessão abriu com "eu uso em média 83 caracteres por prompt", lembrado de uma conversa
  anterior. Contado antes de desenhar qualquer coisa: média **62,8**, **mediana 33**, 76,2% abaixo
  de 80 caracteres, em **1.663** prompts (medido). O "83" não existe em lugar nenhum do disco.
- Um handoff dizia "uma linha marcada VERIFICAR" num arquivo de dados. Eram **seis** (medido), e uma
  delas escondia uma qualificação falsa. O mesmo handoff listava "3 commits sem push"; o comando no
  mesmo turno devolveu **4**.
- Um subagente foi briefado com "suíte: 42/42", copiado de um handoff. A suíte real tinha **195**
  testes. O agente conferiu e corrigiu o briefing; obedecer teria reportado uma regressão que não
  existe.
- Foi reportado um ganho de **1.483 tokens**. O real era **493** (medido). O erro: subtrair dois
  *cenários diferentes* medidos em horas diferentes, enquanto outra sessão ligava três plugins no
  meio. O cenário de controle subiu 5.846 e essa subida virou "economia". O total também escondia
  dois movimentos opostos: o componente realmente mexido caiu 645 enquanto outro cresceu 152
  sozinho.
- Cortar 7.287 caracteres de descrições de agentes rendeu **493 tokens** de boot. Provar que o
  comportamento não mudou custou **US$ 24,48** em 11 sessões headless, com veredito caso a caso,
  incluindo qual agente foi despachado (medido).
- Um medidor foi reescrito, testado e instalado, e a série dele tinha **zero linhas**: ia arbitrar
  um corte usando a série velha, que era o defeito que a reescrita veio matar. Com baseline novo
  (998 despachos, 208 redespachos), abrir os casos um a um derrubou **58%** do número, porque a
  unidade somava trabalhos diferentes na mesma sessão (medido).

**Regra.** Número que vira gate carrega, na mesma linha, o **estado do instrumento**: versão da
ferramenta, timestamp, hash das entradas fora do seu controle, nome do log cru. Número sozinho é
depoimento. A/B se faz no mesmo alvo, com o mesmo instrumento, com o resto parado, e máquina com
sessão concorrente não tem "resto parado".

**Como checar.**

- Antes de congelar: *outra pessoa, noutra máquina, consegue explicar por que o número de hoje
  difere?* Se a única resposta for "mudou alguma coisa", não congele ainda.
- Desvio no detector: **suspeite da testemunha antes do alvo**.
- Metadado **ausente** derruba o gate; metadado **divergente** só imprime motivo. Gate que fica
  vermelho toda semana por atualização automática morre de fadiga, e vermelho ignorado não é gate.
  Recongelar exige causa escrita, senão vira o jeito preguiçoso de apagar vermelho e o detector que
  se atualiza sozinho nunca detecta nada.
- Ao entregar um "antes", diga se sobrou folga para o "depois" melhorar. Se não sobrou, leve as
  opções de volta a quem decide: endurecer o caso até o antes falhar em algum cenário, aplicar o
  patch declarando que ele entra sem evidência daquele instrumento, ou não aplicar. O que não vale é
  rodar o depois "pra ver".
- Monte baseline com o **hash literal** do comando de log no mesmo turno, ponha esse hash no
  relatório e no commit, e ao suspeitar de regressão, faça diff da **lista** de violações, não do
  total: os nomes apontam de quem é o território. Falha de coleta no baseline não é estorvo a
  contornar, é sinal de que os dois lados divergiram embaixo.
- Antes de reaproveitar um baseline, liste por comando **quais casos ele contém** e compare com o
  que a rodada nova vai medir. Nome de artefato não é cobertura: um "antes" existia, tinha sha e
  custo, e media 1 caso de 9. Diretório de resultado gitignored significa que arquivar cópia
  versionada por caso é parte de medir, não faxina depois.
- Toda contagem que entra em briefing, plano ou artefato se refaz por comando **no mesmo turno**. O
  handoff diz **onde** olhar, nunca **quantos** são.
- Antes de concluir sobre qualquer série, **conte as linhas por versão**. Série vazia é resposta,
  não detalhe. Antes de propor corte ou teto, abra os casos e classifique: a tabela não distingue
  repetição de trabalho novo. Declare o viés na direção conhecida: se uma categoria conta zero, o
  número é **piso, não teto**.
- Instrumento antes do alvo: prove por diff que casos, classificador e regra de placar não mudaram
  entre os dois lados. Custa zero e derruba a rodada inteira se tiverem mudado. Placar de rodada
  paga se **regenera** dos logs já gravados, nunca se rerroda para reclassificar.
- Teto de gate de custo é pior caso somado, não previsão. Autorizar gasto até um teto e depois
  comparar o real com ele e chamar a diferença de "economia" é ilusão.
- Antes de escrever meta numérica em critério de aceite, meça a razão do vetor (chars para tokens,
  linha para ms) num caso pequeno. Um critério era fisicamente impossível: na razão medida, o texto
  inteiro em jogo não produzia a economia prometida. Critério sem física se retifica **no ticket,
  com a conta escrita**, não se maquia o número nem se marca checkbox por generosidade.
- Número de custo envelhece com o acervo que ele mediu. A mesma memória automática custava 10.735
  num dia e 7.699 no dia seguinte sem nada mudar no instrumento: o acervo tinha encolhido de 23.826
  para 16.378 bytes no meio (medido). Cite o tamanho do acervo daquele dia, ou é depoimento.
- Confira a conta: um perfil reprovou um orçamento em **42.079 contra 31.800** sem ter ganhado
  nada, porque a medição bruta somava uma carga **global** que não é do perfil (medido). O teto não
  estava errado, estava cobrando a conta errada. Decomponha o número antes de julgar o alvo, e rode
  os gates vizinhos antes de culpar o próprio diff: uma suíte estava vermelha havia dois dias por
  dois contadores literais que envelheceram sozinhos. Contador em teste sai do disco ou de um cânone
  existente, nunca de literal novo; trocar 4 por 5 só move o envelhecimento de lugar.
- Teto de tamanho nasce com duas checagens separadas: cresceu demais, e **cabe em quem lê**. Um
  orçamento permitia 204 linhas enquanto o consumidor corta em 200, então o medidor dizia "dentro do
  orçamento, folga 0" no mesmo dia em que o runtime avisava que 4 linhas foram cortadas (medido). As
  4 invisíveis eram as mais novas, e uma delas descrevia um erro cometido duas vezes naquele mesmo
  dia. A checagem de leitura reprova o arquivo **e** o teto configurado acima do limite do
  consumidor, senão o próximo recongelamento sobe o teto e o verde volta a mentir.
- Caso de teste escrito sobre o **estado real de um negócio** apodrece sozinho e passa a reprovar
  quem acerta. Numa rodada paga, dois de cinco "fracassos" eram enunciado vencido: um caminho que
  tinha mudado de lugar e uma afirmação sobre uma marca que deixara de ser verdade dias antes. A
  sessão medida recusou a premissa falsa, que é o comportamento certo, e o placar contou como
  falha. Escreva o caso sobre premissa que não envelhece (sujeito fictício declarado dentro do
  próprio prompt, caminho que o teste mesmo cria); se depender de estado real, ele carrega a data e
  a fonte, e se reconfere antes de qualquer rodada paga. E releitura não salva: um reclassificador
  relê o trace, não o enunciado, então caso reescrito fica **sem veredito válido** até nova rodada.

---

## 18. Declarado não é feito

**Sintoma.** Uma aprovação, um caminho ou uma decisão é registrada, e tudo o que vem depois trata
aquilo como fato sobre o sistema.

**Casos.**

- Um subagente fechou o passo com **"Feito. Artefato: `<caminho>`"**. O arquivo nunca foi gravado:
  busca no disco, histórico do git em todas as branches, quatro worktrees e o stash deram vazio. O
  handoff copiou o caminho e a sessão seguinte planejou implementar uma spec inexistente. Só
  sobreviveu um resumo de 10 linhas, e uma dúzia de candidatas pesquisadas com fonte e licença se
  perderam.
- Uma seção de hero redesenhada foi aprovada, ficou num diretório de rascunho e **nunca entrou na
  página publicada**. Provado em dois comandos: grep dos seletores no arquivo no ar deu 0, e o
  histórico mostrava que nenhum commit tinha tocado aquela estrutura. Três dias e várias sessões
  passaram sem notar, enquanto o dono dizia que o site "ainda não está bonito" e, na frase seguinte,
  "já aprovei mudanças que nunca foram ao ar".
- Publicar previews foi aprovado "por link, com meta tag noindex mais um header". As páginas tinham
  a meta tag; o **header nunca existiu**, a configuração não tinha nenhum bloco de headers. Metade
  da proteção era imaginária, e só apareceu porque uma revisão de compliance foi ler a configuração
  em vez da decisão. Na mesma leva, um prazo de expiração de 30 dias existia como decisão e **sem
  mecanismo nenhum** que o executasse, que é exatamente a forma de um incidente anterior em que um
  preview ficou 44 dias no ar.
- Uma spec inteira foi escrita sobre a premissa de que uma capacidade não existia em lugar nenhum
  da organização. Uma auditoria de ~63KB de código derrubou metade dela em um turno: quatro funções
  serverless cobrindo exatamente aquele escopo **já existiam e estavam em produção**, commitadas
  cinco semanas antes, com compliance e trava de ensaio embutidos. Tickets estavam prestes a ser
  publicados mandando construir o que já estava construído.
- Dois tickets abertos em sequência tinham enunciado velho e a entrega já em disco. Estavam abertos
  porque ninguém fechou, não porque faltava trabalho. Em outra sessão, duas issues ficaram abertas
  por horas depois de consertadas, commitadas e empurradas; só apareceu porque as abertas foram
  contadas por comando no fechamento.
- Pedido que chega de fora traz premissa sobre o seu repositório, e ela se confere igual. Um painel
  construído em outra ferramenta foi descrito como "não conectado a CRM, planilha nem API externa"
  (dito). Verdade sobre o painel, falso sobre o alvo: o alvo já rodava o CRM com contrato
  versionado, gate no CI e **duas issues abertas sobre painel, uma delas decidindo contra interface
  nova** (medido). O briefing ainda trazia um modelo de dados pronto, cânone paralelo sobre o mesmo
  funil.

**Regra.** Aprovação, decisão e integração são estados diferentes. Retorno de subagente é
afirmação, não fato do disco. Plano ou spec que descreve "o que falta" começa por um inventário do
que existe, feito por comando, no mesmo turno: isso é o gate, não o passo "explorar o repo se der
tempo".

**Como checar.**

- Antes de escrever "Artefato: `<caminho>`" em qualquer lugar, liste aquele caminho no mesmo turno.
  Sem o tamanho do arquivo na linha, o item é "declarado, não verificado". O dano não para no passo:
  um caminho falso no handoff redireciona o plano da sessão inteira seguinte.
- Design aprovado só está fechado quando o grep do seletor acha o código no arquivo **publicado**,
  não no deck, não no rascunho, não no handoff. Retomar uma frente de design começa por essa
  medição, antes de qualquer plano.
- Antes de contar qualquer proteção, gate ou header como ativo, abra o arquivo que o implementa e
  veja a linha. Proteção com prazo precisa de dono e de mecanismo, não de data escrita em documento.
  Checklist pré-deploy **prova** cada proteção (header servido, gate rodando), nunca confere que ela
  foi escrita.
- O sintoma de violar a regra do inventário é escrever a palavra "zero" sobre capacidade própria sem
  ter rodado nada. Inventário de subagente vira fato quando você abre os arquivos e bate no endpoint.
- Grilling e aprovação do usuário não validam premissa factual. Rigor sobre o raciocínio não
  substitui evidência sobre o mundo. Sintoma parente: escrever "aprovado" sobre item que só você
  redigiu, porque o usuário respondeu 3 de 9 perguntas e você preencheu o resto.
- Spec derrubada se **marca**, não se apaga: aviso no topo com o motivo e a evidência, para o
  trabalho bom sobreviver à premissa ruim.
- "Já existe?" vale para código, tabela, ferramenta e perfil de terceiro. Ferramenta existente com
  regra errada é mais perigosa que ferramenta ausente, porque não dá sintoma: uma heurística de
  pontuação classificava *a favor* dos registros que a frente existia para excluir.
- Artefato hospedado em plataforma de terceiro atrás de login não é insumo até virar arquivo no
  repositório. Uma dessas páginas devolvia HTTP 401 a qualquer agente (medido), o que tornava
  "preserve o layout atual" inexecutável, não difícil.

---

## 19. Fato de segunda mão, e fonte que venceu

**Sintoma.** Uma frase chega bem escrita, com ressalva educada ou citação, e se propaga.

**Casos.**

- Uma sessão escreveu, por inferência, que o minuto exato de uma deleção sairia do log de auditoria
  de uma plataforma. Uma sessão irmã pegou a frase, pôs uma ressalva educada e mandou para dentro de
  um **parecer jurídico**, também sem rodar o comando. O comando existia e derrubou a frase em 30
  segundos: aquele log não registra deleção de deploy (2 páginas de 100 eventos, ordem decrescente,
  zero no dia em questão, sem truncamento, e os 26 tipos auditados não incluem esse) (medido).
- Uma lista produzida por outra IA foi trazida para uso. O que ela **copiou** se sustentou: telefone
  e endereço batiam com o diretório **3/3**. O que ela **sintetizou para preencher coluna** não: a
  coluna em que a frente inteira se apoiava era falsa **2/2**; ids de grupo errados 3/3 com os
  nomes certos; e "34 telefones verificados" tinha 8 linhas com placeholder no campo, checável no
  próprio arquivo (medido).
- Grep confirmou que um artigo existia no texto da lei, e um documento interno o citou por **20 dias**.
  O dispositivo estava **revogado havia seis anos**, marcado no texto consolidado por reticências e
  nota de rodapé nomeando a lei revogadora. A matéria tinha migrado para outra lei **mudando o
  termo**, então buscar o termo antigo na norma nova não acha nada e engana nas duas direções.
- Um levantamento de capacidades de um produto de terceiro foi escrito seis semanas depois de o
  produto ter sido **renomeado**, sob o nome antigo, sem que nada acusasse. Buscar pelo nome velho
  não falha: devolve material abundante e coerente descrevendo telas, limites e planos que podem não
  existir mais. O erro é silencioso, o documento fica pronto, com fonte, retratando o produto errado.

**Regra.** Mensagem de sessão irmã, de handoff ou de outro agente é hipótese, exatamente como
retorno de subagente. Ressalva não é medição: vir bem escrito e com ressalva é justamente o que faz
passar. Presença no corpus não é vigência: fonte que responde não é fonte vigente.

**Como checar.**

- Antes de propagar para parecer, registro de decisão, briefing ou artefato entregue, rode o comando
  que checaria, e se não existir comando, diga que não existe. "A plataforma não loga, logo não havia
  como" é álibi, não defesa: escolher plano sem trilha de auditoria é decisão de quem controla. O
  enquadramento honesto tem três camadas: registro próprio como prova primária, ausência de trilha
  independente como **limitação declarada**, e a trilha faltante como dívida em medida futura.
- Em material de outra IA: aproveite o raciocínio, descarte o dado. Recalcule as contagens no
  arquivo, confira identificadores, e nunca aceite a coluna que **motiva a ação** sem verificação
  própria. A fabricação se concentra exatamente onde o campo é obrigatório e verificar custa uma
  consulta por linha, que é justamente a coluna que sai na primeira frase do contato com o cliente.
- Antes de citar artigo que sustenta operação, leia a nota de rodapé daquele artigo; havendo lei
  alteradora, abra e veja o que ela fez. Referência órfã dentro da própria lei já é confirmação de
  revogação parcial. Vale para norma técnica, termo de plataforma e política.
- Antes de levantar capacidades de produto de terceiro, confirme o **nome corrente** na documentação
  do próprio fornecedor, não no primeiro resultado de busca. Nome mudou, refaça a busca e registre a
  mudança onde o próximo passo vai ler, em vez de reescrever o trabalho já feito.
- Escopo também é afirmação que se remede. Um parecer de incidente foi escrito sobre **um** commit
  de remoção e ficou 22 dias com metade do incidente: havia um segundo quatro horas depois no mesmo
  dia, e o escopo real era o dobro do que o parecer afirmava. Na mesma frente, 9 de 9
  enunciados de ticket erraram o escopo, e sempre para menos. Varra a fonte inteira, não o primeiro
  hit; quando a premissa herdada cai, a errata vai **datada ao lado** do texto original, porque
  documento de incidente reescrito por cima perde valor probatório.
- Vale igual para o que os seus próprios agentes reescrevem. Um claim falso numa página voltou para
  correção com a evidência na mão; o agente corrigiu e inventou um claim falso **novo** no lugar, e a
  invenção já tinha vazado para mais três pontos do documento. Quem reescreve tem incentivo a
  preservar a força do texto original, e o jeito barato de preservar força é inventar de novo. O
  retorno do agente descreve o que ele acha que escreveu, não o que escreveu. Reconfira o claim
  reescrito **na fonte**, e varra o documento inteiro com grep pelo vocabulário do claim.
- Claim falso também mora em **arquivo órfão**. Um script carregava quatro casos de cliente
  fabricados e três métricas fabricadas, e nenhuma página o carregava desde que os scripts saíram do
  markup, mas a lista branca do build publica diretórios inteiros, então o arquivo respondia 200 em
  produção. "Nenhuma página carrega" responde se o usuário **vê**, não se o servidor **serve**.
  Varredura de claim roda sobre o diretório **construído**, incluindo scripts, dados e imagens, não
  só as páginas linkadas.
- Recomende pelo eixo em que você vai ser cobrado. Um modelo foi recomendado como alternativa mais
  barata citando preço por milhão de tokens e throughput; abrindo o model card depois, a acurácia
  dele estava **abaixo da geração anterior** nos benchmarks que importavam. Blog de lançamento,
  página de preço e catálogo de gateway falam de throughput e latência. Nada disso é acurácia. A falácia inversa é idêntica: "é
  mais novo, logo é mais capaz".

---

## 20. Suspeite do seu próprio instrumento primeiro

**Sintoma.** O alvo está instável, o modelo está burro, a API está fora, e o que mudou foi o seu
aparelho.

**Casos.**

- Meia sessão foi gasta perseguindo "o app está instável": cliques em timeout, conexão recusada, o
  dev server morrendo sozinho. O app estava bom. O perfil de automação de browser tinha sido criado
  **dentro do repositório**, o watcher do bundler tentava observar os arquivos temporários que o
  navegador escreve ali, e o dev server caía com erro de recurso ocupado.
- Um subagente de QA serviu um diretório de build com um servidor HTTP local e o processo
  **sobreviveu ao subagente**. Duas horas depois, apagar aquele diretório no rebuild falhou com
  "recurso ocupado", e a primeira leitura foi "o build quebrou".
- Um guard de segurança bloqueou a gravação do próprio handoff que descrevia um bloqueio, porque o
  texto **citava** o comando arriscado literalmente. O conserto óbvio abriria um buraco próprio,
  então o falso positivo ficou. Guard que obriga a contorná-lo para registrar o
  trabalho ensina a desligá-lo; falso positivo em ferramenta de segurança não é incômodo estético, é
  o caminho pelo qual ela morre.
- A pior forma: o instrumento **executou a ação real**. Uma função administrativa foi chamada
  esperando o ensaio que três documentos prometiam ("dry-run desde sempre"). Voltou `"mode": "LIVE"`,
  a flag estava ligada no host, e a função **executou a ação externa real e irreversível**. Nada
  chegou ao mundo lá fora, e só porque a cota de um provedor a montante tinha acabado: acaso, não
  trava. A mesma resposta ainda devolveu URLs assinadas no corpo, e link assinado é credencial de
  portador, não linha de log.
- Cinco achados numa sessão de infraestrutura se dissolveram na verificação, todos com a mesma
  forma, um teste correto no caso geral aplicado sem o contexto que o invalida: um grep por retorno
  de carro casava com a **letra r** (em binário: zero CR); "16 arquivos expostos" era um catch-all
  devolvendo a home com status 200 para qualquer caminho; um grep de "não removido" casava com **o
  comentário que o agente tinha acabado de escrever**; uma fonte acusada de genérica era o token de
  marca do próprio projeto; e "o site não publicou" saiu de comparar checksum de uma resposta
  **minificada** com o build cru. Normalizando espaço, os checksums batiam. O quinto aconteceu
  **depois** de o padrão já ter sido nomeado, o que mostra que reconhecer o viés não basta: é preciso
  mudar o teste.
- Um laudo de "é artefato do ambiente" absolveu o código: um erro de recurso bloqueado foi atribuído
  a HTTP local. Um cliente HTTP simples mostrou **404, HTML, 1.583 bytes**, e um id de container
  inventado de propósito devolveu **1.582** (medido). O container nunca existiu.
- Um rótulo foi medido em quatro cidades e mostrou sempre a mesma transformação, então concluiu-se
  "o elemento não está ancorado em coordenadas" e dois briefings foram despachados para consertar um
  defeito que não existia. O valor constante era o centro exato do viewport, e como a câmera aponta
  para a própria cidade rotulada, a projeção **correta** é o centro. O controle que não foi rodado:
  mover a câmera. Deslocada de um grau, o rótulo se moveu, e voltou.
- Duas sessões acusaram um subsistema de vazar chamadas para uma conta paga porque o log de um
  gateway mostrava determinado prefixo de provedor. Virou diagnóstico, comentário no código e plano
  de conserto. O controle que faltava: uma chamada explícita pelo caminho **legítimo** foi registrada
  com a **mesma** string. O gateway normaliza o prefixo; naquele log a chamada legítima e a suspeita
  são indistinguíveis, e o conserto planejado não tinha o que consertar. Corolário medido no mesmo
  dia: variável de ambiente que aparece no binário não é variável que pega. A prova é o log depois da
  execução, nunca o grep.
- Um agente de terceiro respondeu "NÃO CONSIGO VER IMAGEM" e a frente quase foi fechada como "aquele
  CLI é cego". Era portão de permissão: sem regra correspondente, o modo headless nega a leitura de
  arquivo automaticamente e o modelo responde com o que sobrou. Com a permissão, ele leu imagem e
  vídeo.
- Um timeout de failover de 90s matou a única rota viva, que levava ~90s por chamada: o log mostrava
  200, 200 e depois um **abort do cliente**. A leitura tinha sido "essa rota oscila", escrita num
  handoff. A oscilação existe; aquela rodada específica era o nosso próprio patch.

**Regra.** Antes de acusar o alvo (app instável, modelo burro, API fora, fornecedor instável), prove
que o instrumento não é a causa. Instrumento é o script de medição, o perfil de browser, o proxy, o
cache, o dev server subido de um jeito diferente. Se o alarme for surpreendente, o teste é o primeiro
suspeito, não o sistema.

**Como checar.**

- Pergunte: *o que eu mudei no aparelho antes de o alvo "quebrar"?*
- Saia do instrumento: erro visto no browser se remede com um cliente HTTP simples. Sumiu fora do
  browser, era ambiente; persistiu, é o recurso.
- Use um **controle inválido de propósito**: id, URL ou chave inventada. Se o recurso real responde
  igual ao falso, o recurso real não existe.
- **Valor constante não prova ausência de vínculo**, prova que a entrada não variou. Varie a entrada
  de propósito e veja se a saída acompanha. Vale para coordenada, cache, seed, timestamp e qualquer
  "está sempre igual, logo está quebrado".
- Antes de culpar um componente pelo log de um intermediário, faça **uma chamada de controle com o
  valor que você considera legítimo** e compare como as duas aparecem. Iguais, o campo não separa
  nada: pare o diagnóstico ali. E o corte que funciona costuma não passar pelo log, e sim por
  credencial separada com allowlist, que falha alto independente de quem chamou.
- Separar incapacidade declarada de portão tem uma pergunta: **a chamada devolveu algo?** Devolveu,
  acredite na recusa; não devolveu, suspeite do portão. E capacidade não se mede em bloco: "lê vídeo"
  são três eixos (imagem parada, movimento, áudio), e cobaia sintética só prova que o container é
  aceito. Confira o gabarito da cobaia antes de fazer a pergunta.
- Antes de acusar fornecedor externo de instabilidade, faça grep no log pelo **seu próprio** abort.
  Teto de relógio não distingue "não respondeu" de "está lento": os dois chegam como "ainda
  rodando". Todo timeout de failover precisa responder "que sinal me diz que esta tentativa está
  progredindo?" (status por chamada, bytes, heartbeat). Calibre o teto contra o caso que **passa**,
  nunca contra o que falha, e desconfie de teto derivado de divisão de orçamento pelo número de
  candidatos: adicionar fallback encolhe cada tentativa, o inverso da intenção.
- Sintoma repetido duas vezes no mesmo lugar: pare de empilhar tentativa e isole a camada (disco,
  servidor, rede, browser).
- Antes de chamar função com efeito externo (enviar, cobrar, publicar, apagar), meça o modo real por
  um caminho que **não seja a própria ação**. Modo de operação é estado do host, não fato do
  repositório: três arquivos afirmavam o ensaio e o host dizia outra coisa. Nome de campo na resposta
  ("enviaria ao vivo") não é garantia de runtime, e instrumento que percorre o mesmo caminho de
  código da ação real **é** a ação real, com sorte diferente.
- Subagente que sobe servidor deixa órfão. Antes de culpar build ou deploy travado, liste quem
  segura o caminho, pela linha de comando e não só pelo id do processo, e nunca suba servidor com
  diretório de trabalho dentro do que o build apaga.
- Teste e documentação de guard escrevem o texto arriscado em **arquivo**, nunca inline no comando
  que o shell vê.
- **Enquanto a mensagem de erro muda a cada conserto, o diagnóstico não acabou**: são defeitos
  empilhados, e o primeiro mascara os seguintes. Só sintoma idêntico repetido indica causa única. Um
  boot quebrado passou por config inválida, migração de estado travada e plugin fantasma exigindo
  consentimento: três causas distintas em três pontos (medido). Cada rodada de conserto termina com
  execução real do alvo e leitura do erro **novo**, não com a ausência do anterior. Quando o serviço
  morre sem dizer por quê, porque um restart agendado engole a causa e sobra só timeout, suba o
  processo em primeiro plano capturando as duas saídas: o erro real aparece em segundos em vez de
  minutos de espera cega (inferido).
- O terminal mente sobre o dado. Num console com página de código legada, UTF-8 correto sai como
  glifo de substituição, e um agente declarou "o nome está corrompido no código" olhando glifo. O log
  do servidor imprimiu o acento certo e inverteu o diagnóstico: o código estava certo e o **banco**
  estava corrompido. Compare **code points**, nunca glifo renderizado.
- Em bug de função publicada, o **primeiro** recurso é o log da execução, antes de grep, leitura de
  schema ou comparação de code points. Um agente gastou meia sessão inferindo um bug de nome de campo
  que uma linha de log nomeava de uma vez. E a janela do log é stream, não histórico longo: dispare o
  evento e leia em seguida.

---

## 21. Rode o comando que responde *aquela* pergunta

**Sintoma.** Um comando vizinho plausível responde algo adjacente, e o alarme sai mesmo assim.

**Casos.** Três alarmes errados numa sessão, todos com a mesma forma:

- "O crash atinge 4 páginas", medido por grep do **markup** do componente afetado. A pergunta certa
  era quem **carrega o script**: **1 página** (medido). Um subagente corrigiu.
- Uma falha de contraste reportada em **1,14:1** foi medida contra o fundo do body. Medida contra o
  fundo **efetivo**, o ancestral que realmente pinta, o mesmo elemento dava **8,61:1** (medido).
  Defeito inventado pelo instrumento, no mesmo dia em que um defeito de contraste real foi
  consertado.
- "Uma worktree tem 2 commits perdidos", lido de uma listagem de worktrees. A pergunta certa era
  quais branches contêm o sha: estavam no branch principal desde um merge.

A mesma falha valeu para **gravidade**: uma mensagem de teste chegou com a copy de outro registro,
e o agente anunciou que a fatia de envio seguinte poria o texto trocado diante de 12 leitores reais,
e uma decisão foi tomada com base nisso. Errado. A condição real escolhe o texto por "este registro
tem entrada?", e os 12 têm. Só quem está **fora** das entradas herda texto alheio, que era
exatamente o registro de
teste. O defeito existia, era fail-open de verdade, e foi consertado. O raio foi inventado, a partir
do sintoma e do **comentário** do código, que descrevia o comportamento antigo, em vez da condição
três linhas abaixo.

Em separado: encadear a conferência com a ação anula a conferência. `git log <intervalo> && git push`
põe a saída diante dos seus olhos **depois** do fato. Em repositório com sessões concorrentes o lote é
estado perecível; esse encadeamento empurrou o commit de uma sessão irmã para uma branch de deploy ao
vivo, o que uma regra explícita proibia.

**Regra.** Antes de escrever "isso afeta N páginas" ou "isso está perdido", escreva a pergunta em uma
frase e pergunte que comando a responde **sozinho**. Gravidade é afirmação de fato e exige a mesma
prova que o defeito. Gate humano roda em turno **próprio**, e você lê o resultado antes de emitir a
ação.

**Como checar.**

- Presença de markup não responde "quem executa". Listagem de worktree não responde "está mergeado".
  Intervalo de commits não responde "de quem é o commit". Comentário é a última fonte a confiar:
  leia a condição.
- Um caso que reproduz o defeito não mede a **população** atingida. São duas perguntas separadas, e a
  segunda quase sempre é uma contagem barata que você pulou por pressa.
- Nunca encadeie verificação e ação quando a ação é irreversível ou publica. Se tiver que ser um
  comando só, a verificação precisa **abortar sozinha**, não apenas imprimir.
- Afirmar que algo está **pendente** exige a mesma prova que afirmar que algo está quebrado. Um agente
  reportou uma exceção como "aguardando OK" quando ela estava aplicada havia três dias, com motivo
  registrado e versionado, porque tratou a lembrança da sessão como estado do sistema.
- Propagação tem latência. Um teste que falha no mesmo turno da criação de um arquivo não prova que é
  preciso reiniciar; espere um turno e teste de novo antes de afirmar exigência de boot.
- Antes de instalar ou copiar qualquer coisa, cheque a configuração. "Não está instalado" é afirmação
  de ausência, e a lista de capacidades anunciada no início do turno pode ser **delta**, não
  inventário completo: um agente quase criou cópia divergente de dois arquivos que um pacote já
  atualizava.
- Alarme errado custa duas vezes: manda quem decide olhar para o lugar errado e ainda despacha agente
  para consertar o que não está quebrado. Ele some na hora em que alguém roda o comando certo, então o
  custo cai na sua credibilidade.
- Leia o status do CI **por branch**. Listagem de corridas sem filtro mistura branches, e os vermelhos
  do seu próprio teste negativo aparecem como se fossem produção.

---

## 22. Pergunte o que é sucesso antes de otimizar

**Sintoma.** Números corretos, produzidos por três sessões, respondendo uma pergunta que ninguém fez.

**Casos.**

- Uma frente de custo de contexto passou **3 sessões** medindo token de entrada (baseline, proxies de
  compressão, poda de plugin) e produziu números corretos. Na quarta, o dono disse que a régua nunca
  tinha sido dinheiro: era **qualidade de seleção**. O sintoma que deveria ter sido lido antes: as
  duas variáveis apontavam para direções opostas no mesmo alvo, onde o componente mais caro (8.274
  tokens) era também o maior acervo de capacidade instalado. Quando otimizar uma métrica destrói de
  forma óbvia outra coisa que o dono valoriza, a métrica está incompleta: não é hora de medir com mais
  precisão, é hora de perguntar.
- Um instrumento media retrabalho, custo e domínio, mas não se a tarefa usava um connector de dado,
  qual era o alvo real, nem se o resultado era verificável sem julgamento humano. O buraco só apareceu
  quando alguém tentou **decidir algo novo** com o instrumento que já existia. Nenhum log alarmou que
  faltavam campos.
- Dez critérios de aceite foram escritos para um pedido de "dar mais vida à home": tolerância de
  amplitude, orçamento de animação, métrica de carga, contraste, movimento reduzido, altura do
  documento. A implementação passou **10 de 10**, o QA liberou, publicou-se, e a primeira reação do
  dono foi **"você mudou alguma coisa?"**. O efeito líquido do trabalho foi **menos** movimento: uma
  onda de parallax nova contra a remoção de animações de entrada em 19 elementos e a queda pela metade
  do deslocamento em outros 12. Tecnicamente correto (havia mesmo dois sistemas de animação brigando)
  e o oposto do que foi pedido. Nenhum dos 10 critérios era capaz de detectar isso, porque nenhum media
  o que o olho vê.
- Um critério numérico dizia "posição de scroll inalterada (delta < 2px)" ao filtrar. Foi reportado
  como passou, medido com a página no topo da seção. Medido onde o usuário realmente está quando clica
  (rolado até o controle, porque é preciso vê-lo para clicar), o mesmo critério falha: **+47px numa
  largura, -140px noutra** (medido), variando entre execuções.
- Vinte sessões, 60 commits, 8 blocos de spec fechados com número medido em cada critério, QA
  aprovado, deploy verificado no ar. O veredito do dono ao ver a página: *você só replicou o que
  existia, e o que existia não funcionava*. **Nenhuma medição estava errada.** O enquadramento estava:
  toda pergunta da frente era "esta seção atende o critério §N?", nunca "esta seção deveria existir
  assim?". Quatro vezes, quando a página não atendia, a saída registrada foi **emendar o critério**,
  cada emenda com argumento técnico bom, e somadas são o mecanismo pelo qual a régua se ajusta ao que
  já existe e um redesign vira repaginação. Dois sintomas: o menu nunca entrou em spec nenhuma, só foi
  herdado; e as fotos ruins estavam documentadas e fecharam com emenda de documento, por não haver
  substituta no repositório.
- Uma ferramenta mostrava **27 execuções em 22 dias, todas com cobaia sintética**. A leitura fácil era
  falta de demanda. Era falta de **ligação**: a cópia servida do roteador não a listava; a fonte
  listava. Grep na fonte dizia "ligado", grep nas cópias servidas dizia zero.

**Regra.** Número certo na pergunta errada custa mais que número nenhum, porque parece progresso e
vira base de decisão. Uso zero mede a sua seleção e a ligação, nunca qualidade e nunca demanda.
Pedido perceptivo exige critério de aceite perceptivo. Critério numérico sem **condição de medida**
escrita não é critério: quem implementa escolhe a condição, e escolhe a mais cômoda, que é a que
passa.

**Como checar.**

- Frente que dura mais de uma sessão começa declarando a função-objetivo em uma linha, e o que é
  objetivo contra o que é só restrição ("objetivo = taxa de adesão; restrição = boot sob o teto").
  Herdou handoff sem essa linha? Pergunte antes de despachar a primeira medição.
- Antes de usar um instrumento existente para decidir algo novo, escreva a pergunta-alvo primeiro e
  cheque campo a campo se o instrumento capta o que a decisão exige. Instrumento que não capta o campo
  decisivo não decide nada: ele participa como evidência parcial, e isso tem que ser dito no
  relatório, não escondido atrás de um número que responde outra pergunta.
- Em pedido perceptivo, o critério de aceite abre com um lado a lado que o dono olha. Número técnico
  entra como guarda-corpo (não regredir carga, não quebrar acessibilidade), nunca como prova de que o
  pedido foi atendido. Diff pequeno em pedido perceptivo é alarme. E quando o diagnóstico técnico
  (coerência, sistema, dívida) diverge do pedido literal, **diga isso antes de executar**, em vez de
  entregar coerência no lugar do que foi pedido.
- Escreva a condição junto com o número ("com a página rolada até o elemento clicado, nas duas
  larguras"), e prefira sempre a condição de **uso** à condição de **teste**. Evidência produzida por
  quem executou carrega o mesmo viés da posição de medida: num caso, seis screenshots foram entregues
  como evidência e todos eram recortes de ~40px da barra de controles, nenhum mostrando a lista
  filtrada, que era o objeto da mudança. Abrir o artefato e olhar continua sendo trabalho de quem
  despacha.
- Fique atento ao padrão de enquadramento: o critério muda para descrever o que está lá; o item fecha
  sem que a tela mude; o que melhorou é invisível para quem visita; nenhuma pergunta da frente é sobre
  o que a página precisa **fazer**. Achou o padrão, pare de medir e traga a pergunta de trás: quem
  chega, o que procura, qual é o caminho até o objetivo.
- Julgue ferramenta por natureza e gatilho, não por uso. Doutrina se julga por adesão medida, e ali
  uso zero **é** defeito; referência se julga por responder quando consultada, e ali uso zero é
  normal; execução se julga por fronteira declarada, e ali uso zero é suspeita, não veredito. Comparar
  uma natureza com outra pelo mesmo número é erro de categoria. Uso zero abre investigação de ligação,
  nunca fecha frente, e a conferência roda na **cópia servida**, porque fonte prova intenção e cache
  prova comportamento.
- Desinstale só com redundância provada por hash ou bytes: mesma situação, mesmo gatilho, nenhuma
  diferença de conteúdo. Nome parecido não prova nada.
- Antes de propor que alguém mude um hábito, **meça de quem é o defeito**. Minerar ~600 transcripts e
  classificar 25 casos reais deu: 9 de ir longe demais sem confirmar escopo, 7 de faltar estado que só
  o humano sabia, 3 de declarar pronto sem verificar (medido). As categorias que um prompt mais longo
  resolveria somavam no máximo 8 de 25, enquanto um regime único cobraria imposto em 74% de prompts
  curtos que já funcionam e seria abandonado numa semana. A divisão que sobreviveu ao escrutínio: o
  sistema cobre tudo que é recuperável do disco; o humano só responde o que é irrecuperável (intenção,
  restrição de negócio, quem é o cliente, o que não pode mudar).
- Trava ou heurística nova se dimensiona medindo a **população antes de desenhar a regra**. Um filtro
  de aparência óbvia, medido contra a fila real, derrubaria **10 dos 13** aprovados para fechar um furo
  com **zero** ocorrências (medido). Regra sem denominador é chute com cara de rigor.
- Doutrina já escrita e já violada não se resolve reescrevendo doutrina. Uma regra estava no arquivo de
  memória e falhou três vezes com a mesma queixa do usuário; o conserto é trava no caminho de execução,
  não mais uma frase.
- Antes de propor processo novo, leia a decisão que talvez já esteja no CI. Uma recomendação de
  proteção de branch já estava registrada como impossível no plano atual **num comentário de workflow
  16 dias antes**, e o mesmo repositório já tinha três jobs de gates por afirmação positiva, mais
  rigorosos que o que estava sendo proposto. E processo sem dor nomeada é cerimônia: a pergunta que
  colapsou a proposta foi *qual falha concreta isso teria evitado?*, resposta, nenhuma. "Não me lembro
  de nenhuma" é resposta válida e encerra a proposta.
- Existe um gate que ninguém escreve: **o leitor entende esta palavra?** Uma leva de mensagens de
  saída foi construída sobre um achado técnico de cada leitor. Passaram na revisão de idioma nativo,
  num QA de 7 itens e num gate de compliance. O dono barrou o disparo na leitura: muito técnico, as
  pessoas não vão entender aqueles termos. Nenhum gate media a compreensão do leitor. Achado técnico é
  **insumo** da pesquisa, nunca o texto; se o termo técnico sobrevive na frase final, a tradução para
  consequência de negócio não foi feita.

---

## A versão curta

Se sobrar uma linha de cada: zero é o único resultado que instrumento quebrado e mundo vazio produzem
igual; o zero que confirma você é o que precisa de auditoria; controle positivo prova que o instrumento
acha alguma coisa, não que acha a classe que falha; exit code mede término; smoke mede resposta, não
trabalho; um sinal só prova execução se não pudesse existir sem ela; detector que nunca acusou nada não
é evidência de saúde; teste negativo tem que falhar pelo motivo que você afirma, e remover a guarda é
mais barato que injetar defeito; meça efeito, não declaração; a régua não mora dentro do sistema
medido; contagem de detector não é fila; fixture herda a patologia do acervo; o processo carrega a
cópia instalada; suíte verde não prova que o gate roda; gate é afirmação positiva; exit diferente de
zero significa "reprovou" ou "nunca mediu", e a saída embaralha os dois; número sem instrumento é
depoimento; declarado não é feito; fato de segunda mão é hipótese; suspeite do seu instrumento antes do
alvo; rode o comando que responde *aquela* pergunta; e pergunte o que é sucesso antes de otimizar
qualquer coisa.
