# 🎮 Carteirinha Gamer — Visual V5

A **Carteirinha Gamer** é um projeto web para registrar a jornada de cada jogador: biblioteca, tempo de jogo, conquistas, favoritos, avaliações, perfil público e integração com a Steam.

## ✨ Destaques da V5

- Dark mode gamer com neon roxo, azul e rosa
- Central Gamer redesenhada
- Banner cartoon gamer com texto em HTML para evitar cortes
- 12 personagens ilustrados selecionáveis
- Ícones próprios em SVG
- Mini Carteirinha no estilo de cartão gamer
- Carteirinha completa refinada
- Compatibilidade visual com avatares antigos
- Tema aplicado às páginas de Biblioteca, Perfil, Comunidade, Histórico, configurações e formulários

## 🎭 Personagens

Os usuários podem escolher um personagem em **Perfil**. A escolha fica salva junto ao perfil local e também pode aparecer no perfil público.

Os personagens disponíveis incluem estilos como Casual, Competitivo, Survival, RPG, Futurista, Retrô, Streamer, Indie, Aventura, Sci-Fi, Stealth e Co-op.

## 🎮 Recursos do projeto

- Biblioteca pessoal de jogos
- Cadastro manual
- Pesquisa de jogos via RAWG
- Tempo jogado em horas e minutos
- Conquistas
- Histórico de alterações
- Perfil Gamer
- Carteirinha pública
- Comunidade
- Cloudflare D1
- Cloudflare Worker
- Importação da biblioteca Steam
- Importação de tempo e conquistas da Steam

## 🧰 Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage
- GitHub Pages
- Cloudflare Workers
- Cloudflare D1
- RAWG API
- Steam Web API

## 🌐 Projeto online

https://paulorr2000.github.io/carteirinha-gamer/

## ⚠️ Segurança

As chaves da RAWG e da Steam não devem ser colocadas no frontend ou no GitHub. Elas permanecem protegidas como Secrets/variáveis do Cloudflare Worker.

## 🚧 Status

Projeto em desenvolvimento e testes com usuários.

---

## Hub Gamer V2 — V5.9

A página inicial agora possui um Hub Gamer com áreas para dados pessoais, notícias, promoções, lançamentos, descoberta de jogos e atalhos para Steam, Epic Games e GOG.

A interface está preparada para uma próxima etapa de backend que poderá alimentar notícias, calendário de lançamentos e promoções em tempo real sem expor chaves no frontend.

## V6.2 — conta e sincronização

A V6.2 adiciona cadastro, login, sessão e save em nuvem usando o Cloudflare Worker + D1 já usados pelo projeto. Para ativar as novas rotas no site publicado, faça deploy de `worker-v6.2-login-cloud.js` no Worker atual. Veja `LEIA-ME-V6.2.txt`.
