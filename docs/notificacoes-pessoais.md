# Notificações pessoais

Histórico privado por e-mail canônico, disponível em Perfil → Notificações. Lidas e visualizadas são estados distintos: o balão desaparece após 8 segundos com a página visível; isso não marca o aviso como lido. Abrir o cartão ou usar a ação explícita marca como lido. Os resumos incluem links para as pendências.

Eventos seguem Luiz/Farias (atribuição e ajustes), Farias (entrada em Compras e compra aprovada), Lúcio (aprovação, orçamento e voto pendente após Mateus) e Mateus (aprovação e voto pendente após Lúcio). Compras e mídia externa exigem apenas Lúcio e não notificam Mateus para revisão.

O resumo diário é gerado uma vez por dia após 08:00 em America/Sao_Paulo, com recuperação se a execução atrasar. Usa o cron já existente, sem serviço externo de envio. Notificações são guardadas mesmo com usuários desconectados; o balão é exibido no site ao voltar. Histórico novo começa na ativação, sem inventar eventos antigos.

## Banco e entrega

Aplicar db/notifications.sql antes da publicação. O trigger captura projeções pequenas dos cartões na mesma transação da alteração do quadro; arquivos, descrições e histórico de atividade não são copiados. CAS sem alteração não gera aviso. Uma fila persistente é consumida pelo cron e pela consulta autenticada de notificações; chaves únicas evitam duplicações e a remoção da fila ocorre na mesma transação da inserção dos avisos.

GET /api/notifications retorna apenas a conta autenticada, com paginação de 50 itens. POST valida origem e só altera lidas/visualizadas dessa conta. Consulta do site a cada 5 segundos enquanto a página está visível, além de atualização ao retornar à aba.

## Verificação

node tests/personal-notifications.cjs
node tests/personal-notifications-ui.cjs
node tests/notification-stack.cjs
