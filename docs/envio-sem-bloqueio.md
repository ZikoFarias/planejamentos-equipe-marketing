# Envio de imagens sem bloquear o quadro

Imagens selecionadas aparecem primeiro como prévia local, com indicação de envio pendente. Elas não são gravadas como links temporários no banco nem consideradas backup confirmado.

O navegador mostra o percentual de bytes enviados e depois **Confirmando no Drive**. A confirmação depende da resposta do servidor, não do indicador chegar a 100%.

O envio tem estado separado do salvamento do cartão. A pessoa pode fechar o cartão e trabalhar em outros cartões enquanto o arquivo termina de subir. A aba deve continuar aberta; enquanto houver transferência, sair/atualizar a página recebe o aviso normal do navegador e o botão Sair fica indisponível. Um lote de arquivos é enviado por vez.

Depois de confirmar os bytes e a pasta no Drive, o servidor vincula o arquivo ao cartão com CAS, preservando alterações feitas enquanto o envio ocorria. Não depende de uma segunda gravação do navegador para anexar o arquivo. A identidade e a permissão são verificadas novamente ao concluir, assim como a empresa do cartão. Um arquivo já confirmado não é duplicado pela etapa de vínculo.

O resultado recebido mantém eventuais edições locais ainda não salvas e preserva dados do servidor. Prévias locais temporárias são liberadas após dois minutos ou ao cancelar um envio não confirmado. Os originais enviados ao Drive continuam com seus bytes e qualidade preservados.

As consultas independentes de pasta e identificação do arquivo são feitas em paralelo, reduzindo uma etapa de espera antes da transferência. A revisão ortográfica continua na fila do servidor, depois do vínculo, sem travar a edição.

Testes: `upload-async.mjs` cobre vínculo após fechar o diálogo, concorrência, idempotência, acesso, empresa e mesclagem de rascunho. `upload-progress.mjs` cobre progresso, confirmação, cancelamento e separação do quadro dos metadados do anexo. O teste real usa apenas um cartão previamente identificado como TESTE DRIVE CENTRAL.

A velocidade de envio dos bytes ainda depende do tamanho do arquivo, da conexão e do Drive. A prévia local e a edição liberada não significam que o backup já terminou.

Uma alteração de revisão causada pela análise ou pelo upload permite uma única nova tentativa de salvamento, com comparação campo a campo. Votos, alertas e alterações em outros campos/cartões são preservados. Se o mesmo campo também mudou, ou se o cartão foi removido, o painel mantém o rascunho e informa o conflito; não há sobrescrita automática.

## Conferência publicada em 29/10/2026

O envio real de uma imagem de teste de 33.748 bytes levou cerca de seis segundos nesta amostra. Uma edição do cartão foi salva com HTTP 200 antes de terminar a transferência, o vínculo ocorreu sem uma segunda gravação do navegador e a leitura posterior confirmou bytes idênticos. Os 27 cartões foram mantidos. A amostra confirma o fluxo; não é uma comparação de velocidade com o upload do usuário nem substitui a conferência visual da interface.
