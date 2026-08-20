// ======================================================
// CHESS_FK - SUPABASE CONNECTION
// ======================================================

const SUPABASE_URL = "https://rqwmipinrjwanvxjiobj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";

// Création du client Supabase
window.chessFKSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("♟️ CHESS_FK SUPABASE READY");


// ======================================================
// GOOGLE LOGIN
// ======================================================

window.signInWithGoogle = async function () {

    console.log("🔵 CHESS_FK → Google Login...");

    const { data, error } =
        await window.chessFKSupabase.auth.signInWithOAuth({

            provider: "google",

            options: {

                redirectTo:
                    "https://fariskamel41-glitch.github.io/Chess_FK/"

            }

        });


    if (error) {

        console.error(
            "❌ Google Login Error:",
            error
        );

        alert(
            "Impossible de se connecter avec Google.\n\n" +
            error.message
        );

        return;

    }


    console.log(
        "✅ Redirection vers Google..."
    );

};


// ======================================================
// GET CURRENT USER
// ======================================================

window.getChessFKUser = async function () {

    const {
        data,
        error
    } = await window.chessFKSupabase.auth.getUser();


    if (error) {

        console.error(
            "❌ Impossible de récupérer l'utilisateur:",
            error
        );

        return null;

    }


    return data.user;

};


// ======================================================
// LOGOUT
// ======================================================

window.signOutChessFK = async function () {

    const {
        error
    } = await window.chessFKSupabase.auth.signOut();


    if (error) {

        console.error(
            "❌ Logout error:",
            error
        );

        return;

    }


    console.log(
        "👋 CHESS_FK → Déconnexion"
    );

    window.location.reload();

};


// ======================================================
// CHECK AUTH STATE
// ======================================================

window.checkChessFKAuth = async function () {

    const user =
        await window.getChessFKUser();


    if (!user) {

        console.log(
            "👤 Aucun utilisateur connecté"
        );

        return;

    }


    console.log(
        "👤 Utilisateur connecté:",
        user.email
    );

    console.log(
        "🆔 User ID:",
        user.id
    );


    // Notification pour index.html
    window.dispatchEvent(
        new CustomEvent(
            "chessfk-user-connected",
            {
                detail: user
            }
        )
    );

};


// ======================================================
// LISTEN FOR LOGIN / LOGOUT
// ======================================================

window.chessFKSupabase.auth.onAuthStateChange(
    function (event, session) {

        console.log(
            "🔐 Auth event:",
            event
        );


        if (session && session.user) {

            console.log(
                "✅ CHESS_FK USER CONNECTED:",
                session.user.email
            );

            window.dispatchEvent(
                new CustomEvent(
                    "chessfk-user-connected",
                    {
                        detail: session.user
                    }
                )
            );

        }

        else {

            window.dispatchEvent(
                new CustomEvent(
                    "chessfk-user-disconnected"
                )
            );

        }

    }
);


// ======================================================
// INITIAL CHECK
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        window.checkChessFKAuth();

    }
);