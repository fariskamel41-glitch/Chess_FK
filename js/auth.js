// ======================================================
// CHESS_FK
// AUTHENTICATION + PROFILE SYSTEM
// GOOGLE + SUPABASE
// ======================================================

console.log("🔐 CHESS_FK AUTH SYSTEM STARTING...");


// ======================================================
// SUPABASE CLIENT
// ======================================================

const chessfkAuth = window.chessfkSupabase;

if (!chessfkAuth) {

    console.error("❌ CHESS_FK : Supabase client introuvable.");

} else {

    console.log("✅ CHESS_FK : Supabase client trouvé.");

}


// ======================================================
// ELEMENTS
// ======================================================

let loginButton = null;


// ======================================================
// FIND LOGIN BUTTON
// ======================================================

function findAuthElements() {

    loginButton =
        document.getElementById("loginButton");

}


// ======================================================
// USER NAME
// ======================================================

function getUserDisplayName(user) {

    if (!user) {
        return "PLAYER";
    }

    const metadata =
        user.user_metadata || {};

    return (
        metadata.chess_username ||
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "PLAYER"
    );

}


// ======================================================
// AVATAR
// ======================================================

function getUserAvatar(user) {

    if (!user) {
        return "";
    }

    const metadata =
        user.user_metadata || {};

    return (
        metadata.avatar_url ||
        metadata.picture ||
        ""
    );

}


// ======================================================
// CHECK PROFILE IN DATABASE
// ======================================================

async function getChessFKProfile(user) {

    if (!user || !chessfkAuth) {
        return null;
    }

    try {

        const {
            data,
            error
        } =
            await chessfkAuth
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();


        if (error) {

            console.error(
                "❌ Erreur récupération profil:",
                error
            );

            return null;
        }


        return data || null;

    }

    catch (error) {

        console.error(
            "🔥 Profile error:",
            error
        );

        return null;
    }

}


// ======================================================
// CREATE PROFILE
// ======================================================

async function createChessFKProfile(user) {

    if (!user || !chessfkAuth) {
        return null;
    }


    const username =
        prompt(
            "♟️ CHESS_FK\n\nChoisis ton Username :"
        );


    if (!username || !username.trim()) {

        alert(
            "Tu dois choisir un Username."
        );

        return null;
    }


    const country =
        prompt(
            "🌍 CHESS_FK\n\nÉcris ton pays :"
        );


    if (!country || !country.trim()) {

        alert(
            "Tu dois choisir ton pays."
        );

        return null;
    }


    const cleanUsername =
        username.trim();


    const cleanCountry =
        country.trim();


    console.log(
        "💾 Création du profil..."
    );


    const {
        data,
        error
    } =
        await chessfkAuth
            .from("profiles")
            .insert({

                id:
                    user.id,

                username:
                    cleanUsername,

                country:
                    cleanCountry,

                avatar_url:
                    getUserAvatar(user)

            })
            .select()
            .single();


    if (error) {

        console.error(
            "❌ Impossible de créer le profil:",
            error
        );


        if (
            error.code === "23505"
        ) {

            alert(
                "❌ Ce Username est déjà utilisé.\n\nChoisis-en un autre."
            );

        } else {

            alert(
                "❌ Erreur lors de la création du profil :\n\n" +
                error.message
            );

        }


        return null;
    }


    console.log(
        "✅ Profil CHESS_FK créé:",
        data
    );


    return data;

}


// ======================================================
// PROFILE INTERFACE
// ======================================================

