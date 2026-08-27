// =========================================================
// CHESS_FK — ONLINE MATCHMAKING
// js/online.js
// Cherche un vrai joueur avec la même cadence.
// S'il n'y a personne, lance un bot international.
// =========================================================

const CHESS_FK_BOTS = [
    {
        id: "ali",
        name: "Ali",
        country: "Iran",
        flag: "🇮🇷",
        elo: 500,
        strength: 1,
        style: "BEGINNER"
    },
    {
        id: "mohamed",
        name: "Mohamed",
        country: "Syria",
        flag: "🇸🇾",
        elo: 750,
        strength: 2,
        style: "DEFENSIVE"
    },
    {
        id: "louise",
        name: "Louise",
        country: "France",
        flag: "🇫🇷",
        elo: 1000,
        strength: 4,
        style: "TACTICAL"
    },
    {
        id: "tomas",
        name: "Tomas",
        country: "United States",
        flag: "🇺🇸",
        elo: 1250,
        strength: 6,
        style: "FAST"
    },
    {
        id: "aiko",
        name: "Aiko",
        country: "Japan",
        flag: "🇯🇵",
        elo: 1500,
        strength: 9,
        style: "POSITIONAL"
    },
    {
        id: "diego",
        name: "Diego",
        country: "Argentina",
        flag: "🇦🇷",
        elo: 1750,
        strength: 12,
        style: "AGGRESSIVE"
    },
    {
        id: "elena",
        name: "Elena",
        country: "Italy",
        flag: "🇮🇹",
        elo: 2000,
        strength: 16,
        style: "MASTER"
    },
    {
        id: "viktor",
        name: "Viktor",
        country: "Ukraine",
        flag: "🇺🇦",
        elo: 2300,
        strength: 20,
        style: "GRANDMASTER"
    }
];

const BOT_WAITING_TIME = 8000;
let matchmakingTimer = null;
let currentQueueId = null;

/* Lit le profil du joueur connecté */
async function getCurrentChessFKPlayer() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        throw new Error("Tu dois te connecter avant de jouer online.");
    }

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("username, country")
        .eq("id", user.id)
        .single();

    if (profileError) {
        throw new Error("Impossible de lire ton profil.");
    }

    return {
        id: user.id,
        username: profile.username || "Chess Player",
        country: profile.country || "World"
    };
}

/* Petit message affiché dans la fenêtre de choix de cadence */
function setMatchmakingMessage(message, isError = false) {
    let messageBox = document.getElementById("matchmakingMessage");

    if (!messageBox) {
        messageBox = document.createElement("p");
        messageBox.id = "matchmakingMessage";
        messageBox.style.margin = "18px 0 0";
        messageBox.style.textAlign = "center";
        messageBox.style.fontSize = "12px";
        messageBox.style.fontWeight = "800";
        messageBox.style.letterSpacing = "0.5px";

        const footer = document.querySelector(".online-modal-footer");

        if (footer) {
            footer.before(messageBox);
        }
    }

    messageBox.textContent = message;
    messageBox.style.color = isError
        ? "#ff7a86"
        : "var(--primary)";
}

/* Choisit un bot. Les fortes cadences donnent parfois un bot plus fort. */
function chooseBot(timeSeconds) {
    const playerRating = Number(
        localStorage.getItem("chess_fk_rating")
    ) || 1000;

    let candidates = CHESS_FK_BOTS.filter((bot) => {
        return Math.abs(bot.elo - playerRating) <= 550;
    });

    if (candidates.length === 0) {
        candidates = [...CHESS_FK_BOTS];
    }

    if (timeSeconds >= 600) {
        candidates = candidates.filter((bot) => bot.elo >= 1000);

        if (candidates.length === 0) {
            candidates = [...CHESS_FK_BOTS];
        }
    }

    return candidates[
        Math.floor(Math.random() * candidates.length)
    ];
}

/* Démarre une partie avec le bot choisi */
async function startBotGame(player, timeSeconds, incrementSeconds) {
    const bot = chooseBot(timeSeconds);
    const playerIsWhite = Math.random() < 0.5;

    const newGame = {
        white_player_id: playerIsWhite ? player.id : null,
        black_player_id: playerIsWhite ? null : player.id,

        white_name: playerIsWhite
            ? player.username
            : `${bot.flag} ${bot.name}`,

        black_name: playerIsWhite
            ? `${bot.flag} ${bot.name}`
            : player.username,

        white_country: playerIsWhite
            ? player.country
            : bot.country,

        black_country: playerIsWhite
            ? bot.country
            : player.country,

        white_bot_id: playerIsWhite ? null : bot.id,
        black_bot_id: playerIsWhite ? bot.id : null,

        time_seconds: timeSeconds,
        increment_seconds: incrementSeconds,
        status: "playing",
        current_turn: "white",
        board_state: [],
        moves: [],
        white_time: timeSeconds,
        black_time: timeSeconds
    };

    const { data: game, error } = await supabaseClient
        .from("online_games")
        .insert(newGame)
        .select()
        .single();

    if (error) {
        throw new Error(
            "Impossible de créer la partie contre le bot : " +
            error.message
        );
    }

    window.location.href =
        `pages/plat.html?mode=online` +
        `&game=${game.id}` +
        `&time=${timeSeconds}` +
        `&increment=${incrementSeconds}` +
        `&bot=${bot.id}` +
        `&humanColor=${playerIsWhite ? "white" : "black"}`;
}

