# Instalação da equipe

Endereço: https://planejamentos-marketing-teste-gratis.marketinglukegroup.workers.dev/

Esta é a instalação externa de uso da equipe. O nome técnico do Worker e do banco foi mantido para preservar o endereço autorizado no Google, os dados, os acessos e os segredos já configurados. A publicação original no Sites não foi modificada.

## Recursos ativos

- Login próprio com os e-mails cadastrados, sessões privadas e permissões existentes.
- Quadro, áreas, calendário semanal, compras, orçamentos, aprovações e atualização automática entre contas.
- Salvamento ao fechar o cartão, arrastar arquivos para Referência/Arte e desfazer/refazer até dez ações.
- Arquivos e backup pela conta central do Drive, com destino por empresa e categoria.
- Revisão ortográfica auxiliar pelo Gemini, conforme `revisao-ortografica.md`.
- Cores pessoais salvas no D1 por e-mail; cada conta mantém a própria aparência entre dispositivos.
- As cores escolhidas pelo administrador em 29/10/2026 foram aplicadas às cinco contas e guardadas em `_team_defaults` como padrão para contas sem personalização. Fundos pessoais foram preservados. As etiquetas continuam no `status_config.labels`, compartilhado por toda a equipe.
- Imagens de fundo de até 20 MB enviadas ao Drive, na pasta **Fundos do quadro**, com leitura privada restrita ao dono.
- Prévia de anexos antigos do Drive, após confirmar que o arquivo vinculado ao cartão está em uma das pastas autorizadas das empresas.

Não há contratação de R2 nem ativação de plano pago por esta alteração. As rotas antigas de armazenamento R2 não são usadas nos envios desta instalação: artes usam a conexão central e fundos usam a nova rota privada do Drive. Os limites dos serviços gratuitos continuam valendo.

## Abertura do quadro

O endereço principal valida a sessão e entrega uma entrada estática leve. O mesmo componente React do quadro é montado no navegador; seus dados continuam nas APIs autenticadas. Isso retira a renderização inicial do quadro do servidor. A autenticação continua consultando a sessão vigente, a função e o vínculo da pessoa no banco, incluindo revogação e expiração.

As respostas são privadas e sem cache compartilhado. A marcação de instalação de teste foi removida. `noindex` permanece por se tratar de uma ferramenta privada da equipe, não de uma página pública de divulgação.

## Banco e publicação

Aplicar `drizzle/0010_preferences.sql`, preservando as migrações anteriores. Preparar a publicação com `scripts/prepare-cloudflare-preview.mjs` após a compilação; o nome do script foi mantido para compatibilidade. Ele gera as entradas leves de login e quadro e mantém a identidade do Worker/banco. Não copiar `dist` novamente sobre a pasta preparada.

## Verificação em 29/10/2026

A conferência real confirmou página autenticada HTTP 200, entrada React publicada, redirecionamento de visitante para login, persistência e isolamento de preferências entre duas contas, bytes exatos do fundo lidos pelo dono, HTTP 403 para a outra conta e HTTP 200 para a prévia antiga. Os 27 cartões foram preservados. As preferências temporárias do teste foram restauradas.

Testes adicionais: `background-storage.mjs`, `preferences-api.cjs` e `production-entry.cjs`, incluídos em `run-workflow.cjs`. Eles cobrem validação, privacidade, origem, armazenamento sem R2 e rejeição de sessões inválidas ou revogadas.

A conferência visual por automação segue pendente enquanto o controle de navegador estiver desativado no Work. A entrega estática reduz o trabalho de abertura no servidor; os testes não constituem garantia de capacidade para qualquer volume de uso.
