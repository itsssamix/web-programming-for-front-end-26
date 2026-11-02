/**
 * Aplicação Front-End: Catálogo Nostalgia 90 & 2000 (PokéAPI)
 * Desenvolvido exclusivamente com Vanilla JavaScript, Fetch API e manipulação do DOM.
 */

// ==========================================
// CONFIGURAÇÕES GLOBAIS E ESTADO DA APLICAÇÃO
// ==========================================
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const PAGE_SIZE = 24; // Quantidade de pokémons por página

const state = {
  offset: 0,
  isLoading: false,
  pokemonList: [],        // Todos os pokémons carregados até o momento
  filteredList: [],       // Pokémons filtrados por busca/tipo
  activeFilterType: 'all',
  searchQuery: ''
};

// Dicionário de cores para os tipos
const TYPE_COLORS = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  grass: '#78c850',
  electric: '#f8d030',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  steel: '#b8b8d0',
  fairy: '#ee99ac'
};

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const cardsGrid = document.getElementById('cardsGrid');
const statusContainer = document.getElementById('statusContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const detailModal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');

// ==========================================
// FUNÇÕES DE CONSUMO DA API (FETCH)
// ==========================================

/**
 * Busca a listagem básica e detalhada de Pokémons na API
 */
async function fetchPokemons(offset = 0, limit = PAGE_SIZE) {
  try {
    state.isLoading = true;
    updateLoadMoreButtonState(true);

    if (state.pokemonList.length === 0) {
      showStatusMessage('Carregando personagens da era de ouro...', 'loading');
    }

    const response = await fetch(`${API_BASE_URL}?offset=${offset}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} (${response.statusText})`);
    }

    const data = await response.json();

    // PokéAPI retorna apenas nomes e URLs no endpoint geral.
    // Usamos Promise.all para buscar os dados detalhados em paralelo.
    const detailsPromises = data.results.map(async (item) => {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`Falha ao obter detalhes de ${item.name}`);
      return await res.json();
    });

    const detailedPokemons = await Promise.all(detailsPromises);

    // Formata os dados no formato limpo para a aplicação
    const formattedPokemons = detailedPokemons.map(p => ({
      id: p.id,
      name: p.name,
      formattedId: `#${String(p.id).padStart(3, '0')}`,
      image: p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default,
      types: p.types.map(t => t.type.name),
      height: p.height / 10, // decímetros para metros
      weight: p.weight / 10, // hectogramas para quilogramas
      stats: p.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      }))
    }));

    // Acrescenta à lista geral
    state.pokemonList.push(...formattedPokemons);
    state.offset += limit;

    hideStatusMessage();
    applyFilters();

  } catch (error) {
    console.error('Erro ao buscar dados na API:', error);
    showStatusMessage('Não foi possível carregar os personagens. Verifique sua conexão e tente novamente.', 'error');
  } finally {
    state.isLoading = false;
    updateLoadMoreButtonState(false);
  }
}

// ==========================================
// CRIAÇÃO DINÂMICA DE CARDS VIA DOM
// (createElement, appendChild)
// ==========================================

/**
 * Cria individualmente o elemento HTML do Card via JavaScript
 * atendendo rigorosamente ao requisito do trabalho.
 */