function createProfileInterface(
    user,
    profile
) {

    if (!user) {
        return;
    }


    const existing =
        document.getElementById(
            "chessfkProfileArea"
        );


    if (existing) {

        updateProfileInterface(
            user,
            profile
        );

        return;

    }


    const name =
        profile?.username ||
        getUserDisplayName(user);


    const avatar =
        profile?.avatar_url ||
        getUserAvatar(user);


    const profileArea =
        document.createElement("div");


    profileArea.id =
        "chessfkProfileArea";


    profileArea.style.position =
        "relative";

    profileArea.style.display =
        "flex";

    profileArea.style.alignItems =
        "center";


    // ==================================================
    // PROFILE BUTTON
    // ==================================================

    const profileButton =
        document.createElement("button");


    profileButton.id =
        "chessfkProfileButton";


    profileButton.type =
        "button";


    profileButton.style.display =
        "flex";

    profileButton.style.alignItems =
        "center";

    profileButton.style.gap =
        "10px";

    profileButton.style.padding =
        "8px 14px";

    profileButton.style.border =
        "1px solid rgba(255,255,255,0.15)";

    profileButton.style.borderRadius =
        "30px";

    profileButton.style.background =
        "rgba(0,0,0,0.35)";

    profileButton.style.color =
        "white";

    profileButton.style.cursor =
        "pointer";


    // ==================================================
    // AVATAR
    // ==================================================

    const avatarElement =
        document.createElement("img");


    avatarElement.id =
        "chessfkProfileAvatar";


    avatarElement.width =
        34;

    avatarElement.height =
        34;


    avatarElement.style.width =
        "34px";

    avatarElement.style.height =
        "34px";

    avatarElement.style.borderRadius =
        "50%";

    avatarElement.style.objectFit =
        "cover";


    if (avatar) {

        avatarElement.src =
            avatar;

    } else {

        avatarElement.style.display =
            "none";

    }


    // ==================================================
    // NAME
    // ==================================================

    const nameElement =
        document.createElement("span");


    nameElement.id =
        "chessfkProfileName";


    nameElement.textContent =
        name;


    // ==================================================
    // ARROW
    // ==================================================

    const arrow =
        document.createElement("span");


    arrow.textContent =
        "▼";


    arrow.style.fontSize =
        "9px";


    profileButton.appendChild(
        avatarElement
    );

    profileButton.appendChild(
        nameElement
    );

    profileButton.appendChild(
        arrow
    );


    // ==================================================
    // MENU
    // ==================================================

    const menu =
        document.createElement("div");


    menu.id =
        "chessfkProfileMenu";


    menu.style.display =
        "none";

    menu.style.position =
        "absolute";

    menu.style.top =
        "55px";

    menu.style.right =
        "0";

    menu.style.width =
        "280px";

    menu.style.padding =
        "20px";

    menu.style.background =
        "#17110e";

    menu.style.border =
        "1px solid rgba(255,255,255,0.15)";

    menu.style.borderRadius =
        "16px";

    menu.style.boxShadow =
        "0 20px 50px rgba(0,0,0,0.5)";

    menu.style.zIndex =
        "99999";


    // ==================================================
    // TITLE
    // ==================================================

    const menuTitle =
        document.createElement("div");


    menuTitle.textContent =
        "CHESS_FK ACCOUNT";


    menuTitle.style.fontSize =
        "11px";

    menuTitle.style.letterSpacing =
        "2px";

    menuTitle.style.opacity =
        "0.6";

    menuTitle.style.marginBottom =
        "10px";


    // ==================================================
    // USERNAME
    // ==================================================

    const menuName =
        document.createElement("div");


    menuName.id =
        "chessfkMenuName";


    menuName.textContent =
        name;


    menuName.style.fontSize =
        "22px";

    menuName.style.fontWeight =
        "bold";


    // ==================================================
    // EMAIL
    // ==================================================

    const menuEmail =
        document.createElement("div");


    menuEmail.textContent =
        user.email || "";


    menuEmail.style.fontSize =
        "13px";

    menuEmail.style.opacity =
        "0.6";

    menuEmail.style.marginTop =
        "4px";


    // ==================================================
    // COUNTRY
    // ==================================================

    const menuCountry =
        document.createElement("div");


    menuCountry.id =
        "chessfkMenuCountry";


    menuCountry.textContent =
        "🌍 " +
        (profile?.country || "Unknown");


    menuCountry.style.fontSize =
        "13px";

    menuCountry.style.marginTop =
        "8px";


    // ==================================================
    // PROFILE BUTTON
    // ==================================================

    const profilePageButton =
        document.createElement("button");


    profilePageButton.type =
        "button";


    profilePageButton.textContent =
        "MY PROFILE";


    profilePageButton.style.width =
        "100%";

    profilePageButton.style.marginTop =
        "18px";

    profilePageButton.style.padding =
        "12px";

    profilePageButton.style.border =
        "none";

    profilePageButton.style.borderRadius =
        "10px";

    profilePageButton.style.background =
        "#b51f2d";

    profilePageButton.style.color =
        "white";

    profilePageButton.style.fontWeight =
        "bold";

    profilePageButton.style.cursor =
        "pointer";


    profilePageButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "pages/profile.html";

        }
    );


    // ==================================================
    // LOGOUT
    // ==================================================

    const logoutButton =
        document.createElement("button");


    logoutButton.type =
        "button";


    logoutButton.textContent =
        "SIGN OUT";


    logoutButton.style.width =
        "100%";

    logoutButton.style.marginTop =
        "8px";

    logoutButton.style.padding =
        "12px";

    logoutButton.style.border =
        "1px solid rgba(255,255,255,0.15)";

    logoutButton.style.borderRadius =
        "10px";

    logoutButton.style.background =
        "transparent";

    logoutButton.style.color =
        "white";

    logoutButton.style.cursor =
        "pointer";


    logoutButton.addEventListener(
        "click",
        signOutChessFK
    );


    // ==================================================
    // BUILD MENU
    // ==================================================

    menu.appendChild(
        menuTitle
    );

    menu.appendChild(
        menuName
    );

    menu.appendChild(
        menuEmail
    );

    menu.appendChild(
        menuCountry
    );

    menu.appendChild(
        profilePageButton
    );

    menu.appendChild(
        logoutButton
    );


    profileArea.appendChild(
        profileButton
    );

    profileArea.appendChild(
        menu
    );


    // ==================================================
    // REPLACE LOGIN BUTTON
    // ==================================================

    if (loginButton) {

        loginButton.style.display =
            "none";


        loginButton.parentNode.insertBefore(
            profileArea,
            loginButton
        );

    }


    // ==================================================
    // OPEN MENU
    // ==================================================

    profileButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            menu.style.display =
                menu.style.display === "block"
                    ? "none"
                    : "block";

        }
    );


    document.addEventListener(
        "click",
        function () {

            menu.style.display =
                "none";

        }
    );


    console.log(
        "👤 Profile interface created"
    );

}


