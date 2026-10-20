# Verificação da entrega

Data: 19/10/2026. Ambiente: prévia local autenticada, banco D1 e armazenamento R2 locais. Nenhuma tarefa real do ClickUp foi consultada ou modificada.

## Resultados

| Critério | Evidência / resultado |
|---|---|
| Criação | Criada tarefa explicitamente identificada como `[TESTE LOCAL]`, com dois responsáveis e duas etiquetas. |
| Edição | Descrição em negrito/itálico, prazo, prioridade, checklist, subtarefa concluída, comentário e link anexado gravados e exibidos no cartão. |
| 15 etapas | Movida uma tarefa sucessivamente para cada uma das 15 colunas pelo seletor, aguardando a presença no destino. |
| Arrastar entre colunas | Alça de arraste usada para mover o segundo cartão de `a fazer farias` para `a fazer luiz`. |
| Reordenação | Setas e arraste dentro da coluna alteraram a ordem dos dois cartões. |
| Persistência | Página recarregada; tarefa e conteúdo permaneceram. |
| Filtros | Busca + responsável + etiqueta + prioridade + atraso retornaram a tarefa; trocar prioridade para baixa a excluiu dos resultados. |
| Detalhes | Painel abre pelo cartão; campos, checklist, subtarefas, comentários e histórico exibidos. |
| Duplicação | Cópia criada com novo identificador e título com `(cópia)`. |
| Exclusão | Exclusão da cópia verificada na prévia. Implementada confirmação explícita dentro do aplicativo; novo teste com “Manter tarefa” preservou o cartão. |
| Teclado | Enter em “Nova tarefa” abriu o painel, com foco inicial no botão de fechar. Seletores e setas permitem movimentação sem arrastar; dialog nativo contém o foco. |
| Celular | Viewport 390 × 844: largura do documento = 390; quadro com rolagem interna; painel = 390 × 844; botão salvar dentro dos limites. Screenshot responsivo inspecionado. |
| Tablet | Viewport 768 × 1024: largura do documento = 768, sem transbordamento da página. |
| Colunas | Recolher/expandir funcionando; ocultar vazias mostrou apenas a coluna com tarefas. |
| Visualizador | Interface de criação e mudança de status desabilitada; painel somente leitura sem botões de edição/exclusão. API retornou 403 ao salvar e gerenciar membros, preservando tarefas e revisão. |
| Conflitos | POST com revisão obsoleta retornou 409, preservando dados anteriores. |
| Anexos | Upload e download autenticados de TXT fictício passaram; download anônimo retornou 401. |
| Build | Compilação de produção e verificação de tipos executadas. |

## Testes repetíveis

- `node tests/api.mjs`: requer administrador fictício na prévia; valida salvamento, revisão obsoleta e origem recusada.
- `node tests/api.mjs visualizador`: requer configurar o membro fictício local como visualizador; verifica bloqueio de escrita e de gerenciamento de membros.
- `node tests/files.mjs`: envia e lê arquivo fictício local, verificando acesso anônimo negado.

Os testes usam exclusivamente `http://127.0.0.1:5173` e autenticação simulada local. Os dados locais de teste são separados da produção. Os testes de interface foram realizados no navegador; os resultados acima não significam que a autenticação da equipe tenha sido liberada na hospedagem.

## Configuração externa pendente

- Liberar audiência/compartilhamento na hospedagem para uso em equipe e cadastrar os e-mails em “Acessos”. A publicação inicial permanece privada.
- ClickUp: integração não implementada. A versão funciona de forma independente e sinaliza essa condição no quadro.
- Teste com múltiplos usuários reais simultâneos e celulares físicos não realizado. O conflito de revisão foi validado por requisições locais, e os tamanhos móveis por viewport do navegador.

## Atualização: áreas de Luiz, Farias, Mateus e Lucio

- Testes automatizados das seis etapas de Luiz, cinco de Farias, quatro compartilhadas e fila de lançamentos/aprovações.
- Proteção no servidor: um designer não recebe nem altera tarefas da outra área; compartilhadas respeitam atribuição individual ou conjunta.
- Salvamento parcial preserva todas as tarefas fora da área do usuário.
- Lançamento em “a fazer luiz” atribui Luiz automaticamente; Lucio pode registrar a postagem mantendo a atribuição.
- Visualizador continua sem escrita; editor sem pessoa vinculada não recebe tarefas nem pode salvar.
- A migração é aditiva e preserva tarefas existentes. E-mails reais serão adicionados pelo administrador posteriormente.

## Atualização: sete colunas e roteamento por empresa

- Luiz e Farias: sete colunas verificadas no navegador.
- Seis empresas × dois designers: destino de aprovação, manutenção do responsável e visibilidade verificados nos testes de regras.
- Etiqueta ausente ou múltiplas empresas: envio bloqueado; destino incompatível corrigido no servidor.
- Mudança de empresa em aprovação: destino atualizado no salvamento.
- Navegador: cartão fictício criado na área Luiz com Fibroplast; enviado para aprovação; mesmo cartão localizado em “aprovação fibroplast” na área de lançamentos/aprovações.
- Testes de integração por área continuam verificando isolamento, preservação de tarefas ocultas, visualizador e acesso aos anexos, agora com empresas nas tarefas em aprovação.
- Nenhuma alteração de esquema ou migração de dados necessária nesta atualização.

## Atualização: janela flutuante, capas e arquivos maiores

