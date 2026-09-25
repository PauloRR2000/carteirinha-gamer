# 🎮 Carteirinha Gamer

Um projeto web para jogadores organizarem sua vida gamer em um só lugar.

A **Carteirinha Gamer** permite cadastrar jogos, acompanhar tempo jogado, conquistas, avaliações e experiências pessoais, além de criar um perfil gamer público e importar informações diretamente da Steam.

🌐 **Acesse o projeto:**  
https://paulorr2000.github.io/carteirinha-gamer/

---

## 🕹️ Sobre o projeto

A ideia da Carteirinha Gamer nasceu como um projeto de estudo e prática de desenvolvimento web.

O objetivo é criar uma espécie de identidade gamer pessoal, onde cada jogador possa registrar os jogos que já jogou e acompanhar informações como:

- Nota pessoal
- Tempo jogado
- Status do jogo
- Conquistas
- Plataforma utilizada
- Recomendação
- Personagem favorito
- Pontos positivos e negativos
- Comentários pessoais

O projeto continua em desenvolvimento e novas funcionalidades estão sendo adicionadas gradualmente.

---

# ✨ Funcionalidades

## 📚 Biblioteca Gamer

O jogador pode manter uma biblioteca pessoal com seus jogos.

Cada jogo pode possuir:

- Nome
- Nota de 0 a 10
- Horas e minutos jogados
- Status
- Conquistas obtidas
- Total de conquistas
- Plataforma utilizada
- Categorias
- Recomendação
- Replay
- Personagem favorito
- Pontos positivos
- Pontos negativos
- Comentário pessoal

Também é possível:

- Pesquisar jogos
- Filtrar por status
- Filtrar por plataforma
- Editar registros
- Excluir jogos
- Visualizar a ficha completa de cada jogo

---

## 🔎 Catálogo de jogos via RAWG

Ao adicionar um jogo manualmente, a Carteirinha Gamer pode pesquisar informações através da **RAWG Video Games Database API**.

A integração pode preencher automaticamente informações públicas como:

- Nome do jogo
- Capa
- Data de lançamento
- Plataformas disponíveis
- Categorias
- Desenvolvedora
- Publicadora
- Metacritic
- Nota RAWG

O jogador continua escolhendo manualmente em qual plataforma realmente jogou.

---

## 🎮 Integração com Steam

A Carteirinha Gamer possui integração com a **Steam Web API**.

O jogador pode informar seu perfil Steam e carregar sua biblioteca automaticamente.

Atualmente a integração permite importar:

- Jogos da biblioteca Steam
- Tempo jogado
- Conquistas obtidas
- Total de conquistas
- Plataforma PC

A importação também identifica jogos que já existem na Carteirinha para evitar duplicações sempre que possível.

Informações pessoais como:

- Nota
- Comentário
- Recomendação
- Personagem favorito
- Pontos positivos
- Pontos negativos

não são substituídas automaticamente pela Steam.

---

## 🏆 Conquistas Steam

A integração consulta individualmente as conquistas dos jogos selecionados.

Exemplo:

```text
Resident Evil 4
Tempo: 13h 28min
Conquistas: 46/46
Plataforma: PC
