// ======================================================
// CHESS_FK
// AUTHENTICATION + PROFILE SYSTEM
// GOOGLE + SUPABASE
// ======================================================

console.log("🔐 CHESS_FK AUTH SYSTEM STARTING...");


// ======================================================
// WAIT FOR SUPABASE
// ======================================================

if (!window.chessfkSupabase) {

    console.error(
        "❌ CHESS_FK : Supabase client introuvable."
    );

} else {

    console.log(
        "✅ CHESS_FK : Supabase client trouvé."
    );

}


// ======================================================
// SUPABASE CLIENT
// ======================================================

const chessfkAuth =
    window.chessfkSupabase;


// ======================================================
// ELEMENTS
// ======================================================

let loginButton = null;


// ======================================================
// FIND ELEMENTS
// ======================================================

function findAuthElements() {

    loginButton =
        document.getElementById("loginButton");

}


// ======================================================
// GET USER NAME
// ======================================================

function getUserDisplayName(user) {

    if (!user) {
        return "PLAYER";
    }


    const metadata =
        user.user_metadata || {};


    return (
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "PLAYER"
    );

}


// ======================================================
// GET AVATAR
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
// CREATE PROFILE UI
// ======================================================

function createProfileInterface(user) {

    if (!user) {
        return;
    }


    // Do not create it twice

    if (
        document.getElementById(
            "chessfkProfileArea"
        )
    ) {

        updateProfileInterface(user);

        return;

    }


    const name =
        getUserDisplayName(user);

    const avatar =
        getUserAvatar(user);


    // ==================================================
    // PROFILE AREA
    // ==================================================

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
    // PROFILE MENU
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
    // MENU PROFILE
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
    // MY PROFILE BUTTON
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
    // OPEN / CLOSE
    // ==================================================

    profileButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                menu.style.display ===
                "block"
            ) {

                menu.style.display =
                    "none";

            } else {

                menu.style.display =
                    "block";

            }

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

function updateProfileInterface(user) {

    if (!user) {
        return;
    }


    const name =
        getUserDisplayName(user);

    const avatar =
        getUserAvatar(user);


    const nameElement =
        document.getElementById(
            "chessfkProfileName"
        );


    const menuName =
        document.getElementById(
            "chessfkMenuName"
        );


    const avatarElement =
        document.getElementById(
            "chessfkProfileAvatar"
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (menuName) {

        menuName.textContent =
            name;

    }


    if (
        avatarElement &&
        avatar
    ) {

        avatarElement.src =
            avatar;

        avatarElement.style.display =
            "block";

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
// SIGN OUT
// ======================================================

async function signOutChessFK() {

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


        const session =
            data?.session;


        const user =
            session?.user || null;


        if (user) {

            console.log(
                "👤 ChessFK user:",
                user.email
            );


            createProfileInterface(
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

chessfkAuth.auth.onAuthStateChange(
    function (
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

            console.log(
                "👤 CHESS_FK LOGIN:",
                user.email
            );


            createProfileInterface(
                user
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

            removeProfileInterface();


            window.dispatchEvent(
                new CustomEvent(
                    "chessfk-user-disconnected"
                )
            );

        }

    }
);


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