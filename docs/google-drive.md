# Arquivos do Google Drive — Planejamentos

Esta integração adiciona a página autenticada /arquivos ao quadro de marketing. As nove unidades possuem duas pastas lógicas: REFERÊNCIAS e ARTES FINALIZADAS. O aplicativo lista somente arquivos que estão diretamente dentro dessas pastas, possibilitando baixar e enviar arquivos manualmente.

## Escopo e permissões

- A lista de empresas é fixa no código; os respectivos IDs do Google Drive são descobertos pelo nome das pastas sob a raiz configurada.
- Administradores e editores vinculados a uma pessoa no quadro podem **ver e enviar arquivos em todas as nove unidades**. Os visualizadores não podem acessar esta seção. Confirme se essa abrangência está de acordo com a política do cliente antes de ativar.
- O servidor valida que o arquivo solicitado está dentro da pasta autorizada antes de iniciar o download.
- Não existe movimentação automática entre REFERÊNCIAS e ARTES FINALIZADAS, e o código não exclui arquivos.
- A integração não muda o Kanban, a D1 ou os anexos R2, que continuam suportando até 100 MB. Os novos uploads para Google Drive têm limite de 10 MB.
- Subpastas adicionais são abertas na interface do próprio Google Drive e exigem que o usuário tenha permissão do Google.

## Configuração privada necessária

Antes de disponibilizar a página em produção, prepare uma **conta de integração dedicada** sem acesso a outros clientes ou arquivos sensíveis, autorizada como Editora somente nas pastas necessárias. A conta utilizada dentro do ChatGPT não transfere automaticamente suas credenciais para o aplicativo.

1. Crie ou use um projeto Google Cloud autorizado pelo cliente e habilite **Google Drive API**.
2. Configure a tela de consentimento OAuth e um cliente OAuth adequado ao fluxo escolhido. Autorize offline a conta dedicada; obtenha um refresh token seguindo o OAuth do Google.
3. Na hospedagem do site, defina como **secrets de servidor**, nunca no GitHub ou no navegador:
   - GOOGLE_DRIVE_CLIENT_ID — identificador OAuth
   - GOOGLE_DRIVE_CLIENT_SECRET — segredo do cliente OAuth
   - GOOGLE_DRIVE_REFRESH_TOKEN — refresh token da conta de integração
   - GOOGLE_DRIVE_ROOT_FOLDER_ID — identificador da pasta principal Planejamentos — Marketing
4. A implementação atual requer o escopo https://www.googleapis.com/auth/drive. **Esse escopo pode permitir acesso a todos os arquivos acessíveis à conta**, mesmo que o aplicativo limite as rotas à pasta configurada. Restrinja a conta dedicada, monitore a autorização, e revogue o token se houver exposição.
5. Execute node tests/google-drive-integration.mjs, npx tsc --noEmit, npm run build. Faça o primeiro teste integrado com um arquivo sem valor comercial e confirme a política de acesso da equipe.

### Observações operacionais

Sem os secrets, somente a seção Arquivos responde com erro 503; o Kanban continua disponível. Erros de autenticação do Google não exibem segredos ao usuário. A listagem é paginada e não permite excluir, mover ou renomear arquivos. Google Docs/Sheets/Slides nativos são baixados como PDF, quando o Google permitir a exportação. Arquivos muito grandes podem ser limitados pelo provedor de hospedagem.

Não use este código com credenciais OAuth pessoais de colaboradores que também tenham outros arquivos comerciais ou pessoais.

## Segurança e dados

O repositório público contém somente nomes de variáveis de ambiente e regras de pasta, não tokens nem identificadores de arquivos de clientes. Na hospedagem, é necessário proteger os secrets e controlar o acesso dos membros do Kanban. O Google Drive mantém a posse dos arquivos e a gestão de compartilhamento original.
