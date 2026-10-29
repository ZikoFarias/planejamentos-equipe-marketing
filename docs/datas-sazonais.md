# Datas sazonais no calendário

- Os cabeçalhos dos dias abrem um menu sobre a grade, com datas sazonais cadastradas para o dia e as empresas indicadas. Os dias com sugestões exibem uma contagem.
- O seletor de empresa filtra as sugestões. A opção inicial permite escolher a empresa posteriormente dentro do cartão. Cada sugestão tem fonte consultável.
- Ao clicar, abre um cartão novo com título sazonal, início/entrega no dia selecionado e contexto na descrição. Quando há empresa escolhida, recebe sua etiqueta e o designer conforme o roteamento existente (postos/ervateira: Luiz; demais: Farias). Sem empresa, preserva a área Luiz quando aplicável; caso contrário, prepara para Farias. A revisão e os participantes seguem o fluxo existente.
- Visualizadores podem consultar as sugestões/fontes, mas não criar cartões. Nenhum lançamento automático em lote é feito.
- A base é uma seleção editorial de datas relevantes para os negócios, não uma lista universal de todas as comemorações existentes. Dias sem sugestão mostram mensagem explícita. Datas locais e aniversários de empresas dependem de cadastro futuro.
- Datas móveis são calculadas por ano: segundo domingo de maio/agosto, Páscoa gregoriana, Carnaval, Sexta-feira Santa e Black Friday após a quarta quinta-feira de novembro. Relevância por empresa é uma escolha editorial.

Fontes consultadas em 29/10/2026:

- [Calendário Empreendedor do Sebrae Goiás](https://www.sebraego.com.br/calendario-empreendedor/).
- [Calendário da Secretaria de Indústria e Comércio de Goiás](https://goias.gov.br/industriaecomercio/calendario-de-datas-comemorativas/).
- [Calendário de trânsito do Contran](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10002023.pdf) e [Caminhoneiros — Ministério dos Transportes](https://www.gov.br/transportes/pt-br/assuntos/conteudo/caminhoneiros).
- [Dia do Chimarrão — Ministério do Turismo](https://www.gov.br/turismo/pt-br/assuntos/ultimas-noticia/chimarrao-e-celebrado-como-simbolo-da-cultura-gaucha/).
- [Trabalhador da construção civil — Agência Pará](https://www.agenciapara.com.br/noticia/23017/trabalhadores-da-construcao-civil-garantem-desenvolvimento-e-qualidade-de-vida-para-a-populacao).
- [Datas do Confea](https://www.confea.org.br/midias/anexo_0053.pdf), calendários oficiais e fontes individuais vinculadas na base.

Validação: TypeScript, build e suíte completa de fluxos passaram. `tests/seasonal-dates.mjs` cobre filtros, datas móveis entre anos, dias vazios, atribuição, título/data e criação sem aprovação antecipada. `tests/seasonal-menu.cjs` cobre abertura/seleção/filtro e bloqueio para visualizadores em DOM temporário happy-dom (`DOM_TEST_MODULE` opcional). Conferência visual no navegador não foi possível nesta sessão.
