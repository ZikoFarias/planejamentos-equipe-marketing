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
