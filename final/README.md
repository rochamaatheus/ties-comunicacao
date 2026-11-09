# Ties Comunicação: design final

Página estática baseada na ideia 3 aprovada, com os vetores originais da marca, fontes locais e CSS compilado.

- `index.html`: página principal. Textos e layouts das seções seguem o documento de ajustes da cliente de 06/11/2026.
- `privacidade.html`: funcionamento do contato e da hospedagem.
- `assets/final.css`: acabamento, estados e responsividade.
- `assets/site.js`: menu, lista de serviços (abre um por vez e leva ao formulário com o serviço escolhido), FAQ e composição da mensagem de WhatsApp.
- Motion: entrada do topo, letreiro de serviços com pausa, revelações ao rolar, traço à mão desenhado, linha do tempo traçada e acordeões animados. Tudo fica estático com `prefers-reduced-motion`.
- `assets/motion.js`: scroll suave (Lenis, em `assets/vendor`) e cenas guiadas pela rolagem (variável `--p` no CSS). Sem o script ou com movimento reduzido, tudo aparece no estado final.
- **O CSS é embutido no `index.html`.** Edite `assets/site.css`, `final.css` ou `fonts.css` e rode `python3 tooling/build_inline.py` (na pasta do projeto) antes de publicar.
- `assets/site.css`: utilitários Tailwind compilados, sem dependência de CDN em runtime.

O formulário prepara a mensagem e abre o WhatsApp. O visitante confirma o envio no próprio aplicativo. Não existe envio de e-mail ou armazenamento de leads nesta versão.

Blog: três espaços de publicação marcados como em preparação. CMS, artigos, cases e depoimentos reais dependem de uma etapa posterior e dos materiais da cliente.

A apresentação anterior continua disponível na raiz do repositório; esta versão usa `/final/` e está marcada como `noindex,nofollow`.