- Janela desktop: centro horizontal coincide com o centro da tela; raio de 22 px; blur de 28 px e saturação verificados no navegador.
- Filtros removidos do DOM; pesquisa no cabeçalho. Primeira área é Lançamentos e aprovações; Visão geral removida.
- Catálogo de etiquetas selecionáveis, incluindo todas as empresas e etiquetas existentes, verificado na interface. Criação e seleção de “reels” testadas.
- Subtarefas ausentes da interface; checklist preservado.
- Título digitado em minúsculas ficou em caixa alta e foi salvo em caixa alta.
- Upload real de 12 MB em partes passou na API e no seletor de arquivos do navegador. Nenhum arquivo real foi usado no teste.
- Prévias de duas imagens PNG carregadas (640 px); troca da capa e persistência verificadas. Capa que não pertence aos anexos é rejeitada.
- Acesso anônimo à prévia bloqueado; requisição parcial retornou 206 e os 16 bytes solicitados. Arquivo maior que 100 MB foi rejeitado na inicialização.
- Ctrl + roda: lógica do evento verificada em teste automatizado; listener não passivo anexado ao quadro. Rolagem comum não é interceptada.
- Testes anteriores de isolamento, atribuição, aprovação por empresa, visualizador e proteção dos anexos continuaram passando; a área de Mateus/Lucio agora inclui a produção, conforme solicitado.

### Aparência e calendário — revisão atual
- Tipagem e testes de áreas/roteamento, anexos e calendário passaram.
- API local: visualizador personaliza a aparência, mas não envia anexos de tarefa nem edita tarefas; fundo de outro usuário bloqueado; valores inválidos rejeitados sem sobrescrever preferências.
- Navegador: upload de fundo pelo seletor do computador, salvamento e permanência após recarga; ausência da antiga barra; colunas de 218 px; arte de teste na empresa e dia corretos e abertura dos detalhes pelo calendário.
- Tela de 390 px: largura do documento 390 px; calendário rola internamente. Semana anterior/seguinte e virada de ano verificadas.
- Tarefas fictícias e aparência de teste usadas apenas no ambiente local. Nenhuma tarefa real publicada foi alterada.

### Unidades e listas suspensas — revisão atual
- Tipagem, testes de roteamento das nove etiquetas, compatibilidade de etiquetas antigas, preservação de responsáveis e bloqueio de duas unidades simultâneas passaram.
- APIs locais: permissões dos quatro perfis, anexos e catálogo atualizado passaram.
- Navegador local: campo Empresa ausente; seleção MATERIAIS-SMO mais etiqueta personalizada e dois responsáveis, salvamento em aprovação materiais e persistência após recarga confirmados.
- Teclado: Enter abre e Escape fecha a lista sem fechar os detalhes; Tab e checkboxes nativos disponíveis.
- Celular de 390 px: documento mede 390 px, menus legíveis com rolagem interna.
- Tarefa fictícia removida apenas do ambiente local. Nenhum cartão real teve unidade presumida ou etiqueta alterada nos testes.

### Revisão de lançamentos semanais, menus e HEX
- Testes de grade: 25 cartões, datas, ambas unidades, assignees, status, dia isolado, deduplicação e ordem das etiquetas passaram.
- API local: lançamento diário e completo; repetição; dois pedidos concorrentes; cartão aprovado preservado; editores de Lançamentos permitidos e visualizador/designers bloqueados.
- Navegador: menus de status e prioridade coloridos; seleção por teclado; ordem de etiquetas conferida; criação de um dia pelo botão; repetição desabilitada; semana escolhida persistida no formulário.
- HEX válido aplicado, código inválido bloqueia salvar; expansão de cartão confirmada com duração de 260 ms.
- Tela 390 px sem exceder a largura; botão Tarefas semanais e prévia responsivos.
- Tarefas fictícias de API e interface removidas do ambiente local. Nenhuma tarefa real foi criada ou alterada durante a conferência.

### Revisão de seleção e ordenação
- Testes puros: vencimento crescente, sem prazo ao final, postagem por momento real (independente do vencimento), edição sem atualizar a postagem, troca de status em lote por empresa e preservação de não selecionados.
- API local: lote inválido/sem permissão rejeitado por inteiro; timestamp do servidor preservado; conflito bloqueia exclusão; visualizador bloqueado; exclusão em lote autorizada testada com fixtures.
- Interface local: quatro cartões selecionados por coluna, prioridade alterada em conjunto, movimentação em conjunto, publicação em momentos diferentes e ordem preservada após recarga. Confirmação de exclusão exibiu os quatro cartões; cancelar manteve os dados.
- Celular de 390 px sem excesso de largura, com seleção e ações acessíveis. Controles inferiores ausentes; marca em faixa separada; rodapé à direita.
- Fixtures removidas somente do ambiente local; nenhum cartão real foi alterado nos testes.

## Status configuráveis e recolhimento automático — 20/10/2026
Administrador pode criar status com nome/cor e excluir escolhendo destino obrigatório. Transferência de cartões e redirecionamento dos lançamentos futuros são atômicos e protegidos por revisão. Migração 0002 adiciona status_config. Em Lançamentos, andamento e aprovação vazios ficam recolhidos; receber cartão expande automaticamente. Testes de permissões, conflitos, migração de cartões, programação semanal e áreas passaram. Verificação visual local confirmou criação e expansão. Dados fictícios removidos.
