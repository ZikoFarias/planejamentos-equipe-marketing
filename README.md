# Planejamentos — Equipe Marketing

Aplicativo web de planejamento com visualização exclusivamente Kanban. A primeira versão é independente do ClickUp e começa sem tarefas. Os registros da prévia local são testes explicitamente identificados e nunca são enviados ao banco de produção.

## O que está implementado

- As 15 etapas do briefing, na ordem e cores exatas; cabeçalhos com texto escuro e indicadores coloridos.
- Criação, edição, duplicação, exclusão com confirmação, movimentação e reordenação. Arraste pela alça no canto do cartão; use os seletores de status e as setas para operar por teclado ou celular.
- Busca e filtros cumulativos por responsável, etiqueta, prioridade e prazo (hoje, atrasadas, sem prazo).
- Responsáveis e etiquetas múltiplos, descrição com **negrito** e _itálico_, datas de início/entrega, checklist, subtarefas, comentários e histórico por tarefa.
- Anexos por upload (até 10 MB por arquivo) e links. Downloads protegidos por autenticação e cadastro de membro.
- Banco Cloudflare D1 e arquivos em R2. Preferências de colunas recolhidas e ocultação de vazias ficam apenas no navegador.
- Login com ChatGPT na hospedagem Sites; autorização no servidor para administrador, editor e visualizador. Interface de acessos para administrador, sem envio de convites.
- Bloqueio de alterações simultâneas por revisão do quadro; nenhuma atualização otimista destrutiva. Em caso de conflito, o painel conserva o rascunho. Use “Recarregar quadro”, confira sua edição e salve novamente.
- Estados de carregamento, ausência de tarefas, confirmação e erro. Painel modal com foco contido, Escape e confirmação ao descartar edições.
- Layout de computador, tablet e celular com rolagem horizontal restrita ao Kanban.

## Executar localmente

Requisitos: Node.js 22.13 ou superior e npm. Na pasta do projeto:

```powershell
npm run install:ci
npm run build
$env:CLOUDFLARE_CF_FETCH_ENABLED='false'
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_needy_giant_man.sql
npm run dev
```

Aplique a migração apenas em um banco local novo. Para futuras mudanças de esquema, gere novas migrações com `npm run db:generate` e aplique somente as pendentes. Não reaplique o SQL já executado.

