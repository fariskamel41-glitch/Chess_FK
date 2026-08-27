console.log("🎨 CHESS_FK Theme System loaded");

const DEFAULT_THEME = "red";

const ALLOWED_THEMES = [
    "red",
    "black",
    "brown",
    "beige",
    "blue",
    "green",
    "purple",
    "gold",
    "cyan",
    "orange"
];

function getSavedTheme() {
    try {
        const savedTheme = localStorage.getItem("chess_fk_theme");

        return ALLOWED_THEMES.includes(savedTheme)
            ? savedTheme
            : DEFAULT_THEME;
    } catch (error) {
        return DEFAULT_THEME;
    }
}

function applyTheme(theme, save = true) {
    const validTheme = ALLOWED_THEMES.includes(theme)
        ? theme
        : DEFAULT_THEME;

    document.body.setAttribute("data-theme", validTheme);

    document.querySelectorAll(".theme-card").forEach((card) => {
        card.classList.toggle(
            "active",
            card.dataset.theme === validTheme
        );
    });

    if (save) {
        try {
            localStorage.setItem("chess_fk_theme", validTheme);
        } catch (error) {
            console.warn("Impossible de sauvegarder le thème.", error);
        }
    }
}

function openThemePanel() {
    const panel = document.getElementById("themePanel");
    const overlay = document.getElementById("themeOverlay");

    if (!panel) return;

    panel.classList.add("active");

    if (overlay) {
        overlay.classList.add("active");
    }

    document.body.classList.add("theme-panel-open");
}

function closeThemePanel() {
    const panel = document.getElementById("themePanel");
    const overlay = document.getElementById("themeOverlay");

    if (panel) {
        panel.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("theme-panel-open");
}

function startThemeSystem() {
    /* Applique directement le thème enregistré sur chaque page */
    applyTheme(getSavedTheme(), false);

    const themeToggle = document.getElementById("themeToggle");
    const themeClose = document.getElementById("themeClose");
    const themeOverlay = document.getElementById("themeOverlay");

    if (themeToggle) {
        themeToggle.addEventListener("click", openThemePanel);
    }

    if (themeClose) {
        themeClose.addEventListener("click", closeThemePanel);
    }

    if (themeOverlay) {
        themeOverlay.addEventListener("click", closeThemePanel);
    }

    document.querySelectorAll(".theme-card").forEach((card) => {
        card.addEventListener("click", () => {
            applyTheme(card.dataset.theme, true);
            closeThemePanel();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeThemePanel();
        }
    });
}

/*
  Important :
  ce code fonctionne même si le script est chargé
  après que la page soit déjà prête.
*/
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startThemeSystem);
} else {
    startThemeSystem();
}

window.applyChessFKTheme = applyTheme;
