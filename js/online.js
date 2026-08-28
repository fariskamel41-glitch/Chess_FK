// =========================================================
// CHESS_FK — ONLINE MATCHMAKING
// js/online.js
//
// VRAI JOUEUR D'ABORD
// → même contrôle de temps
// → ELO proche
// → recherche continue
// → bot après délai si personne
// =========================================================

(function () {

    console.log("♟️ CHESS_FK ONLINE MATCHMAKING STARTING...");


    // =====================================================
    // CONFIGURATION
    // =====================================================

    const QUEUE_TABLE = "matchmaking_queue";
    const GAME_TABLE = "online_games";

    const SEARCH_INTERVAL = 2000;

    // Le bot arrive seulement après 20 secondes
    const BOT_DELAY = 20000;

    // La différence ELO augmente avec le temps
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
    // ID JOUEUR
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
    // LIRE LES INFOS DU JOUEUR
    // =====================================================

    function getCurrentPlayer() {

        const id = ensurePlayerId();

        return {

            id: id,

            name:
                localStorage.getItem(
                    "chess_fk_username"
                ) ||
                localStorage.getItem(
                    "username"
                ) ||
                "Joueur",

            elo:
                Number(
                    localStorage.getItem(
                        "chess_fk_rating"
                    )
                ) ||
                Number(
                    localStorage.getItem(
                        "chess_fk_elo"
                    )
                ) ||
                800,

            country:
                localStorage.getItem(
                    "chess_fk_country"
                ) ||
                "Monde",

            avatar:
                localStorage.getItem(
                    "chess_fk_avatar"
                ) ||
                localStorage.getItem(
                    "profile_avatar"
                ) ||
                ""

        };

    }


    // =====================================================
    // DIFFÉRENCE ELO ACTUELLE
    // =====================================================

    function getEloRange() {

        if (!currentSearch) {
            return 100;
        }

        const elapsed =
            Date.now() -
            currentSearch.startedAt;

        let range = 100;

        for (const step of ELO_STEPS) {

            if (elapsed >= step.after) {
                range = step.range;
            }

        }

        return range;

    }


    // =====================================================
    // NETTOYER LES TIMERS
    // =====================================================

    function clearSearchTimers() {

        if (matchmakingTimer) {

            clearInterval(matchmakingTimer);

            matchmakingTimer = null;

        }

        if (botTimer) {

            clearTimeout(botTimer);

            botTimer = null;

        }

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

        } catch {

            return null;

        }

    }


    // =====================================================
    // SUPPRIMER MA RECHERCHE
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

            console.warn(
                "⚠️ Impossible de supprimer la recherche :",
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

            return false;

        }

        console.log(
            "✅ Joueur ajouté à la file"
        );

        return true;

    }


    // =====================================================
    // TROUVER UN ADVERSAIRE
    // =====================================================

    async function findOpponent(
        supabaseClient
    ) {

        if (
            !currentSearch ||
            !matchmakingActive
        ) {
            return null;
        }

        const player =
            currentSearch.player;

        const eloRange =
            getEloRange();

        const result =
            await supabaseClient
                .from(QUEUE_TABLE)
                .select("*")
                .eq(
                    "time_control",
                    currentSearch.timeControl
                )
                .neq(
                    "player_id",
                    player.id
                )
                .gte(
                    "player_elo",
                    player.elo - eloRange
                )
                .lte(
                    "player_elo",
                    player.elo + eloRange
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                )
                .limit(10);

        if (result.error) {

            console.error(
                "❌ Erreur recherche joueur :",
                result.error
            );

            return null;

        }

        if (
            !result.data ||
            result.data.length === 0
        ) {
            return null;
        }


        // Prendre le joueur avec l'ELO
        // le plus proche
        result.data.sort(
            function (a, b) {

                const diffA =
                    Math.abs(
                        Number(a.player_elo) -
                        player.elo
                    );

                const diffB =
                    Math.abs(
                        Number(b.player_elo) -
                        player.elo
                    );

                return diffA - diffB;

            }
        );

        return result.data[0];

    }


    // =====================================================
    // CRÉER UNE PARTIE CONTRE UN VRAI JOUEUR
    // =====================================================

    async function createOnlineGame(
        supabaseClient,
        opponent
    ) {

        if (
            !currentSearch ||
            !matchmakingActive
        ) {
            return;
        }

        // Empêche le timer du bot
        matchmakingActive = false;

        clearSearchTimers();

        const player =
            currentSearch.player;

        const youAreWhite =
            Math.random() >= 0.5;


        console.log(
            "🎯 VRAI JOUEUR TROUVÉ :",
            opponent.player_name
        );


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
                        currentSearch.timeControl,

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


        // Retirer les deux joueurs de la file
        await removeFromQueue(
            supabaseClient,
            player.id
        );

        await supabaseClient
            .from(QUEUE_TABLE)
            .delete()
            .eq(
                "id",
                opponent.id
            );


        // Sauvegarder les vraies informations
        saveMatch({

            gameId:
                gameResult.data.id,

            mode:
                "online",

            timeControl:
                currentSearch.timeControl,

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
                    opponent.player_id,

                name:
                    opponent.player_name ||
                    "Adversaire",

                elo:
                    Number(
                        opponent.player_elo
                    ) ||
                    800,

                country:
                    opponent.player_country ||
                    "Monde",

                avatar:
                    opponent.player_avatar ||
                    "",

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
            "pages/plat.html?game=" +
            gameResult.data.id;

    }


    // =====================================================
    // BOTS DE SECOURS
    // =====================================================

    const BOTS = [

        {
            id: "bot_leo",
            name: "LeoChess",
            country: "France",
            elo: 750,
            level: "Débutant",
            avatar: "",
            isBot: true
        },

        {
            id: "bot_sami",
            name: "Sami",
            country: "Maroc",
            elo: 950,
            level: "Amateur",
            avatar: "",
            isBot: true
        },

        {
            id: "bot_alex",
            name: "Alex",
            country: "Allemagne",
            elo: 1200,
            level: "Intermédiaire",
            avatar: "",
            isBot: true
        },

        {
            id: "bot_noah",
            name: "Noah",
            country: "Canada",
            elo: 1450,
            level: "Confirmé",
            avatar: "",
            isBot: true
        },

        {
            id: "bot_amina",
            name: "Amina",
            country: "Algérie",
            elo: 1700,
            level: "Avancé",
            avatar: "",
            isBot: true
        },

        {
            id: "bot_faris",
            name: "Faris AI",
            country: "Syrie",
            elo: 2000,
            level: "Expert",
            avatar: "",
            isBot: true
        }

    ];


    // =====================================================
    // CHOISIR LE BOT LE PLUS PROCHE
    // =====================================================

    function getBestBot(
        playerElo
    ) {

        const sorted =
            [...BOTS].sort(
                function (a, b) {

                    return (
                        Math.abs(
                            a.elo -
                            playerElo
                        ) -
                        Math.abs(
                            b.elo -
                            playerElo
                        )
                    );

                }
            );

        // Un peu de variété parmi les
        // 2 bots les plus proches
        const choices =
            sorted.slice(
                0,
                Math.min(
                    2,
                    sorted.length
                )
            );

        return choices[
            Math.floor(
                Math.random() *
                choices.length
            )
        ];

    }


    // =====================================================
    // LANCER LE BOT
    // =====================================================

    async function startBotGame() {

        if (
            !matchmakingActive ||
            !currentSearch
        ) {
            return;
        }

        matchmakingActive = false;

        clearSearchTimers();

        const supabaseClient =
            getSupabaseClient();

        const player =
            currentSearch.player;

        const bot =
            getBestBot(
                player.elo
            );

        console.log(
            "🤖 Aucun joueur trouvé → BOT :",
            bot.name
        );


        if (supabaseClient) {

            await removeFromQueue(
                supabaseClient,
                player.id
            );

        }


        const youAreWhite =
            Math.random() >= 0.5;


        saveMatch({

            gameId:
                "bot_" +
                crypto.randomUUID(),

            mode:
                "bot",

            timeControl:
                currentSearch.timeControl,

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

                ...bot,

                color:
                    youAreWhite
                        ? "black"
                        : "white",

                status:
                    "EN JEU"

            }

        });


        // Le paramètre bot permet à
        // online-players.js / l'échiquier
        // de savoir que c'est un bot
        window.location.href =
            "pages/plat.html" +
            "?bot=" +
            encodeURIComponent(bot.id) +
            "&color=" +
            encodeURIComponent(
                youAreWhite
                    ? "black"
                    : "white"
            ) +
            "&time=" +
            encodeURIComponent(
                currentSearch.timeControl
            );

    }


    // =====================================================
    // BOUCLE DE RECHERCHE
    // =====================================================

    async function searchLoop() {

        if (
            !matchmakingActive
        ) {
            return;
        }

        const supabaseClient =
            getSupabaseClient();

        if (!supabaseClient) {
            return;
        }

        const opponent =
            await findOpponent(
                supabaseClient
            );

        if (opponent) {

            await createOnlineGame(
                supabaseClient,
                opponent
            );

        }

    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    function showSearching(
        timeControl
    ) {

        console.log(
            "🔎 Recherche d'un joueur...",
            timeControl
        );

        // Événement disponible si ton
        // interface veut afficher une popup
        window.dispatchEvent(
            new CustomEvent(
                "chessfk:searching",
                {
                    detail: {
                        timeControl:
                            timeControl
                    }
                }
            )
        );

    }


    // =====================================================
    // DÉMARRER LE MATCHMAKING
    // =====================================================

    async function startMatchmaking(
        timeControl
    ) {

        // Arrêter une ancienne recherche
        await cancelMatchmaking();


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


        currentSearch = {

            player:
                player,

            timeControl:
                String(timeControl),

            startedAt:
                Date.now()

        };


        matchmakingActive = true;


        console.log(
            "🔎 MATCHMAKING START",
            currentSearch
        );


        const joined =
            await joinQueue(
                supabaseClient,
                player,
                String(timeControl)
            );


        if (!joined) {

            matchmakingActive = false;

            return;

        }


        showSearching(
            timeControl
        );


        // Vérifier immédiatement
        await searchLoop();


        // Puis vérifier toutes les 2 secondes
        matchmakingTimer =
            setInterval(
                searchLoop,
                SEARCH_INTERVAL
            );


        // Après 20 secondes sans joueur :
        // lancer un bot
        botTimer =
            setTimeout(
                startBotGame,
                BOT_DELAY
            );

    }


    // =====================================================
    // ANNULER LA RECHERCHE
    // =====================================================

    async function cancelMatchmaking() {

        clearSearchTimers();

        matchmakingActive = false;

        const supabaseClient =
            getSupabaseClient();

        const playerId =
            localStorage.getItem(
                "chess_fk_user_id"
            );

        if (
            supabaseClient &&
            playerId
        ) {

            await removeFromQueue(
                supabaseClient,
                playerId
            );

        }


        currentSearch = null;


        console.log(
            "❌ Recherche annulée"
        );


        window.dispatchEvent(
            new CustomEvent(
                "chessfk:search-cancelled"
            )
        );

    }


    // =====================================================
    // NETTOYER SI LE JOUEUR QUITTE
    // =====================================================

    window.addEventListener(
        "beforeunload",
        function () {

            if (
                matchmakingActive
            ) {

                const supabaseClient =
                    getSupabaseClient();

                const playerId =
                    localStorage.getItem(
                        "chess_fk_user_id"
                    );

                if (
                    supabaseClient &&
                    playerId
                ) {

                    supabaseClient
                        .from(QUEUE_TABLE)
                        .delete()
                        .eq(
                            "player_id",
                            playerId
                        );

                }

            }

        }
    );


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

    FK.getBotById =
        function (botId) {

            return BOTS.find(
                function (bot) {

                    return bot.id === botId;

                }
            ) || null;

        };


    // Compatibilité avec ton HTML actuel

    window.startMatchmaking =
        startMatchmaking;

    window.cancelMatchmaking =
        cancelMatchmaking;


    console.log(
        "✅ CHESS_FK ONLINE MATCHMAKING READY"
    );

})();