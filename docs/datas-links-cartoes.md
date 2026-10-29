# Datas rápidas e links de cartões

- Clicar na data do cartão abre apenas o calendário. Aplicar/remover datas confirma a atualização pelo mesmo fluxo de gravação, permissões, revisão e desfazer do quadro. Clique e teclado não propagam a abertura do cartão.
- O menu do cartão contém Copiar link. Edições pendentes e cartões novos são gravados antes da cópia.
- Links usam `/?card=<id>`. O login preserva o destino; o quadro abre a tarefa após carregar os dados autenticados. IDs inválidos são ignorados; cartões removidos ou inacessíveis mostram aviso. O link não concede permissões.
- TypeScript, build e suíte completa passaram, incluindo destinos de login seguros. A conferência visual permanece pendente enquanto o navegador estiver desativado no Work.
