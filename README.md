# Aplicação Front-End: Febre Pokémon - Anos 90 & 2000

Projeto desenvolvido para a disciplina de **Programação Web Front-End**, atendendo integralmente às diretrizes de consumo assíncrono de API e manipulação dinâmica de elementos via JavaScript.

---

## 🎯 Objetivo do Projeto
Construir um Web Site temático sobre um dos maiores sucessos dos anos 90 e 2000 (**Pokémon**), consumindo em tempo real dados da [PokéAPI](https://pokeapi.co/), gerando os cards dos personagens de forma 100% dinâmica via JavaScript com manipulação do DOM.

---

## 🛠️ Tecnologias Utilizadas
- **HTML5**: Estrutura semântica (`<header>`, `<section>`, `<article>`, `<footer>`, etc.).
- **CSS3 Moderno**: 
  - Layouts flexíveis e responsivos com **Flexbox** e **CSS Grid**;
  - Variáveis de cores globais (`:root`);
  - Tipografia nostálgica via Google Fonts (*Press Start 2P*, *Rajdhani*, *Rubik*);
  - Animações e micro-interações (`@keyframes`, `backdrop-filter`).
- **JavaScript (Vanilla / ES6+)**:
  - Consumo assíncrono de API via `fetch()` e tratamento de erros (`try/catch`);
  - Criação de elementos dinâmicos através de `document.createElement()`, `appendChild()` e `DocumentFragment`;
  - Filtro em tempo real (busca por nome e seleção por tipos de criatura);
  - Modal interativo com barras de progresso de atributos de batalha;
  - Paginação com botão de carregamento incremental ("Carregar Mais").

---

## 📁 Estrutura de Arquivos
```text
├── index.html     # Página inicial estruturada e pronta para receber os dados
├── style.css      # Folha de estilo completa, responsiva e com identidade visual anos 90/2000
├── app.js         # Lógica de consumo da PokéAPI, criação dinâmica de cards e filtros
└── README.md      # Documentação explicativa do projeto
```

---

## 🚀 Como Executar o Projeto

1. Baixe ou clone este repositório em sua máquina.
2. Abra o arquivo [index.html](file:///c:/Users/samir/OneDrive/Desktop/web-programming-for-front-end-26/index.html) em qualquer navegador moderno (Google Chrome, Microsoft Edge, Mozilla Firefox).
3. Alternativamente, você pode utilizar extensões como o **Live Server** no VS Code para servir localmente.

---

## 📋 Atendimento aos Requisitos da Atividade
- [x] **Desenvolvido exclusivamente com HTML, CSS e JavaScript** (sem bibliotecas externas pesadas ou frameworks).
- [x] **Tema focado em desenho de sucesso dos anos 90 e 2000** (Pokémon).
- [x] **Consumo de API pública em tempo real** através de `fetch()`.
- [x] **Área de Cards gerada 100% dinamicamente pelo JavaScript** (`createElement` e `appendChild`), mantendo o HTML limpo.
- [x] **Interface responsiva** para celulares, tablets e desktops.
- [x] **Pesquisa e filtros adicionais** para melhorar a experiência do usuário.

