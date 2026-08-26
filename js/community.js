const supabaseCommunity = window.chessfkSupabase;

let allPlayers = [];

const countryFlags = {
    "Afghanistan": "🇦🇫",
    "Albania": "🇦🇱",
    "Algeria": "🇩🇿",
    "Andorra": "🇦🇩",
    "Angola": "🇦🇴",
    "Argentina": "🇦🇷",
    "Armenia": "🇦🇲",
    "Australia": "🇦🇺",
    "Austria": "🇦🇹",
    "Azerbaijan": "🇦🇿",
    "Bahrain": "🇧🇭",
    "Bangladesh": "🇧🇩",
    "Belarus": "🇧🇾",
    "Belgium": "🇧🇪",
    "Bolivia": "🇧🇴",
    "Bosnia and Herzegovina": "🇧🇦",
    "Botswana": "🇧🇼",
    "Brazil": "🇧🇷",
    "Bulgaria": "🇧🇬",
    "Cambodia": "🇰🇭",
    "Cameroon": "🇨🇲",
    "Canada": "🇨🇦",
    "Chile": "🇨🇱",
    "China": "🇨🇳",
    "Colombia": "🇨🇴",
    "Congo": "🇨🇬",
    "Croatia": "🇭🇷",
    "Cuba": "🇨🇺",
    "Cyprus": "🇨🇾",
    "Czechia": "🇨🇿",
    "Denmark": "🇩🇰",
    "Egypt": "🇪🇬",
    "Ethiopia": "🇪🇹",
    "Finland": "🇫🇮",
    "France": "🇫🇷",
    "Georgia": "🇬🇪",
    "Germany": "🇩🇪",
    "Greece": "🇬🇷",
    "India": "🇮🇳",
    "Indonesia": "🇮🇩",
    "Iraq": "🇮🇶",
    "Ireland": "🇮🇪",
    "Italy": "🇮🇹",
    "Japan": "🇯🇵",
    "Jordan": "🇯🇴",
    "Kazakhstan": "🇰🇿",
    "Kenya": "🇰🇪",
    "Kuwait": "🇰🇼",
    "Lebanon": "🇱🇧",
    "Libya": "🇱🇾",
    "Malaysia": "🇲🇾",
    "Mexico": "🇲🇽",
    "Morocco": "🇲🇦",
    "Netherlands": "🇳🇱",
    "Nigeria": "🇳🇬",
    "Norway": "🇳🇴",
    "Pakistan": "🇵🇰",
    "Palestine": "🇵🇸",
    "Philippines": "🇵🇭",
    "Poland": "🇵🇱",
    "Portugal": "🇵🇹",
    "Qatar": "🇶🇦",
    "Romania": "🇷🇴",
    "Russia": "🇷🇺",
    "Saudi Arabia": "🇸🇦",
    "Senegal": "🇸🇳",
    "Serbia": "🇷🇸",
    "Singapore": "🇸🇬",
    "Slovakia": "🇸🇰",
    "Slovenia": "🇸🇮",
    "Somalia": "🇸🇴",
    "South Africa": "🇿🇦",
    "South Korea": "🇰🇷",
    "Spain": "🇪🇸",
    "Sudan": "🇸🇩",
    "Sweden": "🇸🇪",
    "Switzerland": "🇨🇭",
    
    "Thailand": "🇹🇭",
    "Tunisia": "🇹🇳",
    "Turkey": "🇹🇷",
    "Ukraine": "🇺🇦",
    "United Arab Emirates": "🇦🇪",
    "United Kingdom": "🇬🇧",
    "United States": "🇺🇸",
    "Uzbekistan": "🇺🇿",
    "Venezuela": "🇻🇪",
    "Vietnam": "🇻🇳",
    "Yemen": "🇾🇪"
};

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getCountryDisplay(country) {
    if (!country) {
        return "🌍 World";
    }

    if (country === "Syria") {
        return `
            <img
                class="community-syria-flag"
                src="../images/syria-new-flag.svg"
                alt="New Syrian flag"
            >
            Syria
        `;
    }

    return `${countryFlags[country] || "🌍"} ${escapeHtml(country)}`;
}


function getInitial(username) {
    return escapeHtml((username || "P").charAt(0).toUpperCase());
}

function formatDate(date) {
    if (!date) return "New player";

    const formatted = new Date(date).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric"
    });

    return `Member since ${formatted}`;
}

function playerCard(player) {
    const username = escapeHtml(player.username || "PLAYER");
    const avatar = player.avatar_url
        ? `<img src="${escapeHtml(player.avatar_url)}" alt="${username}">`
        : `<span>${getInitial(player.username)}</span>`;

    return `
        <article class="player-card">
            <div class="player-card-top">
                <div class="community-avatar">
                    ${avatar}
                </div>

                <span class="online-status" title="CHESS_FK player">PLAYER</span>
            </div>

            <div class="player-info">
                <h2>${username}</h2>
                <p class="player-country">${getCountryDisplay(player.country)}</p>
            </div>

            <div class="player-ratings">
                <div>
                    <span>⚡ BLITZ</span>
                    <strong>${Number(player.blitz_rating || 800)}</strong>
                </div>

                <div>
                    <span>◈ RAPID</span>
                    <strong>${Number(player.rapid_rating || 800)}</strong>
                </div>
            </div>

            <div class="player-bottom">
                <span>♟ ${Number(player.games_played || 0)} games</span>
                <small>${formatDate(player.created_at)}</small>
            </div>
        </article>
    `;
}

function renderPlayers(players) {
    const grid = document.getElementById("communityGrid");
    const empty = document.getElementById("emptyCommunity");
    const results = document.getElementById("communityResults");

    results.textContent = `${players.length} player${players.length !== 1 ? "s" : ""} found`;

    if (!players.length) {
        grid.innerHTML = "";
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    grid.innerHTML = players.map(playerCard).join("");
}

function updateStatistics(players) {
    document.getElementById("totalPlayers").textContent = players.length;

    const totalGames = players.reduce((total, player) => {
        return total + Number(player.games_played || 0);
    }, 0);

    document.getElementById("totalGames").textContent = totalGames;

    if (players.length) {
        const topPlayer = [...players].sort((a, b) => {
            return Number(b.blitz_rating || 800) - Number(a.blitz_rating || 800);
        })[0];

        document.getElementById("topBlitz").textContent =
            `${topPlayer.username} · ${topPlayer.blitz_rating || 800}`;
    }
}

function searchPlayers() {
    const search = document.getElementById("playerSearch").value
        .trim()
        .toLowerCase();

    const filteredPlayers = allPlayers.filter((player) => {
        const username = (player.username || "").toLowerCase();
        const country = (player.country || "").toLowerCase();

        return username.includes(search) || country.includes(search);
    });

    renderPlayers(filteredPlayers);
}

async function loadCommunity() {
    const errorMessage = document.getElementById("communityError");

    const { data, error } = await supabaseCommunity
        .from("community_players")
        .select("*")
        .order("blitz_rating", { ascending: false });

    if (error) {
        console.error("Community error:", error);

        errorMessage.hidden = false;
        errorMessage.textContent =
            "Impossible de charger la communauté : " + error.message;

        document.getElementById("communityResults").textContent = "Error";
        return;
    }

    allPlayers = data || [];

    updateStatistics(allPlayers);
    renderPlayers(allPlayers);
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("playerSearch")
        .addEventListener("input", searchPlayers);

    loadCommunity();
});
