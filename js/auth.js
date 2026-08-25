// ======================================================
// CHESS_FK - AUTHENTIFICATION GOOGLE + PROFIL
// ======================================================

console.log("🔐 CHESS_FK AUTH STARTING...");

const chessfkAuth = window.chessfkSupabase;

let loginButton = null;
let selectedAvatarFile = null;
let selectedAvatarPreview = "";

// ======================================================
// ÉLÉMENTS
// ======================================================

function findAuthElements() {
    loginButton = document.getElementById("loginButton");
}

// ======================================================
// INFOS UTILISATEUR
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

// ======================================================
// PROFIL SUPABASE
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
// UPLOAD IMAGE PROFIL
// ======================================================

async function uploadAvatar(user, file) {
    if (!file) return "";

    if (!file.type.startsWith("image/")) {
        alert("Choisis seulement une image : JPG, PNG ou WEBP.");
        return "";
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Ton image est trop grande. Choisis une image de moins de 5 Mo.");
        return "";
    }

    const extension = file.name.split(".").pop().toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await chessfkAuth.storage
        .from("avatars")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (uploadError) {
        console.error("Erreur image :", uploadError);
        alert("Impossible d'envoyer l'image : " + uploadError.message);
        return "";
    }

    const { data } = chessfkAuth.storage
        .from("avatars")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

// ======================================================
// FENÊTRE CRÉATION PROFIL
// ======================================================

function createProfileModal(user) {
    return new Promise((resolve) => {
        const oldModal = document.getElementById("profileSetupModal");
        if (oldModal) oldModal.remove();

        selectedAvatarFile = null;
        selectedAvatarPreview = "";

        const modal = document.createElement("div");
        modal.id = "profileSetupModal";
        modal.className = "profile-setup-modal";

        modal.innerHTML = `
            <div class="profile-setup-backdrop"></div>

            <div class="profile-setup-box" role="dialog" aria-modal="true">
                <div class="profile-setup-top">
                    <span>♟ CHESS_FK</span>
                    <span class="profile-setup-status">NEW PLAYER</span>
                </div>

                <h2>CREATE YOUR <span>PROFILE.</span></h2>

                <p class="profile-setup-text">
                    Choose your identity before entering the game.
                </p>

                <div class="avatar-picker">
                    <div class="avatar-preview-wrap">
                        <img
                            id="avatarPreview"
                            class="avatar-preview"
                            alt="Profile preview"
                        >
                        <span id="avatarFallback" class="avatar-fallback">♟</span>
                    </div>

                    <label for="avatarInput" class="choose-avatar-button">
                        CHOOSE A PHOTO
                    </label>

                    <input
                        id="avatarInput"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        hidden
                    >

                    <small>JPG, PNG or WEBP · Maximum 5 MB</small>
                </div>

                <label class="profile-field-label" for="profileUsername">
                    PSEUDO
                </label>

                <input
                    id="profileUsername"
                    class="profile-field"
                    type="text"
                    minlength="3"
                    maxlength="20"
                    placeholder="Exemple : FarisKing"
                    autocomplete="nickname"
                >

                <label class="profile-field-label" for="profileCountry">
                    COUNTRY
                </label>

                <select id="profileCountry" class="profile-field">
                    <option value="">Choose your country</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Canada">Canada</option>
                    <option value="China">China</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                    <option value="Japan">Japan</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Spain">Spain</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Other">Other</option>
                </select>

                <p id="profileSetupError" class="profile-setup-error"></p>

                <button id="createProfileButton" class="create-profile-button" type="button">
                    CREATE PROFILE →
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const imageInput = document.getElementById("avatarInput");
        const preview = document.getElementById("avatarPreview");
        const fallback = document.getElementById("avatarFallback");
        const createButton = document.getElementById("createProfileButton");
        const errorText = document.getElementById("profileSetupError");
        const usernameInput = document.getElementById("profileUsername");
        const countryInput = document.getElementById("profileCountry");

        imageInput.addEventListener("change", () => {
            const file = imageInput.files?.[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                errorText.textContent = "Choose a valid image.";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                errorText.textContent = "Image too large: maximum 5 MB.";
                return;
            }

            selectedAvatarFile = file;
            selectedAvatarPreview = URL.createObjectURL(file);

            preview.src = selectedAvatarPreview;
            preview.style.display = "block";
            fallback.style.display = "none";
            errorText.textContent = "";
        });

        createButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            const country = countryInput.value;

            if (username.length < 3 || username.length > 20) {
                errorText.textContent = "Your username must contain 3 to 20 characters.";
                return;
            }

            if (!country) {
                errorText.textContent = "Choose your country.";
                return;
            }

            createButton.disabled = true;
            createButton.textContent = "CREATING PROFILE...";
            errorText.textContent = "";

            let avatarUrl = "";

            if (selectedAvatarFile) {
                avatarUrl = await uploadAvatar(user, selectedAvatarFile);

                if (!avatarUrl) {
                    createButton.disabled = false;
                    createButton.textContent = "CREATE PROFILE →";
                    return;
                }
            }

            const { data, error } = await chessfkAuth
                .from("profiles")
                .insert({
                    id: user.id,
                    username,
                    country,
                    avatar_url: avatarUrl,
                    rating: 800,
                    fk_coins: 0
                })
                .select()
                .single();

            if (error) {
                console.error("Erreur création profil :", error);

                if (error.code === "23505") {
                    errorText.textContent = "This username already exists. Choose another.";
                } else {
                    errorText.textContent = "Error: " + error.message;
                }

                createButton.disabled = false;
                createButton.textContent = "CREATE PROFILE →";
                return;
            }

            modal.remove();
            resolve(data);
        });
    });
}

// ======================================================
// AFFICHER PROFIL DANS LE HEADER
// ======================================================

function showProfileInterface(user, profile) {
    if (!user) return;

    const existingProfile = document.getElementById("chessfkProfileArea");

    if (existingProfile) {
        updateProfileInterface(user, profile);
        return;
    }

    const playerName = profile?.username || getUserDisplayName(user);
    const avatarUrl = profile?.avatar_url || "";

    const profileArea = document.createElement("div");
    profileArea.id = "chessfkProfileArea";
    profileArea.className = "chessfk-profile-area";

    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.id = "chessfkProfileButton";
    profileButton.className = "chessfk-profile-button";

    const avatar = document.createElement("img");
    avatar.id = "chessfkProfileAvatar";
    avatar.className = "chessfk-profile-avatar";
    avatar.alt = "Profile";

    if (avatarUrl) {
        avatar.src = avatarUrl;
    } else {
        avatar.style.display = "none";
    }

    const fallback = document.createElement("span");
    fallback.id = "chessfkProfileFallback";
    fallback.className = "chessfk-profile-fallback";
    fallback.textContent = "♟";

    if (avatarUrl) {
        fallback.style.display = "none";
    }

    const name = document.createElement("span");
    name.id = "chessfkProfileName";
    name.textContent = playerName;

    const arrow = document.createElement("span");
    arrow.className = "chessfk-profile-arrow";
    arrow.textContent = "▼";

    profileButton.append(avatar, fallback, name, arrow);

    const menu = document.createElement("div");
    menu.id = "chessfkProfileMenu";
    menu.className = "chessfk-profile-menu";

    menu.innerHTML = `
        <p class="profile-menu-label">CHESS_FK ACCOUNT</p>
        <strong id="chessfkMenuName">${playerName}</strong>
        <p class="profile-menu-email">${user.email || ""}</p>
        <p id="chessfkMenuCountry">🌍 ${profile?.country || "Not set"}</p>
        <p id="chessfkMenuRating" class="profile-menu-gold">♟ Rating: ${profile?.rating || 800}</p>
        <p id="chessfkMenuCoins" class="profile-menu-gold">🪙 FK Coins: ${profile?.fk_coins || 0}</p>
        <button id="openMyProfile" class="profile-menu-main-button" type="button">
            MY PROFILE
        </button>
        <button id="signOutButton" class="profile-menu-signout" type="button">
            SIGN OUT
        </button>
    `;

    profileArea.append(profileButton, menu);

    if (loginButton && loginButton.parentNode) {
        loginButton.style.display = "none";
        loginButton.parentNode.insertBefore(profileArea, loginButton);
    }

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.classList.toggle("open");
    });

    document.getElementById("openMyProfile").addEventListener("click", () => {
        window.location.href = "pages/profile.html";
    });

    document.getElementById("signOutButton").addEventListener("click", signOutChessFK);

    document.addEventListener("click", () => {
        menu.classList.remove("open");
    });
}

function updateProfileInterface(user, profile) {
    const playerName = profile?.username || getUserDisplayName(user);
    const avatarUrl = profile?.avatar_url || "";

    const name = document.getElementById("chessfkProfileName");
    const menuName = document.getElementById("chessfkMenuName");
    const country = document.getElementById("chessfkMenuCountry");
    const rating = document.getElementById("chessfkMenuRating");
    const coins = document.getElementById("chessfkMenuCoins");
    const avatar = document.getElementById("chessfkProfileAvatar");
    const fallback = document.getElementById("chessfkProfileFallback");

    if (name) name.textContent = playerName;
    if (menuName) menuName.textContent = playerName;
    if (country) country.textContent = "🌍 " + (profile?.country || "Not set");
    if (rating) rating.textContent = "♟ Rating: " + (profile?.rating || 800);
    if (coins) coins.textContent = "🪙 FK Coins: " + (profile?.fk_coins || 0);

    if (avatar && avatarUrl) {
        avatar.src = avatarUrl;
        avatar.style.display = "block";
    }

    if (fallback) {
        fallback.style.display = avatarUrl ? "none" : "flex";
    }
}

// ======================================================
// CONNEXION
// ======================================================

async function startChessFKGoogleLogin() {
    if (!chessfkAuth) {
        alert("Supabase is not loaded. Check js/supabase.js.");
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
        alert("Google login error: " + error.message);
    }
}

// ======================================================
// UTILISATEUR CONNECTÉ
// ======================================================

async function handleChessFKUser(user) {
    if (!user) return;

    let profile = await getChessFKProfile(user);

    if (!profile) {
        profile = await createProfileModal(user);

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

    document.getElementById("chessfkProfileArea")?.remove();

    if (loginButton) {
        loginButton.style.display = "block";
    }

    window.location.href = "../index.html";
}

// ======================================================
// SESSION
// ======================================================

async function checkChessFKUser() {
    if (!chessfkAuth) return;

    const { data, error } = await chessfkAuth.auth.getSession();

    if (error) {
        console.error("Erreur session :", error);
        return;
    }

    if (data?.session?.user) {
        await handleChessFKUser(data.session.user);
    }
}

// ======================================================
// DÉMARRAGE
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {
    findAuthElements();

    if (loginButton) {
        loginButton.addEventListener("click", startChessFKGoogleLogin);
    }

    await checkChessFKUser();

    if (chessfkAuth) {
        chessfkAuth.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                setTimeout(() => handleChessFKUser(session.user), 0);
            }
        });
    }
});

window.startChessFKGoogleLogin = startChessFKGoogleLogin;
window.signOutChessFK = signOutChessFK;
window.checkChessFKUser = checkChessFKUser;