function createPokemonCard(pokemon) {
  // 1. Container principal do Card
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-id', pokemon.id);

  // 2. Caixa de imagem com o número
  const imageBox = document.createElement('div');
  imageBox.className = 'card-image-box';

  const numberSpan = document.createElement('span');
  numberSpan.className = 'card-number';
  numberSpan.textContent = pokemon.formattedId;

  const image = document.createElement('img');
  image.className = 'card-image';
  image.src = pokemon.image;
  image.alt = `Imagem de ${pokemon.name}`;
  image.loading = 'lazy'; // Otimização de performance

  imageBox.appendChild(numberSpan);
  imageBox.appendChild(image);

  // 3. Área de conteúdo do Card
  const content = document.createElement('div');
  content.className = 'card-content';

  // Nome do personagem
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = pokemon.name;

  // Lista de tipos (Tags/Badges)
  const typesContainer = document.createElement('div');
  typesContainer.className = 'card-types';

  pokemon.types.forEach(type => {
    const typePill = document.createElement('span');
    typePill.className = 'type-pill';
    typePill.textContent = type;
    typePill.style.backgroundColor = TYPE_COLORS[type] || '#777777';
    typesContainer.appendChild(typePill);
  });

  // Estatísticas rápidas (Peso e Altura)
  const statsPreview = document.createElement('div');
  statsPreview.className = 'card-stats-preview';

  const heightSpan = document.createElement('span');
  heightSpan.innerHTML = `Altura: <strong>${pokemon.height} m</strong>`;

  const weightSpan = document.createElement('span');
  weightSpan.innerHTML = `Peso: <strong>${pokemon.weight} kg</strong>`;

  statsPreview.appendChild(heightSpan);
  statsPreview.appendChild(weightSpan);

  // Botão interativo para ver mais detalhes
  const viewBtn = document.createElement('button');
  viewBtn.className = 'card-btn-view';
  viewBtn.textContent = 'Ver Detalhes';

  // Montagem final do Card
  content.appendChild(title);
  content.appendChild(typesContainer);
  content.appendChild(statsPreview);
  content.appendChild(viewBtn);

  card.appendChild(imageBox);
  card.appendChild(content);

  // Evento de clique para abrir o Modal
  card.addEventListener('click', () => openDetailModal(pokemon));

  return card;
}

/**
 * Renderiza todos os cards filtrados na grade HTML
 */
function renderCards(pokemons) {
  // Limpa o grid antes de re-renderizar
  cardsGrid.innerHTML = '';

  if (pokemons.length === 0 && !state.isLoading) {
    showStatusMessage('Nenhum personagem encontrado com os filtros aplicados.', 'empty');
    return;
  }

  // Cria um fragmento de documento para melhor performance
  const fragment = document.createDocumentFragment();

  pokemons.forEach(pokemon => {
    const cardElement = createPokemonCard(pokemon);
    fragment.appendChild(cardElement);
  });

  cardsGrid.appendChild(fragment);
}

// ==========================================
// FILTROS & BUSCA EM TEMPO REAL
// ==========================================

function applyFilters() {
  const query = state.searchQuery.toLowerCase().trim();
  const selectedType = state.activeFilterType;

  state.filteredList = state.pokemonList.filter(pokemon => {
    // Filtro por nome ou id
    const matchesSearch = pokemon.name.toLowerCase().includes(query) || 
                          String(pokemon.id) === query ||
                          pokemon.formattedId.includes(query);

    // Filtro por tipo
    const matchesType = (selectedType === 'all') || pokemon.types.includes(selectedType);

    return matchesSearch && matchesType;
  });

  renderCards(state.filteredList);
}

// ==========================================
// MODAL DE DETALHES DO PERSONAGEM
// ==========================================

