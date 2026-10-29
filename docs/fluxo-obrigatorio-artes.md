# Fluxo obrigatório das artes

Lúcio, Mateus, Farias e Luiz podem criar demandas em A Fazer Farias ou A Fazer Luiz. A criação não dá permissão para editar a execução de outra pessoa.

Sequência: A Fazer → Em Andamento → Aprovação da empresa → Aprovado → Concluído e Postado. Farias e Luiz iniciam a execução e encaminham para revisão. Lúcio e Mateus registram seus votos na etapa de aprovação. Um voto negativo envia para Ajustar; dois positivos enviam para Aprovado. Ajustar retorna para Em Andamento antes de nova aprovação.

Arraste, edição de status, lote, desfazer/refazer e gravações diretas usam a proteção do servidor. Nenhuma gravação comum pode entrar em Aprovado, mesmo com votos antigos ou perfil administrador. A rota de votos continua sendo a única entrada para essa etapa, vinculada à identidade e à rodada vigente.

Lúcio e Mateus não podem enviar, inserir links ou alterar anexos nas etapas Em Andamento e Aprovação. A permissão é conferida antes do upload e novamente ao vincular o arquivo, caso a etapa mude durante a transferência.

Todos os quatro podem conduzir as etapas finais. Concluir exige a aprovação positiva dos dois. Stand-by é permitido a partir de qualquer etapa e registra a etapa anterior no servidor. A retomada é nessa mesma etapa; um cartão pausado depois de aprovado também pode ser concluído, se os votos continuam válidos. Assim, Stand-by não permite contornar a revisão.

O fluxo específico de compras e a aprovação de orçamento apenas por Lúcio foram preservados. Cartões antigos não foram movidos ou aprovados automaticamente por esta atualização. Um cartão antigo em Stand-by sem etapa de retorno registrada precisa de conferência antes da retomada.

Testes em `tests/art-flow.mjs` verificam criação pelos quatro, sequência, negativa, votos, restrição de anexos, proteção administrativa e retomada de Stand-by. Os testes de áreas, roteamento e destinos personalizados foram atualizados para a regra atual.
