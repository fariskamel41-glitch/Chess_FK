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
            console.warn("Theme could not be saved.", error);
        }
    }
}

function openThemePanel() {
    const panel = document.getElementById("themePanel");
    const overlay = document.getElementById("themeOverlay");

    if (!panel) return;

    panel.classList.add("active");
    overlay?.classList.add("active");
    document.body.classList.add("theme-panel-open");
}

function closeThemePanel() {
    const panel = document.getElementById("themePanel");
    const overlay = document.getElementById("themeOverlay");

    panel?.classList.remove("active");
    overlay?.classList.remove("active");
    document.body.classList.remove("theme-panel-open");
}

function startThemeSystem() {
    applyTheme(getSavedTheme(), false);

    document
        .getElementById("themeToggle")
        ?.addEventListener("click", openThemePanel);

    document
        .getElementById("themeClose")
        ?.addEventListener("click", closeThemePanel);

    document
        .getElementById("themeOverlay")
        ?.addEventListener("click", closeThemePanel);

    document.querySelectorAll(".theme-card").forEach((card) => {
        card.addEventListener("click", () => {
            applyTheme(card.dataset.theme);
            closeThemePanel();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeThemePanel();
        }
    });
}

document.addEventListener("DOMContentLoaded", startThemeSystem);

window.applyChessFKTheme = applyTheme;
