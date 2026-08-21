```javascript
// ==========================================
// CHESS_FK
// SUPABASE CONNECTION
// ==========================================

console.log("♟️ CHESS_FK SUPABASE STARTING...");


// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


// ==========================================
// CREATE ONE SINGLE SUPABASE CLIENT
// ==========================================

if (!window.supabase) {

    console.error(
        "❌ Supabase JS n'est pas chargé."
    );

} else {

    window.chessfkSupabase =
        window.supabase.createClient(
            CHESSFK_SUPABASE_URL,
            CHESSFK_SUPABASE_KEY
        );

    console.log(
        "✅ CHESS_FK SUPABASE READY"
    );

}


// ==========================================
// GET CURRENT USER
// ==========================================

window.getChessFKUser = async function () {

    try {

        const client =
            window.chessfkSupabase;

        if (!client) {

            console.error(
                "❌ Supabase client introuvable."
            );

            return null;

        }


        const {
            data,
            error
        } =
            await client.auth.getUser();


        if (error) {

            // Normalement il n'y a simplement
            // aucun utilisateur connecté.

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

};


// ==========================================
// AUTH STATE
// ==========================================

if (window.chessfkSupabase) {

    window.chessfkSupabase.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "🔐 Auth event:",
                event
            );


            const user =
                session?.user || null;


            if (user) {

                console.log(
                    "👤 CHESS_FK USER CONNECTED:",
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

            } else {

                console.log(
                    "👤 Aucun utilisateur connecté"
                );


                window.dispatchEvent(
                    new CustomEvent(
                        "chessfk-user-disconnected"
                    )
                );

            }

        }
    );

}


// ==========================================
// GOOGLE LOGIN
// ==========================================

window.signInWithGoogle = async function () {

    try {

        console.log(
            "🔐 Google login starting..."
        );


        const client =
            window.chessfkSupabase;


        if (!client) {

            console.error(
                "❌ Supabase client introuvable."
            );

            return;

        }


        const {
            data,
            error
        } =
            await client.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        "https://fariskamel41-glitch.github.io/Chess_FK/"

                }

            });


        if (error) {

            console.error(
                "❌ Google login error:",
                error
            );

            alert(
                "Erreur Google :\n\n" +
                error.message
            );

            return;

        }


        console.log(
            "✅ Google authentication started"
        );


    }

    catch (error) {

        console.error(
            "🔥 Google login exception:",
            error
        );

    }

};


// ==========================================
// LOGOUT
// ==========================================

window.signOutChessFK = async function () {

    try {

        const client =
            window.chessfkSupabase;


        if (!client) {

            return;

        }


        const {
            error
        } =
            await client.auth.signOut();


        if (error) {

            console.error(
                "❌ Logout error:",
                error
            );

            return;

        }


        console.log(
            "🚪 CHESS_FK USER LOGGED OUT"
        );


    }

    catch (error) {

        console.error(
            "🔥 Logout exception:",
            error
        );

    }

};


console.log(
    "🚀 CHESS_FK SUPABASE SYSTEM READY"
);
```
