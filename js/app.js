(function () {
  const config = window.GONE_CONFIG;
  const { state, resetSettings } = window.GONE_STATE;
  const { buildDeck, reshuffleExistingPool } = window.GONE_DECK;

  const els = {
    pages: document.querySelectorAll(".page"),
    categoryGrid: document.getElementById("category-grid"),
    depthInputs: document.querySelectorAll("[data-depth]"),

    card: document.getElementById("play-card"),
    cardBubble: document.getElementById("card-bubble"),
    cardCategory: document.getElementById("card-category"),
    cardQuestion: document.getElementById("card-question"),
    cardType: document.getElementById("card-type"),
    deckProgress: document.getElementById("deck-progress"),

    viewList: document.getElementById("view-list"),
    sessionList: document.getElementById("session-list"),
    sessionSummary: document.getElementById("session-summary"),

    loadingState: document.getElementById("loading-state"),
    errorState: document.getElementById("error-state")
  };

  function getCards() {
    return window.GONE_CARDS || [];
  }

  function init() {
    renderCategoryChips();
    syncLandingForm();
    bindEvents();
  }

  function bindEvents() {
    document.addEventListener("click", handleClick);

    els.depthInputs.forEach((input) => {
      input.addEventListener("input", handleDepthInput);
    });
  }

  function handleClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;

    const action = trigger.dataset.action;

    switch (action) {
      case "toggle-category":
        toggleCategory(trigger.dataset.category);
        break;

      case "reset-settings":
        handleResetSettings();
        break;

      case "build-deck":
        handleBuildDeck();
        break;

      case "go-home":
        resetThemeToDefault();
        showPage("landing");
        break;

      case "go-view":
        renderFilteredViewList();
        showPage("view");
        break;

      case "back-from-view":
        showPage("landing");
        break;

      case "restart-deck":
        handleRestartDeck();
        break;

      case "end-deck":
        handleEndDeck();
        break;

      case "prev-card":
        handlePrevCard();
        break;

      case "next-card":
        handleNextCard();
        break;

      case "go-view-session":
        renderSessionList();
        showPage("end");
        break;

      default:
        break;
    }
  }

  function renderCategoryChips() {
    els.categoryGrid.innerHTML = "";

    config.categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-chip";
      button.dataset.action = "toggle-category";
      button.dataset.category = category;
      button.textContent = config.categoryLabels[category];
      els.categoryGrid.appendChild(button);
    });

    updateCategorySelectionUI();
  }

  function updateCategorySelectionUI() {
    const chips = els.categoryGrid.querySelectorAll(".category-chip");

    chips.forEach((chip) => {
      const category = chip.dataset.category;
      const isSelected = state.settings.selectedCategories.includes(category);
      chip.classList.toggle("is-selected", isSelected);
    });
  }

  function syncLandingForm() {
    updateCategorySelectionUI();

    els.depthInputs.forEach((input) => {
      const depth = input.dataset.depth;
      input.value = state.settings.depthCounts[depth];
    });
  }

  function toggleCategory(category) {
    const selected = state.settings.selectedCategories;
    const exists = selected.includes(category);

    if (exists) {
      state.settings.selectedCategories = selected.filter((item) => item !== category);
    } else {
      state.settings.selectedCategories = [...selected, category];
    }

    updateCategorySelectionUI();
  }

  function handleDepthInput(event) {
    const depth = event.target.dataset.depth;
    const value = Math.max(0, Number(event.target.value) || 0);
    state.settings.depthCounts[depth] = value;
    event.target.value = value;
  }

  function handleResetSettings() {
    resetSettings();
    resetThemeToDefault();
    syncLandingForm();
  }

  function handleBuildDeck() {
    const cards = getCards();

    const hasCategories = state.settings.selectedCategories.length > 0;
    const totalRequested = Object.values(state.settings.depthCounts)
      .reduce((sum, value) => sum + (Number(value) || 0), 0);

    if (!hasCategories) {
      alert("Please select at least one category.");
      return;
    }

    if (totalRequested <= 0) {
      alert("Please select at least one card.");
      return;
    }

    const result = buildDeck(cards, state.settings);

    if (!result.deck.length) {
      alert("No cards match your current filters yet.");
      return;
    }

    state.lastBuiltPool = result.pool;
    state.deck = result.deck;
    state.deckIndex = 0;
    state.sessionSeen = [state.deck[0]];

    renderCurrentCard();
    showPage("play");
  }

  function handleRestartDeck() {
    if (!state.lastBuiltPool.length) return;

    const newDeck = reshuffleExistingPool(state.lastBuiltPool, state.settings);

    if (!newDeck.length) {
      alert("No cards available to restart with the current filters.");
      return;
    }

    state.deck = newDeck;
    state.deckIndex = 0;
    state.sessionSeen = [state.deck[0]];

    renderCurrentCard();
    showPage("play");
  }

  function handlePrevCard() {
    if (!state.deck.length) return;
    if (state.deckIndex <= 0) return;

    state.deckIndex -= 1;
    renderCurrentCard();
  }

  function handleNextCard() {
    if (!state.deck.length) return;

    if (state.deckIndex >= state.deck.length - 1) {
      handleEndDeck();
      return;
    }

    state.deckIndex += 1;
    trackSeenCurrentCard();
    renderCurrentCard();
  }

  function handleEndDeck() {
    resetThemeToDefault();
    renderSessionList();
    showPage("end");
  }

  function trackSeenCurrentCard() {
    const card = state.deck[state.deckIndex];
    const alreadySeen = state.sessionSeen.some((item) => item.id === card.id);

    if (!alreadySeen) {
      state.sessionSeen.push(card);
    }
  }

  function renderCurrentCard() {
    const card = state.deck[state.deckIndex];
    if (!card) return;

    const theme = config.categoryThemes[card.category] || config.baseTheme;

    els.cardCategory.textContent = config.categoryLabels[card.category] || card.category;
    els.cardQuestion.textContent = card.question;
    els.cardType.textContent = String(card.type).toUpperCase();
    els.deckProgress.textContent = `${state.deckIndex + 1}/${state.deck.length}`;

    applyCardTheme(theme);
  }

  function applyCardTheme(theme) {
    els.card.style.backgroundColor = theme.cardBackground;
    els.card.style.color = theme.text;

    els.cardBubble.style.backgroundColor = theme.bubbleBackground;
    els.cardBubble.style.color = theme.bubbleText;

    document.documentElement.style.setProperty("--accent-color", theme.bubbleBackground);
    document.documentElement.style.setProperty("--bubble-text-color", theme.bubbleText);
  }

  function resetThemeToDefault() {
    const baseTheme = config.baseTheme;
    document.documentElement.style.setProperty("--accent-color", baseTheme.bubbleBackground);
    document.documentElement.style.setProperty("--bubble-text-color", baseTheme.bubbleText);
  }

  function getFilteredPoolForView() {
    const cards = getCards();

    return cards.filter((card) => {
      const categoryMatch = state.settings.selectedCategories.includes(card.category);
      const depthCount = Number(state.settings.depthCounts[card.depth] || 0);
      return categoryMatch && depthCount > 0;
    });
  }

  function renderFilteredViewList() {
    const filtered = getFilteredPoolForView();
    els.viewList.innerHTML = "";

    if (!filtered.length) {
      els.viewList.innerHTML = `
        <div class="view-item">
          <p class="view-item-question">No prompts match the current selected filters.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((card) => {
      els.viewList.appendChild(createListCard(card));
    });
  }

  function renderSessionList() {
    els.sessionList.innerHTML = "";
    els.sessionSummary.textContent = `You viewed ${state.sessionSeen.length} card(s) this session.`;

    if (!state.sessionSeen.length) {
      els.sessionList.innerHTML = `
        <div class="view-item">
          <p class="view-item-question">No cards viewed in this session yet.</p>
        </div>
      `;
      return;
    }

    state.sessionSeen.forEach((card) => {
      els.sessionList.appendChild(createListCard(card));
    });
  }

  function createListCard(card) {
    const wrapper = document.createElement("article");
    wrapper.className = "view-item";

    wrapper.innerHTML = `
      <div class="view-item-meta">
        <span class="meta-pill">${config.categoryLabels[card.category] || card.category}</span>
        <span class="meta-pill">${String(card.depth).toUpperCase()}</span>
        <span class="meta-pill">${String(card.type).toUpperCase()}</span>
      </div>
      <p class="view-item-question">${card.question}</p>
    `;

    return wrapper;
  }

  function showPage(pageName) {
    state.currentPage = pageName;

    els.pages.forEach((page) => {
      const shouldShow = page.id === `page-${pageName}`;
      page.classList.toggle("is-active", shouldShow);
      page.classList.toggle("hidden", !shouldShow);
    });
  }

  async function startApp() {
    try {
      await window.GONE_LOADERS.loadCardsFromSheet();
      init();

      if (els.loadingState) {
        els.loadingState.classList.add("hidden");
      }
    } catch (error) {
      console.error(error);

      if (els.loadingState) {
        els.loadingState.classList.add("hidden");
      }

      if (els.errorState) {
        els.errorState.classList.remove("hidden");
        els.errorState.classList.add("flex");
      }
    }
  }

  startApp();
})();