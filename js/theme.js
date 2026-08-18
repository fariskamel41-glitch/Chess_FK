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
   CHECK
   ========================================= */

console.log("Theme button:", themeToggle);
console.log("Theme panel:", themePanel);
console.log("Theme cards:", themeCards.length);


/* =========================================
   DEFAULT THEME
   ========================================= */

const DEFAULT_THEME = "red";


/* =========================================
   OPEN PANEL
   ========================================= */

function openThemePanel() {

    console.log("🎨 Opening theme panel");

    if (!themePanel || !themeOverlay) {
        console.error("❌ Theme panel not found");
        return;
    }

    themePanel.classList.add("active");
    themeOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


/* =========================================
   CLOSE PANEL
   ========================================= */

function closeThemePanel() {

    console.log("❌ Closing theme panel");

    if (!themePanel || !themeOverlay) {
        return;
    }

    themePanel.classList.remove("active");
    themeOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


/* =========================================
   APPLY THEME
   ========================================= */

function applyTheme(theme) {

    console.log("🎨 Applying theme:", theme);


    /* ================================
       CHECK THEME
       ================================ */

    const allowedThemes = [
        "red",
        "blue",
        "green",
        "purple"
    ];


    if (!allowedThemes.includes(theme)) {

        theme = DEFAULT_THEME;

    }


    /* ================================
       RED = DEFAULT
       ================================ */

    if (theme === "red") {

        document.body.removeAttribute("data-theme");

    }


    /* ================================
       OTHER THEMES
       ================================ */

    else {

        document.body.setAttribute(
            "data-theme",
            theme
        );

    }


    /* ================================
       UPDATE CARDS
       ================================ */

    themeCards.forEach(function(card) {

        card.classList.remove("active");

    });


    const selectedCard = document.querySelector(
        `.theme-card[data-theme="${theme}"]`
    );


    if (selectedCard) {

        selectedCard.classList.add("active");

    }


    /* ================================
       SAVE THEME
       ================================ */

    localStorage.setItem(
        "chess_fk_theme",
        theme
    );


    console.log(
        "✅ Theme saved:",
        theme
    );

}


/* =========================================
   LOAD SAVED THEME
   ========================================= */

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("chess_fk_theme");


    console.log(
        "💾 Saved theme:",
        savedTheme
    );


    if (savedTheme) {

        applyTheme(savedTheme);

    }

    else {

        applyTheme(DEFAULT_THEME);

    }

}


/* =========================================
   THEME BUTTON
   ========================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            console.log("🎨 THEME BUTTON CLICKED");

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
   ESC KEY
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


            console.log(
                "🖱️ Selected:",
                theme
            );


            applyTheme(theme);


            /*
                Petit délai pour rendre
                le changement plus naturel.
            */

            setTimeout(
                function() {

                    closeThemePanel();

                },
                200
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