Abra o endereço local impresso (normalmente http://127.0.0.1:5173) e escolha “Entrar com ChatGPT”. Apenas em desenvolvimento local, o starter simula a identidade `seedy@sites.test`. Essa simulação não entra no build de produção. O banco local persiste em `.wrangler/state`; o banco hospedado é separado.

O primeiro usuário autenticado que acessar um banco novo se torna administrador. Na publicação inicial privada, esse usuário deve ser o proprietário. Faça o primeiro acesso antes de compartilhar. Usuários posteriores só acessam o quadro se cadastrados pelo administrador.

## Publicar com Sites

A identidade do projeto já está em `.openai/hosting.json`. Preserve `project_id`, `d1: "DB"` e `r2: "BUCKET"`. Não crie outro projeto para atualizar esta aplicação.

1. Instale dependências e execute a verificação de tipos: `node node_modules/typescript/bin/tsc --noEmit`.
2. Execute o build pelo helper `scripts/build-site.mjs` do plugin Sites.
3. Use o helper `scripts/site-workflow.mjs` do plugin Sites para sincronizar o código e empacotar `dist`. Credenciais de origem são temporárias e entram somente por stdin; não as coloque em arquivos, argumentos ou commits.
4. Publique a versão com `save_version_and_deploy_private`, passando o projeto, o commit sincronizado e o arquivo empacotado. Sites provisiona D1/R2 e aplica as migrações.
5. Confirme o resultado terminal da publicação e abra o URL retornado.

Hospedagem inicial: privada, somente proprietário. Para uso pela equipe, configure o compartilhamento permitido no Sites e cadastre os e-mails em **Acessos** com os perfis desejados. As duas camadas são necessárias: liberação na hospedagem e permissão no aplicativo. Esta entrega não amplia automaticamente a audiência do site.

## ClickUp

Referência organizacional: EQUIPE MARKETING / GERENCIAMENTO / lista `901713788976`. Não há importação, sincronização ou escrita no ClickUp nesta versão. Não existem tokens do ClickUp no projeto. Nenhuma tarefa real foi inventada ou importada. O campo de URL original está preparado para dados que venham de uma futura importação validada.

Uma futura integração precisa ser no servidor, com segredo em variável de ambiente, paginação completa, identificação por ID original, deduplicação e data da última sincronização. Não habilitar escrita no ClickUp sem configuração explícita.

## Verificação

Os detalhes da verificação estão em `VERIFICACAO.md`. `tests/api.mjs` usa exclusivamente a prévia local e valida o perfil indicado no argumento. `tests/files.mjs` testa arquivos fictícios no armazenamento local. Não execute esses testes contra produção.

## Limites desta versão

- Não há sincronização em tempo real: use **Atualizar** para buscar mudanças de colegas. Conflitos são detectados no salvamento.
- O histórico registra eventos por tarefa; exclusão remove a tarefa e seu histórico da interface. Não é um log de auditoria imutável.
- Remover um anexo da tarefa retira a associação; o objeto enviado continua no armazenamento. Cancelar uma edição após enviar arquivo também pode deixar um objeto sem vínculo. Para controle de retenção/custos, uma limpeza periódica de objetos órfãos ainda precisa ser implementada.
- A formatação da descrição aceita negrito, itálico e quebras de linha; não inclui editor visual completo.

## Áreas individuais e operação da equipe

As 15 etapas originais foram mantidas, sem criar “concluídos” adicional: **aprovado ✅** = arte pronta; **concluidos e postados** = publicação realizada.

- **Luiz:** a fazer luiz, em andamento luiz, ideias, aprovação postos, aprovação ervateira e aprovação luke group.
- **Farias:** a fazer farias, em andamento farias, aprovação fibroplast, aprovação materiais e aprovação concreto.
- **Etapas compartilhadas:** ajustar, aprovado, stand-by e concluidos e postados. Luiz/Farias só recebem as tarefas atribuídas a eles. Uma tarefa atribuída aos dois aparece para ambos.
- **Mateus e Lucio:** fila compartilhada de lançamentos e aprovações, com os dois “a fazer”, as seis aprovações e as quatro etapas compartilhadas. Podem lançar demandas para Luiz/Farias, aprovar, pedir ajuste, colocar em stand-by e registrar postagem. Não recebem as colunas de produção “em andamento” nem “ideias”.
- **Administrador:** visão geral e acesso às três áreas para acompanhar a equipe e configurar os vínculos.

Em **Acessos**, cadastre o e-mail, o perfil e a pessoa correspondente. Luiz/Farias/Mateus/Lucio já aparecem como opções, mas nenhum e-mail real foi inventado ou cadastrado. Perfis não administrativos sem pessoa vinculada ficam bloqueados até a configuração. O visualizador, quando vinculado a uma pessoa, consulta apenas a área correspondente.

A atribuição ao designer é automática ao entrar em uma etapa dedicada. Ao mover para uma etapa compartilhada, mantenha Luiz e/ou Farias como responsável. O isolamento é aplicado no servidor e no acesso aos arquivos, não apenas por filtros no navegador. Ao salvar uma área, as tarefas das outras áreas permanecem preservadas.

A nova migração `drizzle/0001_clammy_energizer.sql` adiciona os vínculos de pessoa e o registro de uploads. Em bancos locais existentes, aplique somente essa migração após atualizar o build; em bancos novos, aplique as duas na ordem. A publicação Sites aplica a migração pendente na produção.

Testes adicionais: `node tests/areas.mjs` (regras de permissão) e `node tests/areas-api.mjs` (integração exclusivamente local, com tarefas fictícias e restauração do administrador ao final).

## Fluxo por empresa — configuração atual

Esta seção substitui a distribuição anterior de aprovações por designer.

Nas áreas **Luiz** e **Farias**, o quadro tem exatamente sete colunas: a fazer, em andamento, aprovação, ajustar, aprovados, stand-by e concluidos e postados. As aprovações de todas as empresas podem ser atribuídas a qualquer um dos dois designers. A visibilidade continua seguindo o responsável do cartão.

O campo **Empresa** grava uma etiqueta no cartão: fibroplast, postos, ervateira, materiais, concreto ou luke group. Ao enviar para **aprovação**, pelo seletor ou arrastando, o aplicativo verifica a etiqueta e encaminha o mesmo cartão para **aprovação [empresa]** na área **Lançamentos e aprovações**. O responsável é preservado; não são criadas cópias.

Sem etiqueta de empresa ou com mais de uma empresa, o envio para aprovação é bloqueado e a posição anterior é preservada. Alterar a empresa de um cartão que está em aprovação redireciona-o para a aprovação correspondente no salvamento. A validação também acontece no servidor.

Os status canônicos e suas cores permanecem nos registros e na visão geral. As sete colunas dos designers agrupam esses status na interface; não é necessária uma migração nem apagar tarefas. Para compatibilidade, tarefas antigas em “ideias” aparecem em “a fazer” de Luiz até serem movimentadas.

Testes atuais das regras: `node tests/run-workflow.cjs` (compila e executa as verificações de áreas e de roteamento). O teste de integração continua em `node tests/areas-api.mjs`, exclusivamente na prévia local. Esses comandos substituem a execução direta anterior de `tests/areas.mjs`.

## Ajustes atuais de interface e anexos

Esta seção substitui os limites e a organização visual descritos anteriormente.

- Janela de detalhes centralizada, com bordas arredondadas e vidro fosco; no celular mantém margens e rolagem interna.
- Navegação: **Lançamentos e aprovações**, **Luiz**, **Farias**. A primeira área reúne todos os cartões e substitui “Visão geral”. Mateus/Lucio recebem essa área completa; Luiz/Farias continuam restritos às próprias tarefas.
- Busca por título no cabeçalho. Os filtros de responsável, etiqueta, prioridade e prazo foram retirados da interface.
- Títulos exibidos e editados em caixa alta; novos títulos e tarefas editadas são normalizados no servidor. A descrição e os comentários mantêm sua formatação e caixa originais.
- Todas as etiquetas já usadas no quadro e as seis empresas são oferecidas como opções de seleção. É possível criar outra etiqueta. Empresas são mutuamente exclusivas para preservar o encaminhamento da aprovação.
- Subtarefas foram retiradas da interface e dos contadores. O checklist permanece; dados antigos de subtarefas são preservados para evitar perda de conteúdo.
- Arquivos: **até 100 MB por arquivo**, enviados em partes de 8 MB, com progresso e cancelamento. O envio via formulário legado continua restrito a 10 MB apenas para compatibilidade; a interface atual sempre usa o novo envio em partes.
- Imagens PNG/JPG/WebP/GIF/AVIF: prévia e escolha da capa. Vídeos MP4/WebM/MOV e PDFs: prévia quando o formato é suportado pelo navegador. PSD, AI, arquivos compactados e outros formatos recebem identificação e link para baixar; não há conversão de arquivos Adobe para imagem nesta versão.
- A primeira imagem enviada é selecionada como capa automaticamente; é possível mudar ou remover a capa, sem excluir o anexo. A escolha é persistida na tarefa.
- Downloads e prévias continuam protegidos pelo acesso à tarefa. Arquivos de formatos ativos, como SVG/HTML, não são servidos como prévias incorporadas.
- **Ctrl + roda do mouse** sobre o quadro movimenta a rolagem horizontal, preservando a rolagem comum quando Ctrl não está pressionado.

O novo upload não requer migração do banco: a propriedade de uploads usa a tabela existente; o estado temporário multipart fica no R2. Um envio cancelado é abortado; envios interrompidos sem cancelamento podem deixar partes pendentes e precisam de política de limpeza no armazenamento.

Testes: `node tests/run-workflow.cjs`, `node tests/areas-api.mjs` e `node tests/polish-api.mjs`. O último usa apenas arquivos fictícios locais, gera automaticamente os fixtures em `.sites-runtime/capa-azul.png` e `.sites-runtime/capa-laranja.png` quando necessário e limpa a tarefa criada ao terminar. A flag `--keep` destina-se exclusivamente à inspeção visual local.
