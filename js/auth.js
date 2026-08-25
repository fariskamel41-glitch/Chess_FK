// ======================================================
// CHESS_FK - AUTHENTIFICATION GOOGLE + PROFIL
// ======================================================

console.log("🔐 CHESS_FK AUTH STARTING...");

const chessfkAuth = window.chessfkSupabase;

let loginButton = null;


// ======================================================
// ÉLÉMENTS DE LA PAGE
// ======================================================

function findAuthElements() {
    loginButton = document.getElementById("loginButton");
}


// ======================================================
// INFOS UTILISATEUR GOOGLE
// ======================================================

function getUserDisplayName(user) {
    if (!user) return "PLAYER";

    const metadata = user.user_metadata || {};

    return (
        metadata.chess_username ||
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "PLAYER"
    );
}

function getUserAvatar(user) {
    if (!user) return "";

    const metadata = user.user_metadata || {};

    return metadata.avatar_url || metadata.picture || "";
}


// ======================================================
// LIRE LE PROFIL DANS SUPABASE
// ======================================================

async function getChessFKProfile(user) {
    if (!user || !chessfkAuth) return null;

    const { data, error } = await chessfkAuth
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Erreur lecture profil :", error);
        return null;
    }

    return data;
}


// ======================================================
// PREMIÈRE CONNEXION : CRÉER LE PROFIL
// ======================================================

async function createChessFKProfile(user) {
    const username = prompt(
        "♟️ Bienvenue sur CHESS_FK !\n\nChoisis ton pseudo (3 à 20 caractères) :"
    );

    if (!username || username.trim().length < 3) {
        alert("Ton pseudo doit contenir au moins 3 caractères.");
        return null;
    }

    const country = prompt("🌍 Dans quel pays habites-tu ?");

    if (!country || !country.trim()) {
        alert("Tu dois écrire ton pays.");
        return null;
    }

    const { data, error } = await chessfkAuth
        .from("profiles")
        .insert({
            id: user.id,
            username: username.trim(),
            country: country.trim(),
            avatar_url: getUserAvatar(user)
        })
        .select()
        .single();

    if (error) {
        console.error("Erreur création profil :", error);

        if (error.code === "23505") {
            alert("Ce pseudo existe déjà. Choisis un autre pseudo.");
        } else {
            alert("Impossible de créer ton profil : " + error.message);
        }

        return null;
    }

    return data;
}


// ======================================================
// AFFICHER LE PROFIL À LA PLACE DE SIGN IN
// ======================================================

function showProfileInterface(user, profile) {
    if (!user) return;

    // Ne pas créer deux fois le profil dans le header
    const existingProfile = document.getElementById("chessfkProfileArea");

    if (existingProfile) {
        updateProfileInterface(user, profile);
        return;
    }

    const playerName = profile?.username || getUserDisplayName(user);
    const avatarUrl = profile?.avatar_url || getUserAvatar(user);

    const profileArea = document.createElement("div");
    profileArea.id = "chessfkProfileArea";
    profileArea.style.position = "relative";
    profileArea.style.display = "flex";
    profileArea.style.alignItems = "center";

    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.id = "chessfkProfileButton";
    profileButton.style.display = "flex";
    profileButton.style.alignItems = "center";
    profileButton.style.gap = "8px";
    profileButton.style.padding = "7px 12px";
    profileButton.style.border = "1px solid rgba(255,255,255,0.18)";
    profileButton.style.borderRadius = "999px";
    profileButton.style.background = "rgba(0,0,0,0.35)";
    profileButton.style.color = "white";
    profileButton.style.fontWeight = "bold";
    profileButton.style.cursor = "pointer";

    const avatar = document.createElement("img");
    avatar.id = "chessfkProfileAvatar";
    avatar.width = 30;
    avatar.height = 30;
    avatar.style.width = "30px";
    avatar.style.height = "30px";
    avatar.style.borderRadius = "50%";
    avatar.style.objectFit = "cover";
    avatar.style.background = "#b51f2d";

    if (avatarUrl) {
        avatar.src = avatarUrl;
    } else {
        avatar.style.display = "none";
    }

    const name = document.createElement("span");
    name.id = "chessfkProfileName";
    name.textContent = playerName;

    const arrow = document.createElement("span");
    arrow.textContent = "▼";
    arrow.style.fontSize = "9px";

    profileButton.append(avatar, name, arrow);

    // Menu du profil
    const menu = document.createElement("div");
    menu.id = "chessfkProfileMenu";
    menu.style.display = "none";
    menu.style.position = "absolute";
    menu.style.right = "0";
    menu.style.top = "calc(100% + 10px)";
    menu.style.width = "260px";
    menu.style.padding = "18px";
    menu.style.borderRadius = "15px";
    menu.style.background = "#18110f";
    menu.style.border = "1px solid rgba(255,255,255,0.18)";
    menu.style.boxShadow = "0 20px 50px rgba(0,0,0,0.55)";
    menu.style.zIndex = "99999";

    const title = document.createElement("p");
    title.textContent = "CHESS_FK ACCOUNT";
    title.style.margin = "0 0 10px";
    title.style.fontSize = "10px";
    title.style.fontWeight = "bold";
    title.style.letterSpacing = "1.5px";
    title.style.opacity = "0.6";

    const menuName = document.createElement("strong");
    menuName.id = "chessfkMenuName";
    menuName.textContent = playerName;
    menuName.style.display = "block";
    menuName.style.fontSize = "20px";

    const email = document.createElement("p");
    email.textContent = user.email || "";
    email.style.margin = "5px 0";
    email.style.fontSize = "12px";
    email.style.opacity = "0.7";

    const country = document.createElement("p");
    country.id = "chessfkMenuCountry";
    country.textContent = "🌍 " + (profile?.country || "Non renseigné");
    country.style.fontSize = "13px";

    const rating = document.createElement("p");
    rating.id = "chessfkMenuRating";
    rating.textContent = "♟ Rating : " + (profile?.rating || 800);
    rating.style.color = "#ffcc66";
    rating.style.fontWeight = "bold";

    const coins = document.createElement("p");
    coins.id = "chessfkMenuCoins";
    coins.textContent = "🪙 FK Coins : " + (profile?.fk_coins || 0);
    coins.style.color = "#ffcc66";
    coins.style.fontWeight = "bold";

    const profilePageButton = document.createElement("button");
    profilePageButton.type = "button";
    profilePageButton.textContent = "MY PROFILE";
    profilePageButton.style.width = "100%";
    profilePageButton.style.padding = "11px";
    profilePageButton.style.border = "0";
    profilePageButton.style.borderRadius = "9px";
    profilePageButton.style.background = "#b51f2d";
    profilePageButton.style.color = "white";
    profilePageButton.style.fontWeight = "bold";
    profilePageButton.style.cursor = "pointer";

    profilePageButton.addEventListener("click", () => {
        window.location.href = "pages/profile.html";
    });

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = "SIGN OUT";
    logoutButton.style.width = "100%";
    logoutButton.style.marginTop = "8px";
    logoutButton.style.padding = "11px";
    logoutButton.style.border = "1px solid rgba(255,255,255,0.2)";
    logoutButton.style.borderRadius = "9px";
    logoutButton.style.background = "transparent";
    logoutButton.style.color = "white";
    logoutButton.style.cursor = "pointer";

    logoutButton.addEventListener("click", signOutChessFK);

    menu.append(
        title,
        menuName,
        email,
        country,
        rating,
        coins,
        profilePageButton,
        logoutButton
    );

    profileArea.append(profileButton, menu);

    // Cache SIGN IN et ajoute le profil à sa place
    if (loginButton && loginButton.parentNode) {
        loginButton.style.display = "none";
        loginButton.parentNode.insertBefore(profileArea, loginButton);
    }

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
        menu.style.display = "none";
    });
}


