# Revisão ortográfica das artes

A versão externa na Cloudflare analisa automaticamente imagens PNG, JPEG e WebP adicionadas como **arte final**, depois que o vínculo do arquivo foi salvo no cartão. Referências não são analisadas. Arquivos continuam privados na conta central do Drive.

## Comportamento

- Uma fila persistente inicia a primeira revisão imediatamente e processa os demais cartões a cada minuto. O usuário pode fechar o navegador.
- O modelo configurado é Gemini 3.5 Flash-Lite. A chave `GEMINI_API_KEY` fica em um segredo do Worker, nunca no navegador, código ou GitHub.
- Possíveis erros encaminham para **Ajustar**, reiniciam a aprovação da arte e aparecem no histórico e no painel com arquivo, trecho e sugestão. A capa recebe desfoque e um aviso.
- Nenhum erro detectado não aprova a arte: os votos humanos continuam necessários. A IA pode deixar passar erros ou gerar alertas incorretos.
- Lucio, Mateus e administradores podem descartar alertas; em compras, apenas Lucio e administradores. Descartar não aprova nem move o cartão automaticamente.
- Falta de chave, indisponibilidade, resposta inválida, cota esgotada ou texto ilegível deixam **Verificação pendente**, preservando a etapa. O botão Reanalisar permite nova tentativa após um minuto.
- PDF, vídeos e arquivos antigos sem registro central precisam de revisão manual. Imagens antigas não são analisadas retroativamente sem ação do usuário.
- Para substituir uma versão errada, remova seu vínculo dos anexos da arte e adicione a versão corrigida; arquivos mantidos como arte final continuam fazendo parte da revisão. Os arquivos do Drive não são excluídos.

## Limites e concorrência

Até 6 imagens, 6 MB por imagem e 10 MB no total por cartão. Há um teto próprio de 40 solicitações diárias (UTC), além dos limites do Google. Não há troca automática para serviços pagos nem ativação de faturamento por este código. A conta/projeto da chave deve continuar no nível gratuito do Google.

Resultados são vinculados à lista exata de arquivos e aplicados com revisão CAS. Uma revisão antiga não substitui a arte atual. Edições comuns, inclusive administrativas, não podem fabricar ou apagar o resultado do serviço; o descarte usa rota autenticada própria. A edição de outros campos durante a análise é preservada.

## Verificação

`tests/spelling.mjs` e `tests/spelling-api.cjs` cobrem autenticação, origem, permissões, quota, repetição, falhas, leitura ilegível, retorno inválido, alterações concorrentes, troca de arte e bloqueio de aprovação. O teste real usa um cartão e arquivo claramente identificados como TESTE ORTOGRAFIA. A conferência visual no navegador depende do controle do navegador habilitado no Work.
## Teste publicado em 28/10/2026

O teste real no cartão `fc2f2804-4694-4972-8813-bc8d664757cc` confirmou o envio ao Drive central, a execução automática após salvar o anexo, a identificação de `PROMOSSAO → PROMOÇÃO` e `APROVEITI → APROVEITE` e a movimentação para `ajustar ⚠️`. O cartão e o arquivo estão identificados como teste. Falhas anteriores de disponibilidade preservaram a etapa original e exibiram verificação pendente. O desfoque visual ainda não foi conferido em navegador, pois o controle local está desativado no Work.
