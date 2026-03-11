(function () {
  const defaultSettings = {
    selectedCategories: ["fun", "personal"],
    depthCounts: {
      easy: 15,
      medium: 15,
      hard: 15
    }
  };

  const state = {
    currentPage: "landing",
    settings: structuredClone(defaultSettings),
    deck: [],
    deckIndex: 0,
    lastBuiltPool: [],
    sessionSeen: []
  };

  function resetSettings() {
    state.settings = structuredClone(defaultSettings);
  }

  function resetDeckState() {
    state.deck = [];
    state.deckIndex = 0;
    state.lastBuiltPool = [];
    state.sessionSeen = [];
  }

  window.GONE_STATE = {
    state,
    defaultSettings,
    resetSettings,
    resetDeckState
  };
})();