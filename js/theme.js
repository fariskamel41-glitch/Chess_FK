console.log("🔥 CHESS_FK THEME SYSTEM LOADED");


/* =========================================
   ELEMENTS
========================================= */

const themeToggle = document.getElementById("themeToggle");
const themePanel = document.getElementById("themePanel");
const themeOverlay = document.getElementById("themeOverlay");
const themeClose = document.getElementById("themeClose");

const themeCards = document.querySelectorAll(".theme-card");


/* =========================================
   SETTINGS
========================================= */

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


/* =========================================
   CHECK
========================================= */

console.log("Theme button:", themeToggle);
console.log("Theme panel:", themePanel);
console.log("Theme overlay:", themeOverlay);
console.log("Theme close:", themeClose);
console.log("Theme cards:", themeCards.length);


/* =========================================
   OPEN PANEL
========================================= */

function openThemePanel() {

    if (!themePanel) {
        console.error("❌ Theme panel not found");
        return;
    }

    themePanel.classList.add("active");

    if (themeOverlay) {
        themeOverlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";

    console.log("🎨 Theme panel opened");
}


/* =========================================
   CLOSE PANEL
========================================= */

function closeThemePanel() {

    if (themePanel) {
        themePanel.classList.remove("active");
    }

    if (themeOverlay) {
        themeOverlay.classList.remove("active");
    }

    document.body.style.overflow = "";

    console.log("❌ Theme panel closed");
}


/* =========================================
   APPLY THEME
========================================= */

function applyTheme(theme) {

    console.log("🎨 Applying theme:", theme);


    /* -------------------------------------
       VERIFY THEME
    ------------------------------------- */

    if (!ALLOWED_THEMES.includes(theme)) {

        console.warn(
            "⚠️ Unknown theme:",
            theme,
            "→ using red"
        );

        theme = DEFAULT_THEME;
    }


    /* -------------------------------------
       APPLY DATA ATTRIBUTE
    ------------------------------------- */

    document.body.setAttribute(
        "data-theme",
        theme
    );


    /* -------------------------------------
       UPDATE THEME CARDS
    ------------------------------------- */

    themeCards.forEach(function(card) {

        const cardTheme =
            card.getAttribute("data-theme");

        card.classList.toggle(
            "active",
            cardTheme === theme
        );

    });


    /* -------------------------------------
       SAVE
    ------------------------------------- */

    localStorage.setItem(
        "chess_fk_theme",
        theme
    );


    console.log(
        "✅ Theme applied and saved:",
        theme
    );
}


/* =========================================
   LOAD SAVED THEME
========================================= */

function loadSavedTheme() {

    let savedTheme =
        localStorage.getItem("chess_fk_theme");


    if (!ALLOWED_THEMES.includes(savedTheme)) {

        savedTheme = DEFAULT_THEME;

    }


    applyTheme(savedTheme);
}


/* =========================================
   THEME BUTTON
========================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            openThemePanel();

        }
    );

}


/* =========================================
   CLOSE BUTTON
========================================= */

if (themeClose) {

    themeClose.addEventListener(
        "click",
        function() {

            closeThemePanel();

        }
    );

}


/* =========================================
   OVERLAY
========================================= */

if (themeOverlay) {

    themeOverlay.addEventListener(
        "click",
        function() {

            closeThemePanel();

        }
    );

}


/* =========================================
   ESC
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeThemePanel();

        }

    }
);


/* =========================================
   THEME CARDS
========================================= */

themeCards.forEach(function(card) {

    card.addEventListener(
        "click",
        function() {

            const theme =
                card.getAttribute("data-theme");


            if (!theme) {
                return;
            }


            console.log(
                "🖱️ Theme selected:",
                theme
            );


            applyTheme(theme);


            setTimeout(
                function() {

                    closeThemePanel();

                },
                250
            );

        }
    );

});


/* =========================================
   START
========================================= */

loadSavedTheme();


console.log(
    "🚀 CHESS_FK Theme System Ready!"
);