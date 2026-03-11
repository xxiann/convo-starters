window.GONE_CONFIG = {
  categories: [
    "fun",
    "personal",
    "career",
    "relationship",
    "worldview",
    "reflection",
    "christian",
    "future"
  ],

  categoryLabels: {
    fun: "FUN",
    personal: "PERSONAL",
    career: "CAREER",
    relationship: "RELATIONSHIP",
    worldview: "WORLDVIEW",
    reflection: "REFLECTION",
    christian: "CHRISTIAN",
    future: "FUTURE"
  },

  depths: ["easy", "medium", "hard"],

  depthLabels: {
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD"
  },

  baseTheme: {
    cardBackground: "#efe6cb",
    bubbleBackground: "#b7a26b",
    bubbleText: "#ffffff",
    text: "#3c412f"
  },

  categoryThemes: {
    fun: {
      cardBackground: "#efe6cb",
      bubbleBackground: "#b7a26b",
      bubbleText: "#ffffff",
      text: "#3c412f"
    },
    personal: {
      cardBackground: "#e7f0f3",
      bubbleBackground: "#7ea3b0",
      bubbleText: "#ffffff",
      text: "#2f3a41"
    },
    career: {
      cardBackground: "#e9edf7",
      bubbleBackground: "#8fa0c7",
      bubbleText: "#ffffff",
      text: "#2f3441"
    },
    relationship: {
      cardBackground: "#f5e6e6",
      bubbleBackground: "#d28f8f",
      bubbleText: "#ffffff",
      text: "#413333"
    },
    worldview: {
      cardBackground: "#e6f2ec",
      bubbleBackground: "#6aa58a",
      bubbleText: "#ffffff",
      text: "#2f4137"
    },
    reflection: {
      cardBackground: "#eef4e8",
      bubbleBackground: "#9fbf8a",
      bubbleText: "#ffffff",
      text: "#35412f"
    },
    christian: {
      cardBackground: "#f4eed8",
      bubbleBackground: "#c3a96a",
      bubbleText: "#ffffff",
      text: "#403a2f"
    },
    future: {
      cardBackground: "#e7f3f6",
      bubbleBackground: "#7fb9c8",
      bubbleText: "#ffffff",
      text: "#2f3b41"
    }
  }
};

window.GONE_CARDS = [];

window.GONE_SHEET = {
  spreadsheetId: "15Zd4jHsgIQfbJRzsKffWhZXIUyFT_voWAcgWH1wTKz0",
  sheetName: "data"
};

window.GONE_LOADERS = {
  async loadCardsFromSheet() {
    const { spreadsheetId, sheetName } = window.GONE_SHEET;
    const url = `https://opensheet.elk.sh/${spreadsheetId}/${sheetName}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load cards from sheet: ${response.status}`);
    }

    const rows = await response.json();

    window.GONE_CARDS = rows
      .filter((row) => String(row.active || "").trim().toUpperCase() === "TRUE")
      .map((row, index) => ({
        id: row.id?.trim() || `card_${index + 1}`,
        category: String(row.category || "").trim().toLowerCase(),
        depth: String(row.depth || "").trim().toLowerCase(),
        type: String(row.type || "").trim().toLowerCase(),
        question: String(row.question || "").trim()
      }))
      .filter((card) => {
        return (
          card.id &&
          card.category &&
          card.depth &&
          card.type &&
          card.question
        );
      });
  }
};