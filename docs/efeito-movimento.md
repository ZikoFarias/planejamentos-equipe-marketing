# Efeito de movimentação

Referência: vídeo fornecido pelo usuário, duração 10,37 segundos. Quadros locais foram examinados sem alterar o arquivo original.

- Prévia com rotação de -10 graus (inclinação para a esquerda), opacidade total, pequena ampliação e sombra. O arraste pelo cartão e pela alça é controlado por eventos de ponteiro, sem a imagem de arraste nativa do navegador. A prévia acompanha o cursor até soltar/cancelar.
- A coluna sob o cursor expande, abre se estiver recolhida e reserva um espaço proporcional à altura do cartão. As aprovações por empresa sem cartões ficam ocultas inclusive durante o arraste; só aparecem quando há cartões aguardando aprovação naquela empresa.
- O cartão original aparece como marcação discreta (20% de opacidade), preservando seu espaço no layout; a prévia não intercepta o destino do drop.
- A origem nunca ganha placeholder extra. Ao soltar, a prévia começa imediatamente a deslizar até o espaço de destino em 320 ms, enquanto a gravação acontece em paralelo. Se necessário, ajusta suavemente até a posição real confirmada; o cartão no destino fica oculto apenas durante esse trajeto para evitar duplicação. Em falha ou movimentação sem alteração, a animação retorna à posição real original. Preferência de movimento reduzido remove rotação e animação.
- Nenhuma regra de aprovação, atribuição ou permissão foi alterada. TypeScript, build e suíte completa passaram. A validação visual interativa permanece pendente porque o navegador está desativado no Work.
- `tests/pointer-drag.cjs` confirmou limiar de início, prévia persistente, acompanhamento do cursor, destino sem expansão da origem, prévia persistente durante a confirmação, trajeto até o destino sem duplicação, soltura, cancelamento com Escape e proteção dos controles de data. Usa happy-dom temporário em `.sites-runtime/drag-test-tools` (ou caminho `DOM_TEST_MODULE`), sem incluir dependências no aplicativo.

As senhas continuam armazenadas apenas como verificadores criptográficos. Não há recuperação do texto original; o administrador pode redefini-las no editor de cada membro.
