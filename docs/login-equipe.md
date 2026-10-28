# Login da equipe

Cada pessoa entra com seu e-mail e a mesma senha compartilhada. Contas: Lucio (marketingluke09@gmail.com), Farias (marketingluke06@gmail.com), Luiz (marketingluke02@gmail.com), Mateus (marketingluke24@gmail.com) e administrador (ezequiel2303f@gmail.com, persona Farias). Os vínculos e permissões permanecem em marketing_members; autenticar não concede poderes administrativos por si só.

## Verificação de baixo consumo

O navegador deriva a chave com PBKDF2-SHA256, 100.000 iterações e 32 bytes, usando o mesmo salt e senha existentes. O servidor emite um desafio aleatório de 256 bits, ligado ao e-mail, com validade de dois minutos. A confirmação usa HMAC-SHA256 sobre o contexto, e-mail e desafio. O servidor consome o desafio atomicamente antes de verificar a confirmação. Desafios expirados, repetidos, de outro e-mail ou com confirmação inválida não abrem sessão. O endpoint não aceita a senha bruta como alternativa.

BOARD_LOGIN_HASH e BOARD_LOGIN_SALT continuam em .dev.vars (ignorado) e nos segredos do Worker. O hash agora também funciona como chave de verificação e deve permanecer exclusivamente no servidor. Não incluir a senha, chave derivada ou segredos nos arquivos públicos, armazenamento do navegador ou registros. A resposta pública contém somente o salt e o desafio. O formulário não persiste a senha nem a chave derivada.

A reserva atômica de desafios limita oito tentativas por e-mail em 15 minutos. As sessões duram 12 horas, usam token aleatório de 256 bits e cookie HttpOnly, SameSite=Lax, Secure em HTTPS. Apenas o hash do token fica no banco; sair revoga a sessão. O banco revalida o papel e a persona atuais em cada acesso.

## Preparação e publicação da prévia Cloudflare

Aplicar as migrações até 0006_login_challenges.sql, preservando dados existentes. Configurar os segredos acima. Após o build, executar node scripts/prepare-cloudflare-preview.mjs. O script reutiliza a configuração isolada da prévia, copia a compilação e prepara a entrada leve de autenticação e o login estático com a mesma marcação React e CSS. O vínculo ASSETS atende o arquivo público; somente login e desafio evitam o runtime de renderização. O quadro continua usando o servidor existente. Arquivos e preferências da prévia continuam desativados. Não sobrescrever essa entrada com uma cópia genérica de dist depois da preparação.

O administrador também entra em /login com seu e-mail cadastrado e a senha combinada. /admin é apenas a entrada legada da hospedagem Sites, não necessária na prévia externa.