// ======================================================
// METTRE À JOUR LE PROFIL DÉJÀ AFFICHÉ
// ======================================================

function updateProfileInterface(user, profile) {
    const playerName = profile?.username || getUserDisplayName(user);

    const name = document.getElementById("chessfkProfileName");
    const menuName = document.getElementById("chessfkMenuName");
    const country = document.getElementById("chessfkMenuCountry");
    const rating = document.getElementById("chessfkMenuRating");
    const coins = document.getElementById("chessfkMenuCoins");

    if (name) name.textContent = playerName;
    if (menuName) menuName.textContent = playerName;
    if (country) country.textContent = "🌍 " + (profile?.country || "Non renseigné");
    if (rating) rating.textContent = "♟ Rating : " + (profile?.rating || 800);
    if (coins) coins.textContent = "🪙 FK Coins : " + (profile?.fk_coins || 0);
}


// ======================================================
// CONNEXION GOOGLE
// ======================================================

async function startChessFKGoogleLogin() {
    if (!chessfkAuth) {
        alert("Supabase n'est pas chargé. Vérifie js/supabase.js.");
        return;
    }

    const { error } = await chessfkAuth.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "https://fariskamel41-glitch.github.io/Chess_FK/"
        }
    });

    if (error) {
        console.error("Erreur Google :", error);
        alert("Erreur de connexion Google : " + error.message);
    }
}


// ======================================================
// UTILISATEUR CONNECTÉ
// ======================================================

async function handleChessFKUser(user) {
    if (!user) return;

    let profile = await getChessFKProfile(user);

    if (!profile) {
        profile = await createChessFKProfile(user);

        if (!profile) return;
    }

    showProfileInterface(user, profile);

    window.dispatchEvent(
        new CustomEvent("chessfk-user-connected", {
            detail: { user, profile }
        })
    );
}


// ======================================================
// DÉCONNEXION
// ======================================================

async function signOutChessFK() {
    if (!chessfkAuth) return;

    const { error } = await chessfkAuth.auth.signOut();

    if (error) {
        console.error("Erreur déconnexion :", error);
        return;
    }

    const profileArea = document.getElementById("chessfkProfileArea");

    if (profileArea) {
        profileArea.remove();
    }

    if (loginButton) {
        loginButton.style.display = "block";
    }
}


// ======================================================
// VÉRIFIER SI L'UTILISATEUR EST DÉJÀ CONNECTÉ
// ======================================================

async function checkChessFKUser() {
    if (!chessfkAuth) {
        console.error("Client Supabase introuvable.");
        return;
    }

    const { data, error } = await chessfkAuth.auth.getSession();

    if (error) {
        console.error("Erreur session :", error);
        return;
    }

    const user = data?.session?.user;

    if (user) {
        await handleChessFKUser(user);
    }
}


// ======================================================
// DÉMARRAGE
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {
    findAuthElements();

    if (loginButton) {
        loginButton.addEventListener("click", startChessFKGoogleLogin);
    } else {
        console.error("Le bouton #loginButton est introuvable dans index.html.");
    }

    await checkChessFKUser();

    if (chessfkAuth) {
        chessfkAuth.auth.onAuthStateChange((event, session) => {
            const user = session?.user;

            if (user) {
                setTimeout(() => handleChessFKUser(user), 0);
            }
        });
    }
});


// Fonctions accessibles depuis les autres fichiers
window.startChessFKGoogleLogin = startChessFKGoogleLogin;
window.signOutChessFK = signOutChessFK;
window.checkChessFKUser = checkChessFKUser;
