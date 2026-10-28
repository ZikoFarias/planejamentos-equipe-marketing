# Login da equipe

A página `/login` aceita e-mail cadastrado e a senha compartilhada definida pela equipe. Os quatro acessos são Lucio (`marketingluke09@gmail.com`), Farias (`marketingluke06@gmail.com`), Luiz (`marketingluke02@gmail.com`) e Mateus (`marketingluke24@gmail.com`). Os vínculos e permissões continuam na tabela `marketing_members`.

A configuração local está no arquivo ignorado `.dev.vars`: `BOARD_LOGIN_SALT` e `BOARD_LOGIN_HASH`. O hash usa PBKDF2-SHA256, 100.000 iterações, 32 bytes, com o texto hexadecimal do salt como entrada. A senha original não fica no código nem é enviada ao navegador.

As sessões duram 12 horas e usam cookie HttpOnly, SameSite=Lax e Secure em HTTPS. Apenas o hash do token aleatório é armazenado. Sair revoga a sessão no banco. O limite é de oito tentativas por e-mail em 15 minutos.

O acesso administrativo em `/admin` mantém a autenticação já existente da hospedagem, restrita a membros administradores. A senha compartilhada não concede perfil de administrador. Na prévia, essa identidade é o administrador simulado do Sites.

## Publicação futura

Não houve publicação. Para hospedar esta versão, aplicar a migração `0004_team_login.sql` e configurar os dois valores como segredos do servidor. Não incluir `.dev.vars` no GitHub nem em arquivos públicos. O endereço `127.0.0.1` continua restrito ao computador da prévia.
