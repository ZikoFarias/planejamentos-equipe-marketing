# Google Drive — implantação externa

## Estado

Implementação preparada e desativada por padrão (`app/drive-config.ts`). Não foi ativada no ChatGPT Sites: a descoberta obrigatória de elegibilidade das integrações não está disponível nesta sessão. Não altera o login atual nem migra o banco. GitHub Pages sozinho não executa as APIs autenticadas do quadro: concluir a hospedagem do backend e a migração de autenticação antes de habilitar o botão na versão externa.

## Configuração do Google Cloud fornecida pelo proprietário

- Projeto: `planejamentos-marketing`.
- Cliente OAuth Web e chave pública de navegador em `app/drive-config.ts`; nenhum segredo OAuth no código.
- APIs: Google Drive API e Google Picker API.
- Permissão solicitada: `https://www.googleapis.com/auth/drive.file`.
- Origens registradas: o domínio atual do site e `https://zikofarias.github.io`.
- Chave restrita a Google Picker API; referências HTTP dos domínios registrados e `https://docs.google.com/*`. As chamadas diretas ao Drive usam o token OAuth, sem a chave de API.
- Confirmar o número do projeto no Console: `1091183989197` foi inferido do ID do cliente fornecido e ainda precisa de verificação visual.
- No modo Teste, cadastrar cada conta usada em Público-alvo / Usuários de teste.

## Funcionamento

Na versão externa habilitada, adicionar arquivos já inicia o backup. Primeiro o usuário conecta sua conta Google no painel de anexos. Em cada envio seleciona os arquivos, escolhe Referência ou Arte finalizada e confirma uma pasta no Google Picker; não precisa clicar em Salvar no Drive arquivo por arquivo. Todos os arquivos do mesmo envio usam a pasta escolhida. Cancelar o seletor não adiciona nem copia arquivos. A preferência anterior de escolher a pasta a cada envio foi mantida.

Cada arquivo é anexado ao cartão e imediatamente copiado ao Drive. A interface passa de Backup em andamento para Backup confirmado somente depois da confirmação do Google. Se uma cópia falhar, o arquivo local é preservado com Backup não confirmado e mensagem de erro; os demais arquivos do lote continuam. O vínculo e o aviso são gravados ao salvar a tarefa. Não há retentativa automática de gravações incertas; a ação Tentar backup no Drive permite nova tentativa explícita. Links externos não disparam cópias.

As pastas já criadas por empresa são apenas o local inicial sugerido. A escolha final pode ser outra pasta, e a conta deve ter permissão para gravar nela. O backup exige a aba aberta e uma autorização Google válida. Não é uma sincronização desassistida do servidor após fechar o navegador.

O token é mantido somente em memória da aba até próximo de expirar; não é salvo no banco, armazenamento do navegador ou repositório. Recarregar exige nova conexão Google; uma autorização recusada ou expirada precisa de reconexão explícita. Os bytes saem do navegador diretamente para o Google. A cópia não altera compartilhamento, não apaga o anexo nem move arquivos antigos. Salvar a tarefa registra a classificação e o vínculo do Drive; cancelar o cartão não desfaz uma cópia já criada no Drive. Links externos não são baixados por proxy.

O envio usa uma sessão de upload retomável e um ID previamente reservado. Se a resposta se perder, consulta esse ID antes de informar que o envio não pôde ser confirmado. Não repete gravações automaticamente. Antes de uma nova tentativa, o usuário deve conferir a pasta indicada.

## Verificação pendente antes de ativar

1. Concluir hospedagem externa com APIs, banco e login Google autenticados; preservar as permissões da equipe.
2. Confirmar número do projeto e origens do endereço definitivo; testar `drive.file` com os usuários de teste.
3. Habilitar `driveConfig.enabled` somente nessa versão externa.
4. Autorizar conta real, adicionar duas artes sem acionar Salvar no Drive manualmente, cancelar seleção sem enviar, selecionar duas pastas distintas em envios consecutivos e conferir bytes/nome/pasta no Drive.
5. Validar erro de pasta sem gravação, sessão expirada, rede interrompida e ausência de duplicação ao confirmar resposta perdida.
6. Salvar e reabrir a tarefa para conferir classificação e link. Não foi feito envio real durante a implementação.

Referências: https://developers.google.com/workspace/drive/picker/guides/web-picker e https://developers.google.com/workspace/drive/api/guides/manage-uploads .
