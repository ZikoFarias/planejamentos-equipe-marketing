# Datas sazonais no calendário

- Os cabeçalhos abrem todas as datas cadastradas para o dia, sem filtro, indicação ou restrição por empresa.
- A base ampliada contém 361 ocorrências em 2026: datas gerais, profissionais, culturais, comerciais, de conscientização, regionais e datas móveis. É um catálogo de fontes identificadas, não uma afirmação de exaustividade de todas as comemorações existentes no mundo.
- A lista é compacta: mostra apenas os nomes. Passar o mouse ou focar pelo teclado abre um pop-up com título, data completa, categoria, contexto e fonte. O ícone de informação permite consultar os detalhes por toque. O pop-up fecha com a lista e ao selecionar um item.
- Clicar no nome abre um novo cartão com título, início e entrega preenchidos, sem atribuir uma empresa. A etiqueta de empresa é escolhida no editor do cartão. A área Luiz preserva seu designer; nos demais casos prepara para Farias. Aprovação, responsáveis fixos e permissões continuam no fluxo existente.
- Visualizadores podem consultar informações, mas não criar cartões.
- Datas móveis: Dia das Mães/Pais, Páscoa, Carnaval, Quarta-feira de Cinzas, Sexta-feira Santa, Corpus Christi, Black Friday, Cyber Monday, Ação de Graças (identificada como tradição dos EUA) e Dia do Programador (256º dia). Estações do ano conferidas para 2026–2030 em horário de Brasília.
- Não são reutilizadas datas móveis fixadas em um ano de um calendário fonte. Divergências evidentes entre fontes não foram replicadas automaticamente.

Fontes consultadas em 30/10/2026:

- [Calendário Empreendedor do Sebrae Goiás](https://www.sebraego.com.br/calendario-empreendedor/).
- [Calendário de datas comemorativas da Prefeitura de São José dos Pinhais](https://www.sjp.pr.gov.br/secretarias/secretaria-industria-comercio-e-servicos/datas-comemorativas/).
- [Estações do ano — IPMet/UNESP, dados IAG/USP](https://www.ipmet.unesp.br/4estacoes/4estacoes/ESTACOES_DO_ANO_DATAS.pdf).
- Fontes específicas já vinculadas nas datas originais (Ministérios, Confea, calendários oficiais).

Validação: TypeScript, build, suíte completa e teste DOM da lista passaram. Os testes verificam ausência de empresas e de filtro, base com mais de 300 entradas por ano, datas móveis/estações, duplicações, detalhes fora da lista, foco/hover, criação com um único argumento e acesso somente leitura. Nenhum cartão real foi criado para teste. Conferência visual interativa não executada nesta atualização.
