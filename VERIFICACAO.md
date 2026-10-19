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