// ======================================================
// UPDATE PROFILE
// ======================================================

function updateProfileInterface(
    user,
    profile
) {

    const name =
        profile?.username ||
        getUserDisplayName(user);


    const nameElement =
        document.getElementById(
            "chessfkProfileName"
        );


    const menuName =
        document.getElementById(
            "chessfkMenuName"
        );


    const menuCountry =
        document.getElementById(
            "chessfkMenuCountry"
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (menuName) {

        menuName.textContent =
            name;

    }


    if (menuCountry) {

        menuCountry.textContent =
            "🌍 " +
            (profile?.country || "Unknown");

    }

}


// ======================================================
// REMOVE PROFILE
// ======================================================

function removeProfileInterface() {

    const profileArea =
        document.getElementById(
            "chessfkProfileArea"
        );


    if (profileArea) {

        profileArea.remove();

    }


    if (loginButton) {

        loginButton.style.display =
            "block";

        loginButton.textContent =
            "SIGN IN";

    }

}


// ======================================================
// GOOGLE LOGIN
// ======================================================

async function startChessFKGoogleLogin() {

    console.log(
        "🔐 Starting Google authentication..."
    );


    if (!chessfkAuth) {

        alert(
            "Supabase n'est pas chargé."
        );

        return;

    }


    try {

        const redirectURL =
            window.location.origin +
            window.location.pathname;


        console.log(
            "↩️ Redirect:",
            redirectURL
        );


        const {
            error
        } =
            await chessfkAuth.auth.signInWithOAuth({

                provider:
                    "google",

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
                "Erreur Google :\n\n" +
                error.message
            );

        }

    }

    catch (error) {

        console.error(
            "🔥 Google login exception:",
            error
        );

    }

}


// ======================================================
// AFTER GOOGLE LOGIN
// ======================================================

async function handleChessFKUser(user) {

    if (!user) {

        removeProfileInterface();

        return;

    }


    console.log(
        "👤 Google user connected:",
        user.email
    );


    let profile =
        await getChessFKProfile(user);


    // --------------------------------------------------
    // FIRST LOGIN
    // --------------------------------------------------

    if (!profile) {

        console.log(
            "🆕 First CHESS_FK login"
        );


        profile =
            await createChessFKProfile(user);


        // User cancelled or error

        if (!profile) {

            return;

        }

    }


    // --------------------------------------------------
    // SHOW PROFILE
    // --------------------------------------------------

    createProfileInterface(
        user,
        profile
    );


    window.dispatchEvent(
        new CustomEvent(
            "chessfk-user-connected",
            {
                detail: {

                    user:
                        user,

                    profile:
                        profile

                }

            }
        )
    );

}


// ======================================================
// SIGN OUT
// ======================================================

async function signOutChessFK() {

    if (!chessfkAuth) {
        return;
    }


    try {

        const {
            error
        } =
            await chessfkAuth.auth.signOut();


        if (error) {

            console.error(
                "❌ Logout error:",
                error
            );

            return;

        }


        console.log(
            "🚪 CHESS_FK user signed out"
        );


        removeProfileInterface();


        window.dispatchEvent(
            new CustomEvent(
                "chessfk-user-disconnected"
            )
        );


    }

    catch (error) {

        console.error(
            "🔥 Logout exception:",
            error
        );

    }

}


// ======================================================
// CHECK SESSION
// ======================================================

async function checkChessFKUser() {

    console.log(
        "🔎 Checking ChessFK session..."
    );


    if (!chessfkAuth) {

        console.error(
            "❌ Supabase client absent."
        );

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await chessfkAuth.auth.getSession();


        if (error) {

            console.error(
                "❌ Session error:",
                error
            );

            return null;

        }


        const user =
            data?.session?.user || null;


        if (user) {

            console.log(
                "👤 ChessFK user:",
                user.email
            );


            await handleChessFKUser(
                user
            );


            return user;

        }


        console.log(
            "👤 No user connected"
        );


        return null;

    }

    catch (error) {

        console.error(
            "🔥 Session exception:",
            error
        );

        return null;

    }

}


// ======================================================
// AUTH STATE
// ======================================================

if (chessfkAuth) {

    chessfkAuth.auth.onAuthStateChange(
        async function (
            event,
            session
        ) {

            console.log(
                "🔄 AUTH EVENT:",
                event
            );


            const user =
                session?.user || null;


            if (user) {

                await handleChessFKUser(
                    user
                );

            } else {

                removeProfileInterface();

                window.dispatchEvent(
                    new CustomEvent(
                        "chessfk-user-disconnected"
                    )
                );

            }

        }
    );

}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        findAuthElements();


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                startChessFKGoogleLogin
            );

        } else {

            console.warn(
                "⚠️ #loginButton introuvable."
            );

        }


        await checkChessFKUser();

    }
);


// ======================================================
// GLOBAL
// ======================================================

window.startChessFKGoogleLogin =
    startChessFKGoogleLogin;

window.signOutChessFK =
    signOutChessFK;

window.checkChessFKUser =
    checkChessFKUser;


console.log(
    "🚀 CHESS_FK AUTH SYSTEM READY"
);