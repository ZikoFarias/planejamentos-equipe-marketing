# Perfis, cores e revisão por movimentação

## Administração

Em Configurações → Acessos e permissões há uma seção Nomes e fotos da equipe. O administrador pode editar o nome dos cinco acessos e enviar PNG, JPEG ou WebP de até 5 MB. Nomes são salvos ao sair do campo; fotos são salvas ao concluir o envio. Isso altera a identificação exibida, sem trocar o e-mail, a função ou os responsáveis internos usados nas permissões.

As fotos ficam no Drive central. A leitura exige login; fotos marcadas como perfil podem ser vistas pela equipe, enquanto fundos pessoais continuam restritos ao dono. A edição de perfis incrementa a revisão do quadro para atualizar os demais acessos na sincronização seguinte.

As cores salvas pelo administrador tornam-se o padrão compartilhado. O fundo continua pessoal. Perfis comuns não podem substituir as cores compartilhadas por cores pessoais. As alterações incrementam a revisão e são recarregadas automaticamente pelos clientes quando não há edição pendente bloqueando a sincronização. Etiquetas permanecem compartilhadas pela configuração do quadro.

## Revisão

O painel do cartão mostra os estados dos votos, sem botões de aprovar ou rejeitar. Para votar, Lúcio ou Mateus move o cartão da aprovação para Aprovado no quadro (ou escolhe o destino no seletor de status). O servidor autentica a identidade, verifica a rodada, registra o voto e mantém o cartão em Aprovação enquanto faltar o outro voto. A interface mostra uma notificação no canto inferior direito informando quem falta. Repetir o mesmo voto não substitui o voto do outro revisor.

Somente Lúcio e Mateus podem enviar para Ajustar; o administrador mantém sua exceção explícita. Compras continuam com a aprovação da arte e do orçamento pelo Lúcio. A aprovação de orçamento usa seu fluxo específico. A verificação ortográfica automática também pode encaminhar para Ajustar.

## Cartões e arquivos

O botão de fechar do cartão diz apenas Fechar; o salvamento continua automático ao fechar ou clicar fora. Salvamentos rotineiros não exibem confirmação. Comentários enviados pelo formulário são salvos automaticamente.

A linha do tempo fica acima do formulário e mostra os registros antigos primeiro e os recentes por último. A rolagem inicia no fim e permite subir para ler o histórico; o formulário permanece abaixo.

O link Baixar arquivo dos anexos passa pela rota privada do servidor e usa Content-Disposition attachment com o nome original. O arquivo continua no Drive, sem criar um link público. O comportamento final de download/abertura é controlado pelo navegador do computador ou celular.

## Verificação

Testes de perfis: `tests/profiles-api.cjs`. Os testes de aprovação HTTP incluem movimentação para Ajustar e recusa de Farias. Testes de cores, anexos, sessões e demais fluxos continuam na suíte `tests/run-workflow.cjs`.

A conferência visual automatizada depende do controle de navegador habilitado no Work; não deve ser confundida com os testes de API e compilação.

Teste publicado em 29/10/2026: no cartão identificado como TESTE DRIVE CENTRAL, o primeiro movimento por Mateus registrou apenas seu voto e manteve Aprovação; o segundo por Lúcio aprovou. Uma tentativa de Farias enviar para Ajustar retornou HTTP 403; a de Lúcio funcionou. A edição de perfis por Farias retornou HTTP 403. O download privado retornou HTTP 200 e Content-Disposition attachment com nome original. As cores retornadas às contas de administrador e Mateus coincidiram. Nenhum cartão real foi usado nesse teste.
