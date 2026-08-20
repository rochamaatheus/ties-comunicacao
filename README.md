# Ties Comunicação — 3 ideias de layout (apresentação)

Apresentação da **Agência Kamino** para Fernanda Thiesen Furtado (Ties Comunicação).
Hub com três ideias de layout da home, para a cliente escolher **partes** de cada uma.

**As três páginas estão em cinza de propósito.** O layout é exatamente o mesmo da versão
com design, só que sem a paleta da marca, sem a tipografia definitiva e sem o tratamento
das fotos. Assim a conversa fica sobre estrutura, e não sobre acabamento. A versão com
design está congelada em `../apresentacao-v1-design/` e é dela que sai o desenho final.
A receita para regerar o cinza a partir dela está em `../APRESENTACAO-STATUS.json`.

## Estrutura

```
index.html                       hub da apresentação (Agência Kamino)
ideias/ideia-1-direta.html       Ideia 1 — "Direta e assertiva"   · base: cdn.com.br
ideias/ideia-2-editorial.html    Ideia 2 — "Editorial e serena"   · base: omc.com
ideias/ideia-3-mosaico.html      Ideia 3 — "Bandas e mosaico"     · base: prefacio.com.br
assets/preview-1..3.jpg          prints de página inteira usados nos cards do hub
assets/fotos/foto-XX.jpg         fotos da cliente (redimensionadas p/ web, máx. 1800px)
assets/kamino-logo.webp          marca da agência (hub e rodapé)
```

Fonte dos layouts: `../layouts/*.html` do projeto local
(`Documentos/Projetos/Trabalho/clientes/fernanda_tie`). Este repositório é **só a versão
publicada** — as alterações continuam sendo feitas nos arquivos do projeto e copiadas
para cá.

## O que existe no hub

- Aviso de que as 3 páginas são ideias, não a proposta final.
- Como olhar: 3 passos curtos, com o pedido de escolher partes das três e o retorno pelo WhatsApp.
- 4 frases de exemplo de retorno, incluindo uma de crítica.
- Cards das 3 ideias com print de página inteira, site que serviu de base e 4 pontos de cada.
- Lista do que ainda não está pronto (textos, depoimentos, números, fonte, blog, formulário).

Sem formulário, sem quadro de escolha e sem travessão em nenhum texto visível, a pedido
do cliente: ela dá o retorno direto pelo WhatsApp, em linguagem simples.

## Detalhes técnicos

- Site estático puro, publicado por **GitHub Pages** a partir da branch `main` (raiz).
- As três ideias usam Tailwind via CDN e Google Fonts — precisam de internet para renderizar.
- Cada ideia recebe uma barra flutuante de navegação (`.kmn-bar`, injetada antes de
  `</body>`) que **não faz parte do layout** e deve sair da versão final.
- `index.html` tem `noindex, nofollow`; o repositório é público apenas porque o GitHub
  Pages gratuito exige — a página não é indexada por buscadores.

## Ao atualizar as ideias

1. Editar a versão COM DESIGN em `../apresentacao-v1-design/ideias/`.
2. Copiar para `ideias/` e rodar de novo a neutralização de cor e fonte
   (passo a passo em `../APRESENTACAO-STATUS.json`, campo `como_gerar_a_versao_cinza`).
3. Regerar os prints `assets/preview-1..3.jpg` (página inteira em 1440px, reduzida para 760px).
4. `git commit` + `git push` quando o repositório novo existir.
