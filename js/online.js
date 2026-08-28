// =========================================================
// CHESS_FK — ONLINE SYSTEM
// js/online.js
// =========================================================
const supabaseClient = window.supabaseClient;
(function () {

    console.log("♟️ CHESS_FK ONLINE SYSTEM STARTING...");


    // =====================================================
    // SUPABASE
    // =====================================================

    function getSupabaseClient() {

        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        if (window.chessfkSupabase) {
            return window.chessfkSupabase;
        }

        console.error(
            "❌ Supabase client introuvable"
        );

        return null;
    }


    // =====================================================
    // CHESSFK GLOBAL
    // =====================================================

    window.CHESSFK =
        window.CHESSFK || {};

    const FK =
        window.CHESSFK;


    // =====================================================
    // CONFIGURATION
    // =====================================================

    const QUEUE_TABLE =
        "matchmaking_queue";

    const GAME_TABLE =
        "online_games";


    // =====================================================
    // LIRE LE JOUEUR
    // =====================================================

    function getCurrentPlayer() {

        return {

            id:
                localStorage.getItem(
                    "chess_fk_user_id"
                ) || crypto.randomUUID(),

            name:
                localStorage.getItem(
                    "chess_fk_username"
                ) || "Joueur",

            elo:
                Number(
                    localStorage.getItem(
                        "chess_fk_rating"
                    )
                ) || 800,

            country:
                localStorage.getItem(
                    "chess_fk_country"
                ) || "Monde"

        };

    }


    // =====================================================
    // SAUVEGARDER ID JOUEUR
    // =====================================================

    function ensurePlayerId() {

        let id =
            localStorage.getItem(
                "chess_fk_user_id"
            );

        if (!id) {

            id =
                crypto.randomUUID();

            localStorage.setItem(
                "chess_fk_user_id",
                id
            );

        }

        return id;

    }


    // =====================================================
    // LANCER UNE RECHERCHE
    // =====================================================

    async function startMatchmaking(
        timeControl
    ) {

        const supabaseClient =
            getSupabaseClient();

        if (!supabaseClient) {

            alert(
                "Erreur : Supabase n'est pas connecté."
            );

            return;

        }

        const player =
            getCurrentPlayer();

        ensurePlayerId();


        console.log(
            "🔎 Recherche d'un adversaire...",
            player
        );


        try {

            // ---------------------------------------------
            // SUPPRIMER ANCIENNE RECHERCHE
            // ---------------------------------------------

            await supabaseClient
                .from(QUEUE_TABLE)
                .delete()
                .eq(
                    "player_id",
                    player.id
                );


            // ---------------------------------------------
            // CHERCHER UN ADVERSAIRE
            // ---------------------------------------------

            const result =
                await supabaseClient
                    .from(QUEUE_TABLE)
                    .select("*")
                    .neq(
                        "player_id",
                        player.id
                    )
                    .eq(
                        "time_control",
                        timeControl
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    )
                    .limit(1);


            if (result.error) {

                console.error(
                    "❌ Erreur recherche :",
                    result.error
                );

                return;

            }


            // ---------------------------------------------
            // ADVERSAIRE TROUVÉ
            // ---------------------------------------------

            if (
                result.data &&
                result.data.length > 0
            ) {

                const opponent =
                    result.data[0];


                console.log(
                    "🎯 Adversaire trouvé !",
                    opponent
                );


                // Couleur aléatoire
                const youAreWhite =
                    Math.random() > 0.5;


                // Créer la partie
                const gameResult =
                    await supabaseClient
                        .from(GAME_TABLE)
                        .insert({

                            white_player_id:
                                youAreWhite
                                    ? player.id
                                    : opponent.player_id,

                            black_player_id:
                                youAreWhite
                                    ? opponent.player_id
                                    : player.id,

                            time_control:
                                timeControl,

                            status:
                                "playing"

                        })
                        .select()
                        .single();


                if (
                    gameResult.error
                ) {

                    console.error(
                        "❌ Erreur création partie :",
                        gameResult.error
                    );

                    return;

                }


                // Supprimer adversaire de la file
                await supabaseClient
                    .from(QUEUE_TABLE)
                    .delete()
                    .eq(
                        "id",
                        opponent.id
                    );


                // Sauvegarder la partie
                saveMatch({

                    gameId:
                        gameResult.data.id,

                    you: {

                        id:
                            player.id,

                        name:
                            player.name,

                        elo:
                            player.elo,

                        country:
                            player.country,

                        color:
                            youAreWhite
                                ? "white"
                                : "black",

                        isYou:
                            true,

                        status:
                            "TOI"

                    },

                    opponent: {

                        id:
                            opponent.player_id,

                        name:
                            opponent.player_name ||
                            "Adversaire",

                        elo:
                            opponent.player_elo ||
                            800,

                        country:
                            opponent.player_country ||
                            "Monde",

                        color:
                            youAreWhite
                                ? "black"
                                : "white",

                        status:
                            "EN LIGNE"

                    }

                });


                // Aller vers l'échiquier
                window.location.href =
                    `pages/plat.html?game=${gameResult.data.id}`;

                return;

            }


            // ---------------------------------------------
            // PERSONNE TROUVÉ
            // ---------------------------------------------

            console.log(
                "⌛ Aucun adversaire trouvé."
            );


            // Ajouter le joueur à la file
            const queueResult =
                await supabaseClient
                    .from(QUEUE_TABLE)
                    .insert({

                        player_id:
                            player.id,

                        player_name:
                            player.name,

                        player_elo:
                            player.elo,

                        player_country:
                            player.country,

                        time_control:
                            timeControl

                    });


            if (
                queueResult.error
            ) {

                console.error(
                    "❌ Erreur ajout file :",
                    queueResult.error
                );

                alert(
                    "Impossible de rejoindre la recherche."
                );

                return;

            }


            showSearching(
                timeControl
            );


        } catch (error) {

            console.error(
                "❌ ERREUR ONLINE :",
                error
            );

        }

    }


    // =====================================================
    // SAUVEGARDER MATCH
    // =====================================================

    function saveMatch(match) {

        localStorage.setItem(
            "chess_fk_match",
            JSON.stringify(match)
        );

    }


    // =====================================================
    // LIRE MATCH
    // =====================================================

    function readMatch() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "chess_fk_match"
                )
            );

        } catch {

            return null;

        }

    }


    // =====================================================
    // AFFICHER RECHERCHE
    // =====================================================

    function showSearching(
        timeControl
    ) {

        console.log(
            `⌛ Recherche d'un joueur (${timeControl})...`
        );

        alert(
            "🔎 Recherche d'un adversaire...\n\n" +
            "Contrôle : " +
            timeControl
        );

    }


    // =====================================================
    // ANNULER RECHERCHE
    // =====================================================

    async function cancelMatchmaking() {

        const supabaseClient =
            getSupabaseClient();

        if (!supabaseClient) {
            return;
        }

        const playerId =
            ensurePlayerId();


        try {

            await supabaseClient
                .from(QUEUE_TABLE)
                .delete()
                .eq(
                    "player_id",
                    playerId
                );

            console.log(
                "❌ Recherche annulée"
            );

        } catch (error) {

            console.error(
                error
            );

        }

    }


    // =====================================================
    // API PUBLIQUE
    // =====================================================

    FK.startMatchmaking =
        startMatchmaking;

    FK.cancelMatchmaking =
        cancelMatchmaking;

    FK.readMatch =
        readMatch;

    FK.saveMatch =
        saveMatch;


    // =====================================================
    // COMPATIBILITÉ
    // =====================================================

    window.startMatchmaking =
        startMatchmaking;

    window.cancelMatchmaking =
        cancelMatchmaking;


    console.log(
        "✅ CHESS_FK ONLINE SYSTEM READY"
    );

})();