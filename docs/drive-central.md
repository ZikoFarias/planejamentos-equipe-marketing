# Conexão central do Drive — preparação

Conta autorizada: marketinglukegroup@gmail.com. Login individual do site permanece inalterado. Todos os envios devem usar a autorização central do servidor, sem distribuir tokens ao navegador da equipe.

Implementado em server/drive-central-auth.ts: URL OAuth com estado/PKCE e consentimento offline; troca de código; verificação de e-mail verificado da conta central; renovação de acesso e criptografia AES-GCM dos tokens persistentes. Testes cobrem conta errada, e-mail não verificado, renovação, criptografia e chave inválida.

Pendente antes de ativar: credencial confidencial do cliente Web Google (JSON local, nunca no GitHub); cadastrar callback HTTPS; integrar início/callback restritos ao administrador, estado de uso único vinculado à sessão e prazo; armazenar token cifrado no banco e chave nos segredos Cloudflare; adicionar upload e leitura central autenticados com validação do cartão, permissão, pasta e limite; substituir a conexão Google individual na interface. A conexão atual permanece individual até essa integração ser concluída.

Não publicar este módulo como se a conexão central já estivesse ativa. A conta central ainda precisa concluir o consentimento do Google e o envio real deve ser validado.

## Fluxo central implementado

Após a autorização exclusiva da conta central, o servidor renova acesso internamente e transmite o corpo do upload em streaming ao Google Drive. A API exige sessão, origem e permissão de edição no cartão salvo, determina a empresa no banco e usa a subpasta configurada para referência/arte final. Não aceita pasta, URL Google ou token fornecidos pelo navegador. A resposta só confirma arquivo cujo ID, tamanho e pasta correspondem ao envio. Um registro interno limita a leitura aos arquivos enviados por esse fluxo e vinculados a cartões visíveis, ou ao autor enquanto pendente. Credenciais e refresh tokens nunca chegam à equipe.

A interface passa a exibir Drive central conectado, sem botão de conexão individual. Novos cartões precisam ser salvos com a empresa antes de anexar. O vínculo do anexo ainda é confirmado por Salvar tarefa. Remover do cartão não remove o arquivo no Drive. Arquivos antigos sem registro central precisam de migração separada. Nenhum armazenamento R2 ou plano pago foi ativado.

## Teste real de 28/10/2026

Conta central registrada e fluxo publicado na versão cc994ce8-0030-4cf8-9886-843d438c97e3. Cartão de teste 8786fd5b-5df1-414d-89ec-5b7599a285f3. Referência e arte final de 33.748 bytes foram enviados pela conta central para as duas pastas de LUKE GROUP, com IDs 1afAAfNqPEJ6mlTRWFeFiowmPVonKg_e3 e 1eSjjMb1edvjlGXebDYzKrVcrSsvmBx_g. O vínculo foi salvo no cartão. A conta Luiz leu ambos os arquivos byte a byte, sem token Google individual. Requisição anônima retornou 401. Arquivos/cartão identificados como TESTE DRIVE CENTRAL permanecem disponíveis para conferência. A leitura de arquivos legados sem registro central permanece pendente de migração.
