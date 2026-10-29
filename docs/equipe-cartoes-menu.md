# Equipe e ações do cartão

- Acessos e permissões mostra cartões quadrados com nome, foto, cargo, e-mail e nível de acesso. Os cargos iniciais são Gerente (Lúcio), Social Media e Videomaker (Mateus) e Designer (Farias/Luiz).
- O menu de cada membro abre o editor administrativo. Fotos PNG/JPEG/WebP de até 25 MB usam o Drive central privado; fundos continuam limitados a 20 MB.
- E-mail de login personalizado resolve para a identidade original, preservando atribuições e histórico. O endereço anterior deixa de autenticar. O administrador mantém o próprio nível; papéis não autorizados e e-mails duplicados são rejeitados.
- As ações Duplicar, Excluir, Fechar e o estado de salvamento ficam nos três pontos ao lado do X. Não há rodapé no cartão.
- Comentários e atividades compartilham a linha do tempo, com o compositor logo abaixo.

Validação: TypeScript, build de produção e suíte completa de fluxo passaram. Testes cobrem troca de e-mail com sessão na identidade original, rejeição do endereço anterior, cargo inválido, e-mail duplicado, escalada de função, autenticação e limite de 25 MB. Conferência no site publicado confirmou os menus e a área unificada; nenhum nome, e-mail ou permissão real foi alterado para teste.
