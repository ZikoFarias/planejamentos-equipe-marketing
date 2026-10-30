# Efeito de movimentação

Referência: vídeo fornecido pelo usuário, duração 10,37 segundos. Quadros locais foram examinados sem alterar o arquivo original.

- Prévia com rotação de -10 graus (inclinação para a esquerda), opacidade total, pequena ampliação e sombra. O arraste pelo cartão e pela alça é controlado por eventos de ponteiro, sem a imagem de arraste nativa do navegador. A prévia acompanha o cursor até soltar/cancelar.
- A coluna sob o cursor expande, abre se estiver recolhida e reserva um espaço proporcional à altura do cartão. As aprovações por empresa sem cartões ficam ocultas inclusive durante o arraste; só aparecem quando há cartões aguardando aprovação naquela empresa.
- O cartão original fica completamente invisível durante o arraste, preservando apenas seu espaço no layout; a prévia não intercepta o destino do drop.
- Após uma movimentação gravada, o cartão retorna à posição reta em 230 ms. Preferência de movimento reduzido remove rotação e animação.
- Nenhuma regra de aprovação, atribuição ou permissão foi alterada. TypeScript, build e suíte completa passaram. A validação visual interativa permanece pendente porque o navegador está desativado no Work.
- `tests/pointer-drag.cjs` confirmou limiar de início, prévia persistente, acompanhamento do cursor, destino, soltura, cancelamento com Escape e proteção dos controles de data. Usa happy-dom temporário em `.sites-runtime/drag-test-tools` (ou caminho `DOM_TEST_MODULE`), sem incluir dependências no aplicativo.

As senhas continuam armazenadas apenas como verificadores criptográficos. Não há recuperação do texto original; o administrador pode redefini-las no editor de cada membro.
