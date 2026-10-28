# Verificação do plano gratuito — 28/10/2026

## Resultado

O pacote e os dados atuais cabem nas franquias de tamanho e armazenamento. A compatibilidade de CPU ainda não foi comprovada na rede do Cloudflare. A análise local foi seguida por uma publicação temporária autorizada, descrita abaixo. Nenhuma assinatura paga foi ativada.

## Evidências locais

- `wrangler deploy --dry-run`: passou, sem enviar uma versão ao servidor; pacote de 863,04 KiB, aproximadamente 254,49 KiB compactados.
- Maior arquivo estático: 198.924 bytes; conjunto estático medido em aproximadamente 1,34 MB.
- Banco local: 65.536 bytes; 27 cartões; JSON do quadro com 18.145 bytes.
- Anexos declarados nos cartões: 3 arquivos, somando 4.745.764 bytes. Isso mede os metadados atuais, não todo o bucket nem o uso mensal de operações.
- Login PBKDF2-SHA256 de 100.000 iterações: mediana local de 16 ms de CPU em 12 amostras no Node. Essa medição não equivale ao tempo de CPU do Workers, mas indica um ponto a testar.

## Limites relevantes

- Workers Free: 100.000 requisições/dia e 10 ms de CPU por requisição. Arquivos estáticos não consomem a mesma franquia das rotas dinâmicas.
- D1 Free: 500 MB por banco, 5 GB por conta, 5 milhões de linhas lidas/dia e 100.000 linhas escritas/dia.
- R2 Standard: franquia de 10 GB-mês e operações mensais incluídas. É um serviço com excedentes cobrados; a franquia não é um bloqueio automático de gastos.
- Os limites de execução não são impostos da mesma forma no desenvolvimento local. Passar na prévia ou na preparação de publicação não comprova que o login e a renderização cabem nos 10 ms de CPU.

## Pendências para confirmar custo zero

1. Medir login, páginas e APIs em uma prévia de teste na rede do Cloudflare, preservando a publicação atual.
2. Confirmar as assinaturas da conta e configurar os recursos reais: a configuração gerada ainda usa os nomes de exemplo do ambiente Sites.
3. Definir o armazenamento: o código atual ainda depende de R2 para anexos; Drive permanece uma integração não concluída.
4. Não reduzir a proteção da senha apenas para diminuir tempo de CPU. Se necessário, ajustar a arquitetura do login e da renderização.

## Referências oficiais

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/get-started/

## Teste real no Cloudflare — concluído em 28/10/2026

- Endereço: https://planejamentos-marketing-teste-gratis.marketinglukegroup.workers.dev/login
- Worker separado: planejamentos-marketing-teste-gratis.
- D1 separado: 3dbf5037-7f75-4567-9600-1314f0489114, com três cartões fictícios; banco real e publicação Sites preservados.
- Conta Free confirmada pela API: uma tentativa de configurar cpu_ms manualmente foi recusada com código 100328 (CPU limits are not supported for the Free plan). A configuração foi removida; nenhum upgrade foi aceito.
- 24 requisições do roteiro principal tiveram status esperados: quatro logins 200, páginas e quadro 200, gravação de cartão fictício 200, saídas 204 e sessões revogadas 401.
- Verificação visual pelo navegador: entrada de Farias e cartões de demonstração visíveis.
- CPU medida por wrangler tail: login entre 22 e 53 ms; página de login entre 12 e 90 ms; página do quadro entre 10 e 33 ms; API do quadro entre 2 e 10 ms. As amostras retornaram outcome OK.
- Mesmo sem erro nessas amostras, login e renderização ultrapassaram os 10 ms documentados para Free. A flexibilidade da plataforma para picos não comprova estabilidade futura. Otimizar a autenticação e a renderização antes da migração definitiva.
- R2 não foi ativado. O wrapper temporário bloqueia arquivos e usa preferências padrão. Não validar envio de artes com esta prévia.
- O wrapper remove cabeçalhos de identidade da hospedagem Sites antes de chamar a aplicação. Preservar essa separação ao preparar a hospedagem externa definitiva.
- A falha inicial de HTTPS deixou de ocorrer após a ativação do novo endereço. Não houve desativação da validação de certificados.
- Última versão: 065846d7-a9fe-4e95-8b13-e9ef6ae3f9e3.

Resultado: publicação e fluxos principais funcionam no Free nas amostras testadas; o orçamento de CPU ainda exige otimização. Esta é uma prévia de teste, não a migração do site real.

## Otimização do login — 28/10/2026

Publicada na prévia, versão 470be079-ca93-48ee-9650-a4df27cdfbf7. Senha, salt, força PBKDF2 e permissões mantidos. O cálculo derivativo ocorre no navegador; o Worker verifica uma prova HMAC associada a desafio único e e-mail. A página de entrada é estática, gerada a partir do componente atual. Não houve contratação ou ativação de plano pago.

Cinco contas autenticaram, consultaram o quadro e saíram com sucesso. Repetição de cada prova retornou 401. Teste no navegador confirmou entrada de Farias e saída. Testes locais cobrem expiração, corrida de duas provas, identidade diferente, senha errada, mudança de vínculo, origem, limite e cookies. Nenhum cartão foi alterado nesses testes.

Amostra sanitizada do tail: GET /login 0–1 ms de CPU (3 eventos); POST /api/auth/challenge 2–4 ms (4 eventos); POST /api/auth/login 1–5 ms (8 eventos, incluindo rejeições 401). Nenhum evento de autenticação capturado ultrapassou 10 ms. O tail não é um censo de todas as requisições; desempenho futuro não é garantido por essa amostra.

Limitação separada: abertura do quadro GET / chegou a 34 ms, e uma leitura inicial do quadro chegou a 26 ms. O login otimizado não comprova que o sistema inteiro cabe nos limites gratuitos. Os anexos e migração definitiva permanecem pendentes.