/* Cherche dans la file un joueur avec exactement la même cadence */
async function findRealOpponent(player, timeSeconds, incrementSeconds) {
    const { data: waitingPlayer, error } = await supabaseClient
        .from("matchmaking_queue")
        .select("*")
        .eq("status", "waiting")
        .eq("time_seconds", timeSeconds)
        .eq("increment_seconds", incrementSeconds)
        .neq("player_id", player.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return waitingPlayer;
}

/* Transforme deux joueurs en une partie réelle */
async function createRealGame(player, opponentQueue, timeSeconds, incrementSeconds) {
    const { data: opponentProfile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("username, country")
        .eq("id", opponentQueue.player_id)
        .single();

    if (profileError) {
        throw new Error("Impossible de lire le profil de l'adversaire.");
    }

    const playerIsWhite = Math.random() < 0.5;

    const gameData = {
        white_player_id: playerIsWhite ? player.id : opponentQueue.player_id,
        black_player_id: playerIsWhite ? opponentQueue.player_id : player.id,

        white_name: playerIsWhite
            ? player.username
            : (opponentProfile.username || "Chess Player"),

        black_name: playerIsWhite
            ? (opponentProfile.username || "Chess Player")
            : player.username,

        white_country: playerIsWhite
            ? player.country
            : opponentProfile.country,

        black_country: playerIsWhite
            ? opponentProfile.country
            : player.country,

        time_seconds: timeSeconds,
        increment_seconds: incrementSeconds,
        status: "playing",
        current_turn: "white",
        board_state: [],
        moves: [],
        white_time: timeSeconds,
        black_time: timeSeconds
    };

    const { data: game, error: gameError } = await supabaseClient
        .from("online_games")
        .insert(gameData)
        .select()
        .single();

    if (gameError) {
        throw new Error(gameError.message);
    }

    await supabaseClient
        .from("matchmaking_queue")
        .delete()
        .eq("id", opponentQueue.id);

    window.location.href =
        `pages/plat.html?mode=online` +
        `&game=${game.id}` +
        `&time=${timeSeconds}` +
        `&increment=${incrementSeconds}`;
}

/* Ajoute le joueur dans la file et attend */
async function startMatchmaking(timeSeconds, incrementSeconds) {
    try {
        clearTimeout(matchmakingTimer);
        setMatchmakingMessage("Recherche d’un vrai joueur…");

        const player = await getCurrentChessFKPlayer();
        const realOpponent = await findRealOpponent(
            player,
            timeSeconds,
            incrementSeconds
        );

        /* Un vrai joueur attend déjà : créer votre partie */
        if (realOpponent) {
            setMatchmakingMessage("Adversaire trouvé ! Préparation de la partie…");

            await createRealGame(
                player,
                realOpponent,
                timeSeconds,
                incrementSeconds
            );

            return;
        }

        /* Sinon le joueur rejoint la file */
        await supabaseClient
            .from("matchmaking_queue")
            .delete()
            .eq("player_id", player.id);

        const { data: queueEntry, error: queueError } = await supabaseClient
            .from("matchmaking_queue")
            .insert({
                player_id: player.id,
                time_seconds: timeSeconds,
                increment_seconds: incrementSeconds,
                status: "waiting"
            })
            .select()
            .single();

        if (queueError) {
            throw new Error(queueError.message);
        }

        currentQueueId = queueEntry.id;

        setMatchmakingMessage(
            "Recherche d’un vrai joueur… Si personne n’arrive, un adversaire arrive dans 8 secondes."
        );

        /* Vérifie régulièrement pendant 8 secondes */
        const checkInterval = setInterval(async () => {
            try {
                const opponent = await findRealOpponent(
                    player,
                    timeSeconds,
                    incrementSeconds
                );

                if (!opponent) return;

                clearInterval(checkInterval);
                clearTimeout(matchmakingTimer);

                await supabaseClient
                    .from("matchmaking_queue")
                    .delete()
                    .eq("id", currentQueueId);

                await createRealGame(
                    player,
                    opponent,
                    timeSeconds,
                    incrementSeconds
                );
            } catch (error) {
                console.error("Erreur matchmaking :", error);
            }
        }, 1500);

        /* Pas de joueur trouvé : partie contre un bot */
        matchmakingTimer = setTimeout(async () => {
            clearInterval(checkInterval);

            try {
                setMatchmakingMessage("Aucun joueur trouvé. Un bot arrive…");

                if (currentQueueId) {
                    await supabaseClient
                        .from("matchmaking_queue")
                        .delete()
                        .eq("id", currentQueueId);
                }

                await startBotGame(
                    player,
                    timeSeconds,
                    incrementSeconds
                );
            } catch (error) {
                setMatchmakingMessage(error.message, true);
            }
        }, BOT_WAITING_TIME);

    } catch (error) {
        console.error("Erreur online :", error);
        setMatchmakingMessage(error.message, true);
    }
}

/* Ferme la recherche si l'utilisateur ferme la fenêtre */
async function cancelMatchmaking() {
    clearTimeout(matchmakingTimer);

    if (currentQueueId) {
        await supabaseClient
            .from("matchmaking_queue")
            .delete()
            .eq("id", currentQueueId);

        currentQueueId = null;
    }

    const message = document.getElementById("matchmakingMessage");

    if (message) {
        message.textContent = "";
    }
}

/* Intercepte chaque choix de cadence sur la page Home */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".time-card").forEach((card) => {
        card.addEventListener("click", (event) => {
            event.preventDefault();

            const url = new URL(card.href);
            const timeSeconds = Number(url.searchParams.get("time"));
            const incrementSeconds = Number(
                url.searchParams.get("increment")
            ) || 0;

            startMatchmaking(timeSeconds, incrementSeconds);
        });
    });

    const closeButton = document.getElementById("closeOnlineModal");
    const backdrop = document.querySelector(".online-modal-backdrop");

    if (closeButton) {
        closeButton.addEventListener("click", cancelMatchmaking);
    }

    if (backdrop) {
        backdrop.addEventListener("click", cancelMatchmaking);
    }
});