function openDetailModal(pokemon) {
  modalBody.innerHTML = '';

  // Header do modal com imagem
  const headerHero = document.createElement('div');
  headerHero.className = 'modal-header-hero';

  const heroImg = document.createElement('img');
  heroImg.className = 'modal-hero-img';
  heroImg.src = pokemon.image;
  heroImg.alt = pokemon.name;
  headerHero.appendChild(heroImg);

  // Corpo dos dados
  const contentBody = document.createElement('div');
  contentBody.className = 'modal-content-body';

  const titleRow = document.createElement('div');
  titleRow.className = 'modal-title-row';

  const nameEl = document.createElement('h2');
  nameEl.className = 'modal-name';
  nameEl.textContent = pokemon.name;

  const idEl = document.createElement('span');
  idEl.className = 'modal-id';
  idEl.textContent = pokemon.formattedId;

  titleRow.appendChild(nameEl);
  titleRow.appendChild(idEl);

  // Tipos
  const typesContainer = document.createElement('div');
  typesContainer.className = 'modal-types';
  pokemon.types.forEach(t => {
    const pill = document.createElement('span');
    pill.className = 'type-pill';
    pill.textContent = t;
    pill.style.backgroundColor = TYPE_COLORS[t] || '#666';
    typesContainer.appendChild(pill);
  });

  // Estatísticas de Batalha (HP, Ataque, Defesa, etc)
  const statsTitle = document.createElement('h4');
  statsTitle.textContent = 'Estatísticas de Batalha:';
  statsTitle.style.marginBottom = '8px';
  statsTitle.style.color = '#fff';

  const statsList = document.createElement('div');
  statsList.className = 'modal-stats-list';

  pokemon.stats.forEach(stat => {
    const item = document.createElement('div');
    item.className = 'modal-stat-item';

    const statName = document.createElement('span');
    statName.className = 'modal-stat-name';
    statName.textContent = stat.name.replace('-', ' ');

    const statVal = document.createElement('span');
    statVal.className = 'modal-stat-val';
    statVal.textContent = stat.value;

    const track = document.createElement('div');
    track.className = 'stat-bar-track';

    const fill = document.createElement('div');
    fill.className = 'stat-bar-fill';
    const percent = Math.min((stat.value / 180) * 100, 100);
    fill.style.width = `${percent}%`;

    track.appendChild(fill);
    item.appendChild(statName);
    item.appendChild(statVal);
    item.appendChild(track);

    statsList.appendChild(item);
  });

  contentBody.appendChild(titleRow);
  contentBody.appendChild(typesContainer);
  contentBody.appendChild(statsTitle);
  contentBody.appendChild(statsList);

  modalBody.appendChild(headerHero);
  modalBody.appendChild(contentBody);

  detailModal.classList.add('active');
  detailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Evita rolagem de fundo
}

function closeModal() {
  detailModal.classList.remove('active');
  detailModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ==========================================
// MENSAGENS DE STATUS (FEEDBACK DO USUÁRIO)
// ==========================================

function showStatusMessage(message, type = 'info') {
  statusContainer.style.display = 'block';
  statusContainer.innerHTML = '';

  if (type === 'loading') {
    const spinner = document.createElement('div');
    spinner.className = 'loader-spinner';
    const p = document.createElement('p');
    p.className = 'status-text';
    p.textContent = message;
    statusContainer.appendChild(spinner);
    statusContainer.appendChild(p);
  } else {
    const p = document.createElement('p');
    p.className = `status-text ${type === 'error' ? 'status-error' : ''}`;
    p.textContent = message;
    statusContainer.appendChild(p);
  }
}

function hideStatusMessage() {
  statusContainer.style.display = 'none';
  statusContainer.innerHTML = '';
}

function updateLoadMoreButtonState(isLoading) {
  const btnText = loadMoreBtn.querySelector('.btn-text');
  const btnSpinner = loadMoreBtn.querySelector('.btn-spinner');

  if (isLoading) {
    loadMoreBtn.disabled = true;
    btnText.textContent = 'Carregando...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
  } else {
    loadMoreBtn.disabled = false;
    btnText.textContent = 'Carregar Mais Personagens';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

// ==========================================
// EVENT LISTENERS & INICIALIZAÇÃO
// ==========================================

function setupEventListeners() {
  // Busca em tempo real com evento de digitação
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    applyFilters();
  });

  // Filtro por tipo
  typeFilter.addEventListener('change', (e) => {
    state.activeFilterType = e.target.value;
    applyFilters();
  });

  // Carregar mais pokémons
  loadMoreBtn.addEventListener('click', () => {
    fetchPokemons(state.offset, PAGE_SIZE);
  });

  // Fechar Modal
  closeModalBtn.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeModal();
    }
  });

  // Tecla ESC para fechar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchPokemons(0, PAGE_SIZE);
});

