// ======================================================
// CHESS_FK
// SUPABASE CONNECTION
// ONE SINGLE SUPABASE CLIENT
// ======================================================

console.log("♟️ CHESS_FK SUPABASE STARTING...");


// ======================================================
// CONFIGURATION
// ======================================================

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


// ======================================================
// CHECK SUPABASE LIBRARY
// ======================================================

if (!window.supabase) {

    console.error(
        "❌ Supabase JS n'est pas chargé."
    );

} else {

    console.log(
        "✅ Supabase JS détecté"
    );

}


// ======================================================
// CREATE ONE SINGLE CLIENT
// ======================================================

const supabaseClient =
    window.supabase.createClient(
        CHESSFK_SUPABASE_URL,
        CHESSFK_SUPABASE_KEY
    );


// Make it accessible to the other ChessFK files
window.chessfkSupabase =
    supabaseClient;


console.log(
    "♟️ CHESS_FK SUPABASE READY"
);


// ======================================================
// GET CURRENT USER
// ======================================================

async function getChessFKUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {

            // No session = normal when nobody is logged in
            if (
                error.name ===
                "AuthSessionMissingError"
            ) {

                return null;

            }


            console.error(
                "❌ Impossible de récupérer l'utilisateur:",
                error
            );

            return null;

        }


        return data?.user || null;

    }

    catch (error) {

        console.error(
            "🔥 getChessFKUser error:",
            error
        );

        return null;

    }

}


// ======================================================
// GET CURRENT SESSION
// ======================================================

async function getChessFKSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "❌ Impossible de récupérer la session:",
                error
            );

            return null;

        }


        return data?.session || null;

    }

    catch (error) {

        console.error(
            "🔥 getChessFKSession error:",
            error
        );

        return null;

    }

}


// ======================================================
// GOOGLE LOGIN
// ======================================================

async function signInWithGoogle() {

    console.log(
        "🔐 CHESS_FK: Google login starting..."
    );


    try {

        const redirectURL =
            window.location.origin +
            window.location.pathname;


        console.log(
            "↩️ Redirect URL:",
            redirectURL
        );


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        redirectURL

                }

            });


        if (error) {

            console.error(
                "❌ Google login error:",
                error
            );

            alert(
                "Impossible de se connecter avec Google.\n\n" +
                error.message
            );

            return null;

        }


        console.log(
            "✅ Google authentication started"
        );


        return data;

    }

    catch (error) {

        console.error(
            "🔥 Google login exception:",
            error
        );

        alert(
            "Une erreur est survenue pendant la connexion Google."
        );

        return null;

    }

}


// ======================================================
// LOGOUT
// ======================================================

async function signOutChessFK() {

    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "❌ Logout error:",
                error
            );

            return false;

        }


        console.log(
            "🚪 CHESS_FK user signed out"
        );


        return true;

    }

    catch (error) {

        console.error(
            "🔥 Logout exception:",
            error
        );

        return false;

    }

}


// ======================================================
// AUTH STATE LISTENER
// ======================================================

supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        console.log(
            "🔐 Auth event:",
            event
        );


        const user =
            session?.user || null;


        // User connected
        if (user) {

            console.log(
                "👤 CHESS_FK USER:",
                user.email
            );


            window.dispatchEvent(
                new CustomEvent(
                    "chessfk-user-connected",
                    {
                        detail: user
                    }
                )
            );

        }

        // User disconnected
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
// GLOBAL FUNCTIONS
// ======================================================

window.getChessFKUser =
    getChessFKUser;

window.getChessFKSession =
    getChessFKSession;

window.signInWithGoogle =
    signInWithGoogle;

window.signOutChessFK =
    signOutChessFK;


// ======================================================
// INITIAL SESSION CHECK
// ======================================================

(async function () {

    const session =
        await getChessFKSession();


    if (session?.user) {

        console.log(
            "👤 Existing ChessFK session:",
            session.user.email
        );

    } else {

        console.log(
            "👤 Aucun utilisateur connecté"
        );

    }

})();


console.log(
    "🚀 CHESS_FK SUPABASE SYSTEM READY"
);