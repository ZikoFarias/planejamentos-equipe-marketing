# Preferências pessoais e senhas

- Somente o administrador vê os controles de status/cores. A API ignora cores enviadas por outros papéis e mantém a paleta compartilhada.
- Cada membro pode escolher foto (Drive privado, até 20 MB) ou cor HEX para seu fundo. Salvar aparência aplica a escolha pessoal; usar fundo original limpa ambas.
- Configurações contém Trocar minha senha com senha atual, nova senha e confirmação. Administradores redefinem a senha de outro membro no editor em Acessos e permissões. A própria senha do administrador é alterada nas configurações.
- A senha padrão continua válida para contas ainda não alteradas. Cada alteração grava somente salt aleatório e verificador PBKDF2 de 100 mil iterações; senhas em texto não são enviadas ao servidor nem armazenadas. O login mantém prova HMAC, desafio único, origem e limite de tentativas. Os verificadores são privados e nunca aparecem nas respostas do quadro/preferências.
- Trocar a própria senha exige prova da senha atual. Redefinir a de outro membro exige administrador. A gravação e a exclusão das sessões do alvo são atômicas; outras contas preservam suas sessões.
- Testes executados com SQLite temporário cobrem login com senha individual, rejeição da padrão após troca, confirmação de identidade, repetição de prova, permissões, sessões e fundos/cores. Nenhuma senha de produção foi alterada para testar. Conferência visual pendente enquanto o navegador estiver desativado no Work.
