(function () {
  function shuffle(array) {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  function getMatchingPool(cards, settings) {
    const { selectedCategories } = settings;

    return cards.filter((card) => selectedCategories.includes(card.category));
  }

  function buildDeck(cards, settings) {
    const pool = getMatchingPool(cards, settings);
    const { depthCounts } = settings;

    const orderedDepths = ["easy", "medium", "hard"];
    const deck = [];

    orderedDepths.forEach((depth) => {
      const numericCount = Number(depthCounts[depth]) || 0;
      if (numericCount <= 0) return;

      const depthPool = shuffle(
        pool.filter((card) => card.depth === depth)
      );

      deck.push(...depthPool.slice(0, numericCount));
    });

    return {
      pool,
      deck
    };
  }

  function reshuffleExistingPool(pool, settings) {
    const { depthCounts } = settings;

    const orderedDepths = ["easy", "medium", "hard"];
    const deck = [];

    orderedDepths.forEach((depth) => {
      const numericCount = Number(depthCounts[depth]) || 0;
      if (numericCount <= 0) return;

      const depthPool = shuffle(
        pool.filter((card) => card.depth === depth)
      );

      deck.push(...depthPool.slice(0, numericCount));
    });

    return deck;
  }

  window.GONE_DECK = {
    buildDeck,
    reshuffleExistingPool
  };
})();