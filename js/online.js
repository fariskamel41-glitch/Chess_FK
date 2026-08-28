// =========================================================
// CHESS_FK — ONLINE MATCHMAKING
// js/online.js
//
// VRAIS JOUEURS D'ABORD
// Même temps + ELO proche
// Les DEUX joueurs reçoivent le même gameId
// Bot seulement après attente
// =========================================================

(function () {

    console.log("♟️ CHESS_FK ONLINE MATCHMAKING STARTING...");


    // =====================================================
    // CONFIGURATION
    // =====================================================

    const QUEUE_TABLE = "matchmaking_queue";
    const GAME_TABLE = "online_games";

    const SEARCH_INTERVAL = 2000;
    const BOT_DELAY = 20000;

    const ELO_STEPS = [
        { after: 0, range: 100 },
        { after: 5000, range: 200 },
        { after: 10000, range: 350 },
        { after: 15000, range: 600 }
    ];


    // =====================================================
    // ÉTAT
    // =====================================================

    let matchmakingActive = false;
    let matchmakingTimer = null;
    let botTimer = null;

    let currentSearch = null;
    let redirectingToGame = false;


    // =====================================================
    // CHESSFK GLOBAL
    // =====================================================

    window.CHESSFK = window.CHESSFK || {};

    const FK = window.CHESSFK;


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

        console.error("❌ Supabase client introuvable");

        return null;
    }


    // =====================================================
    // ID DU JOUEUR
    // =====================================================

    function ensurePlayerId() {

        let id = localStorage.getItem(
            "chess_fk_user_id"
        );

        if (!id) {

            id = crypto.randomUUID();

            localStorage.setItem(
                "chess_fk_user_id",
                id
            );
        }

        return id;
    }


    // =====================================================
    // JOUEUR ACTUEL
    // =====================================================

    function getCurrentPlayer() {

        const id = ensurePlayerId();

        return {

            id: id,

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
                ) || "Monde",

            avatar:
                localStorage.getItem(
                    "chess_fk_avatar"
                ) || ""
        };
    }


    // =====================================================
    // SAUVEGARDER LE MATCH
    // =====================================================

    function saveMatch(match) {

        localStorage.setItem(
            "chess_fk_match",
            JSON.stringify(match)
        );
    }


    // =====================================================
    // LIRE LE MATCH
    // =====================================================

    function readMatch() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "chess_fk_match"
                )
            );

        } catch (error) {

            return null;
        }
    }


    // =====================================================
    // DIFFÉRENCE ELO AUTORISÉE
    // =====================================================

    function getEloRange() {

        if (!currentSearch) {
            return 100;
        }

        const elapsed =
            Date.now() -
            currentSearch.startedAt;

        let range = 100;

        ELO_STEPS.forEach(step => {

            if (elapsed >= step.after) {
                range = step.range;
            }
        });

        return range;
    }


    // =====================================================
    // NETTOYER LES TIMERS
    // =====================================================

    function clearSearchTimers() {

        if (matchmakingTimer) {

            clearInterval(
                matchmakingTimer
            );

            matchmakingTimer = null;
        }

        if (botTimer) {

            clearTimeout(
                botTimer
            );

            botTimer = null;
        }
    }


    // =====================================================
    // SUPPRIMER DE LA FILE
    // =====================================================

    async function removeFromQueue(
        supabaseClient,
        playerId
    ) {

        const result =
            await supabaseClient
                .from(QUEUE_TABLE)
                .delete()
                .eq(
                    "player_id",
                    playerId
                );

        if (result.error) {

            console.error(
                "❌ Impossible de supprimer la recherche :",
                result.error
            );
        }
    }


    // =====================================================
    // AJOUTER À LA FILE
    // =====================================================

    async function joinQueue(
        supabaseClient,
        player,
        timeControl
    ) {

        await removeFromQueue(
            supabaseClient,
            player.id
        );

        const result =
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

                    player_avatar:
                        player.avatar,

                    time_control:
                        timeControl
                });

        if (result.error) {

            console.error(
                "❌ Erreur ajout file :",
                result.error
            );

            throw result.error;
        }
    }


    // =====================================================
    // CHERCHER UN ADVERSAIRE
    // =====================================================

    async function findOpponent() {

        if (
            !matchmakingActive ||
            !currentSearch ||
            redirectingToGame
        ) {
            return;
        }

        const supabaseClient =
            currentSearch.supabaseClient;

        const player =
            currentSearch.player;

        const timeControl =
            currentSearch.timeControl;

        const range =
            getEloRange();

        const minElo =
            player.elo - range;

        const maxElo =
            player.elo + range;


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
                .gte(
                    "player_elo",
                    minElo
                )
                .lte(
                    "player_elo",
                    maxElo
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
                "❌ Erreur recherche adversaire :",
                result.error
            );

            return;
        }


        if (
            !result.data ||
            result.data.length === 0
        ) {
            return;
        }


        const opponent =
            result.data[0];


        console.log(
            "🎯 ADVERSAIRE TROUVÉ :",
            opponent.player_name
        );


        // =================================================
        // ARRÊTER LA RECHERCHE LOCALE
        // =================================================

        matchmakingActive = false;

        clearSearchTimers();


        // =================================================
        // SUPPRIMER LES DEUX JOUEURS DE LA FILE
        // =================================================

        await supabaseClient
            .from(QUEUE_TABLE)
            .delete()
            .in(
                "player_id",
                [
                    player.id,
                    opponent.player_id
                ]
            );


        // =================================================
        // COULEURS
        // =================================================

        const youAreWhite =
            Math.random() >= 0.5;


        // =================================================
        // CRÉER LA PARTIE
        // =================================================

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


        if (gameResult.error) {

            console.error(
                "❌ Erreur création partie :",
                gameResult.error
            );

            matchmakingActive = true;

            return;
        }


        const game =
            gameResult.data;


        console.log(
            "♟️ PARTIE CRÉÉE :",
            game.id
        );


        // =================================================
        // SAUVEGARDER LE MATCH POUR CE JOUEUR
        // =================================================

        const yourColor =
            youAreWhite
                ? "white"
                : "black";

        const opponentColor =
            youAreWhite
                ? "black"
                : "white";


        saveMatch({

            gameId:
                game.id,

            you: {

                id:
                    player.id,

                name:
                    player.name,

                elo:
                    player.elo,

                country:
                    player.country,

                avatar:
                    player.avatar,

                color:
                    yourColor,

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

                avatar:
                    opponent.player_avatar ||
                    "",

                color:
                    opponentColor,

                status:
                    "EN LIGNE"
            }
        });


        redirectToGame(
            game.id
        );
    }


    // =====================================================
    // VÉRIFIER SI UN AUTRE JOUEUR A CRÉÉ NOTRE PARTIE
    // =====================================================

    async function checkForCreatedGame() {

        if (
            !matchmakingActive ||
            !currentSearch ||
            redirectingToGame
        ) {
            return;
        }

        const supabaseClient =
            currentSearch.supabaseClient;

        const player =
            currentSearch.player;


        const result =
            await supabaseClient
                .from(GAME_TABLE)
                .select("*")
                .or(
                    `white_player_id.eq.${player.id},black_player_id.eq.${player.id}`
                )
                .eq(
                    "status",
                    "playing"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1);


        if (
            result.error ||
            !result.data ||
            result.data.length === 0
        ) {
            return;
        }


        const game =
            result.data[0];


        console.log(
            "♟️ UNE PARTIE A ÉTÉ CRÉÉE POUR MOI :",
            game.id
        );


        matchmakingActive = false;

        clearSearchTimers();

        await removeFromQueue(
            supabaseClient,
            player.id
        );


        const youAreWhite =
            game.white_player_id ===
            player.id;

        const opponentId =
            youAreWhite
                ? game.black_player_id
                : game.white_player_id;


        // On cherche les infos de l'adversaire
        // dans la recherche actuelle si possible.

        saveMatch({

            gameId:
                game.id,

            you: {

                id:
                    player.id,

                name:
                    player.name,

                elo:
                    player.elo,

                country:
                    player.country,

                avatar:
                    player.avatar,

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
                    opponentId,

                name:
                    "Adversaire",

                elo:
                    800,

                country:
                    "Monde",

                avatar:
                    "",

                color:
                    youAreWhite
                    ? "black"
                    : "white",

                status:
                    "EN LIGNE"
            }
        });


        redirectToGame(
            game.id
        );
    }


    // =====================================================
    // REDIRECTION VERS LA PARTIE
    // =====================================================

    function redirectToGame(gameId) {

        if (redirectingToGame) {
            return;
        }

        redirectingToGame = true;

        window.location.href =
            `pages/plat.html?game=${gameId}&mode=online`;
    }


    // =====================================================
    // BOT DE SECOURS
    // =====================================================

    function startBotFallback() {

        botTimer =
            setTimeout(async () => {

                if (
                    !matchmakingActive ||
                    !currentSearch
                ) {
                    return;
                }


                console.log(
                    "🤖 Aucun joueur trouvé, lancement du bot."
                );


                const supabaseClient =
                    currentSearch.supabaseClient;

                const player =
                    currentSearch.player;


                matchmakingActive = false;

                clearSearchTimers();

                await removeFromQueue(
                    supabaseClient,
                    player.id
                );


                const botAge =
                    Math.floor(
                        Math.random() * 6
                    ) + 13;


                window.location.href =
                    `pages/faris-ai.html?age=${botAge}&color=black`;

            }, BOT_DELAY);
    }


    // =====================================================
    // LANCER LE MATCHMAKING
    // =====================================================

    async function startMatchmaking(
        timeControl
    ) {

        if (matchmakingActive) {

            console.log(
                "⚠️ Recherche déjà en cours"
            );

            return;
        }


        const supabaseClient =
            getSupabaseClient();

        if (!supabaseClient) {

            alert(
                "❌ Supabase n'est pas connecté."
            );

            return;
        }


        const player =
            getCurrentPlayer();


        console.log(
            "🔎 RECHERCHE D'UN VRAI JOUEUR...",
            player
        );


        matchmakingActive = true;

        redirectingToGame = false;


        currentSearch = {

            supabaseClient:
                supabaseClient,

            player:
                player,

            timeControl:
                timeControl,

            startedAt:
                Date.now()
        };


        try {

            // Ajouter ce joueur à la file

            await joinQueue(
                supabaseClient,
                player,
                timeControl
            );


            console.log(
                `⌛ Recherche : ${timeControl}`
            );


            // Vérification immédiate

            await checkForCreatedGame();

            if (matchmakingActive) {

                await findOpponent();
            }


            // Vérifier régulièrement :
            // 1. un adversaire dans la file
            // 2. une partie créée par l'autre joueur

            matchmakingTimer =
                setInterval(async () => {

                    if (!matchmakingActive) {
                        return;
                    }

                    await checkForCreatedGame();

                    if (!matchmakingActive) {
                        return;
                    }

                    await findOpponent();

                }, SEARCH_INTERVAL);


            // Bot seulement après 20 secondes

            startBotFallback();


        } catch (error) {

            console.error(
                "❌ ERREUR MATCHMAKING :",
                error
            );

            matchmakingActive = false;

            clearSearchTimers();

            alert(
                "Erreur lors de la recherche d'un adversaire."
            );
        }
    }


    // =====================================================
    // ANNULER LA RECHERCHE
    // =====================================================

    async function cancelMatchmaking() {

        if (!currentSearch) {
            return;
        }


        const supabaseClient =
            currentSearch.supabaseClient;

        const player =
            currentSearch.player;


        matchmakingActive = false;

        clearSearchTimers();


        await removeFromQueue(
            supabaseClient,
            player.id
        );


        currentSearch = null;


        console.log(
            "❌ Recherche annulée"
        );
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


    // Compatibilité

    window.startMatchmaking =
        startMatchmaking;

    window.cancelMatchmaking =
        cancelMatchmaking;


    console.log(
        "✅ CHESS_FK ONLINE MATCHMAKING READY"
    );

})();