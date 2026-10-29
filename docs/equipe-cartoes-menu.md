# Equipe e ações do cartão

- Acessos e permissões mostra cartões quadrados com nome, foto, cargo, e-mail e nível de acesso. Os cargos iniciais são Gerente (Lúcio), Social Media e Videomaker (Mateus) e Designer (Farias/Luiz).
- O lápis de cada membro abre diretamente o editor administrativo. Fotos PNG/JPEG/WebP de até 100 MB usam o Drive central privado; fundos continuam limitados a 20 MB.
- O editor de foto oferece gabarito quadrado com guia circular, arraste, zoom de 1 a 3 e posição horizontal/vertical. O enquadramento validado no servidor é salvo no perfil e aplicado aos avatares redondos; o original é preservado no Drive.
- E-mail de login personalizado resolve para a identidade original, preservando atribuições e histórico. O endereço anterior deixa de autenticar. O administrador mantém o próprio nível; papéis não autorizados e e-mails duplicados são rejeitados.
- As ações Duplicar, Excluir, Fechar e o estado de salvamento ficam nos três pontos ao lado do X. Não há rodapé no cartão.
- Comentários e atividades compartilham a linha do tempo, com o compositor logo abaixo.

Validação: TypeScript, build de produção e suíte completa de fluxo passaram. Testes cobrem troca de e-mail com sessão na identidade original, rejeição do endereço anterior, cargo inválido, e-mail duplicado, escalada de função, autenticação, limite de 100 MB e enquadramentos inválidos. A conferência visual da última mudança (lápis e enquadramento) ficou pendente porque o navegador foi desativado nas configurações do Work; nenhum nome, e-mail ou permissão real foi alterado para teste.
