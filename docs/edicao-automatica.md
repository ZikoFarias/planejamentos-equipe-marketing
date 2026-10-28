# Salvamento, anexos e desfazer

O cartão salva ao fechar pelo X, Esc, Fechar e salvar ou clique no fundo. Erros de validação, conexão ou conflito mantêm o painel e o rascunho abertos. O botão Salvar tarefa foi removido. Comentário ainda digitado é incluído ao fechar. Aprovações salvam edições pendentes antes de votar, mantendo o endpoint protegido de votos.

Referência e Arte são abas lado a lado. Soltar arquivos sobre a aba ou seu painel inicia o envio central com o tipo correspondente. Um cartão novo ou com empresa alterada é salvo antes do envio para que o servidor determine o destino pelo registro persistido. Depois do upload, os vínculos são salvos automaticamente no cartão. Falha no banco mantém os anexos no rascunho para nova tentativa; os arquivos confirmados no Drive não são apagados.

Ctrl+Z desfaz e Ctrl+Shift+Z refaz até 10 ações locais. No quadro, são revertidos os campos alterados de cartões existentes, preservando os demais campos e votos. Se outro usuário mudou o mesmo campo ou removeu o cartão, a ação é bloqueada. No cartão aberto, o histórico cobre estados do rascunho; uma atualização remota limpa esse histórico. Votos, exclusão/criação e operações no Drive não são revertidos como exclusões ou alterações físicas de arquivos.

Verificação: TypeScript, build e suíte de fluxo, incluindo limite de 10, movimento ida/volta, campo concorrente, cartão removido e preservação de votos. Verificação visual do arrastar/clique fora pendente: navegador indisponível nas configurações do Work durante esta execução.
