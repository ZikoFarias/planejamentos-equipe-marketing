# Conexão central do Drive — preparação

Conta autorizada: marketinglukegroup@gmail.com. Login individual do site permanece inalterado. Todos os envios devem usar a autorização central do servidor, sem distribuir tokens ao navegador da equipe.

Implementado em server/drive-central-auth.ts: URL OAuth com estado/PKCE e consentimento offline; troca de código; verificação de e-mail verificado da conta central; renovação de acesso e criptografia AES-GCM dos tokens persistentes. Testes cobrem conta errada, e-mail não verificado, renovação, criptografia e chave inválida.

Pendente antes de ativar: credencial confidencial do cliente Web Google (JSON local, nunca no GitHub); cadastrar callback HTTPS; integrar início/callback restritos ao administrador, estado de uso único vinculado à sessão e prazo; armazenar token cifrado no banco e chave nos segredos Cloudflare; adicionar upload e leitura central autenticados com validação do cartão, permissão, pasta e limite; substituir a conexão Google individual na interface. A conexão atual permanece individual até essa integração ser concluída.

Não publicar este módulo como se a conexão central já estivesse ativa. A conta central ainda precisa concluir o consentimento do Google e o envio real deve ser validado.
