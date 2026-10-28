# Arquivos diretos no Drive

A prévia Cloudflare habilita a integração somente no endereço externo autorizado; Sites permanece desativado. O acesso do site segue por e-mail e senha compartilhada. Conectar Drive é uma autorização Google separada, temporária, com escopo drive.file. Tokens ficam apenas em memória, não são enviados ao banco nem persistidos em localStorage. Sair limpa essa autorização.

Cada envio abre o seletor de pasta, sugerindo empresa e tipo (referência ou arte final). O navegador envia os bytes diretamente à API Google Drive. Não passa por R2 nem por /api/files e não ativa armazenamento Cloudflare. O arquivo entra no rascunho somente após confirmação do Drive; salvar a tarefa guarda o vínculo no banco. A arte final tem prioridade como capa, com referência como alternativa. Remover um anexo do cartão não exclui o arquivo do Drive.

IDs pré-alocados e consulta ao mesmo ID/tamanho reconciliam uma resposta perdida sem repetir automaticamente o envio. Falhas parciais preservam os arquivos já confirmados; o usuário vê quais precisam de conferência. Não se alteram permissões de compartilhamento das pastas ou arquivos.

Imagens privadas são lidas pelo navegador com a autorização Google e exibidas por URLs temporárias de objeto, revogadas ao desmontar/trocar conexão. Imagens acima de 10 MB exigem carregamento explícito nos detalhes. Outros formatos usam a visualização autenticada do Drive em iframe e link para abrir no Drive. Cada conta precisa ter acesso Google à pasta. Apenas visualizar os cartões no site não concede acesso aos arquivos Google.

## Configuração Google Cloud realizada em 28/10/2026

Cliente Planejamentos Marketing Web no projeto planejamentos-marketing: adicionada origem https://planejamentos-marketing-teste-gratis.marketinglukegroup.workers.dev, preservando Sites e GitHub. Chave de API existente: adicionado o mesmo domínio com /* aos referenciadores HTTP, preservando as entradas anteriores e a restrição Google Picker API. Não foi ativado plano pago nem alterada a API permitida. Google pode levar alguns minutos para propagar as alterações.

## Validação

TypeScript e suíte de fluxo passaram, incluindo testes de bytes exatos, pasta/tipo, confirmação, leitura privada, cancelamento, falha parcial e rejeição de URLs arbitrárias. A prévia publicada apresenta Conectar Drive e os fluxos de anexos. O teste real de autorização e envio depende de a pessoa concluir a autorização da conta Google no navegador. Não considerar upload real ou visualização entre contas confirmados antes desse teste.
