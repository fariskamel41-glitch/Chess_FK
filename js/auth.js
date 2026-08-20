// ==========================================
// CHESS_FK
// AUTHENTICATION + GOOGLE PROFILE SYSTEM
// SUPABASE
// ==========================================

console.log("🔐 CHESS_FK AUTH SYSTEM STARTING...");


// ==========================================
// SUPABASE
// ==========================================

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


// Vérification Supabase
if (!window.supabase) {

    console.error(
        "❌ Supabase JS n'est pas chargé."
    );

}
else {

    console.log(
        "✅ Supabase JS détecté"
    );

}


const supabaseClient =
    window.supabase.createClient(
        CHESSFK_SUPABASE_URL,
        CHESSFK_SUPABASE_KEY
    );


console.log(
    "✅ CHESS_FK connecté à Supabase"
);


// ==========================================
// ELEMENTS
// ==========================================

// On accepte l'ID OU la classe
// Cela évite de casser ton ancien HTML.

const loginButton =
    document.getElementById("loginButton") ||
    document.querySelector(".login-btn");


// ==========================================
// CREATE PROFILE UI
// ==========================================

function createProfileUI() {

    // Si déjà créé → ne rien faire
    if (
        document.getElementById("chessfk-profile")
    ) {

        return;

    }


    // ======================================
    // PROFILE BUTTON
    // ======================================

    const profileButton =
        document.createElement("button");

    profileButton.id =
        "chessfk-profile";

    profileButton.type =
        "button";


    profileButton.style.display =
        "none";

    profileButton.style.alignItems =
        "center";

    profileButton.style.gap =
        "10px";

    profileButton.style.background =
        "transparent";

    profileButton.style.border =
        "1px solid rgba(255,255,255,0.15)";

    profileButton.style.borderRadius =
        "999px";

    profileButton.style.padding =
        "5px 12px 5px 5px";

    profileButton.style.cursor =
        "pointer";

    profileButton.style.color =
        "inherit";


    // ======================================
    // AVATAR
    // ======================================

    const avatar =
        document.createElement("img");

    avatar.id =
        "profileAvatar";

    avatar.alt =
        "Profile";

    avatar.style.width =
        "36px";

    avatar.style.height =
        "36px";

    avatar.style.borderRadius =
        "50%";

    avatar.style.objectFit =
        "cover";

    avatar.style.border =
        "2px solid rgba(255,255,255,0.3)";


    // ======================================
    // NAME
    // ======================================

    const name =
        document.createElement("span");

    name.id =
        "profileName";

    name.textContent =
        "PLAYER";

    name.style.fontWeight =
        "700";

    name.style.fontSize =
        "14px";


    profileButton.appendChild(
        avatar
    );

    profileButton.appendChild(
        name
    );


    // ======================================
    // PROFILE MENU
    // ======================================

    const menu =
        document.createElement("div");

    menu.id =
        "profileMenu";


    menu.style.display =
        "none";

    menu.style.position =
        "absolute";

    menu.style.top =
        "70px";

    menu.style.right =
        "25px";

    menu.style.width =
        "280px";

    menu.style.padding =
        "20px";

    menu.style.background =
        "#171717";

    menu.style.border =
        "1px solid rgba(255,255,255,0.12)";

    menu.style.borderRadius =
        "18px";

    menu.style.boxShadow =
        "0 20px 60px rgba(0,0,0,0.5)";

    menu.style.zIndex =
        "9999";


    // ======================================
    // MENU HEADER
    // ======================================

    const menuHeader =
        document.createElement("div");

    menuHeader.style.display =
        "flex";

    menuHeader.style.alignItems =
        "center";

    menuHeader.style.gap =
        "12px";

    menuHeader.style.marginBottom =
        "18px";


    const menuAvatar =
        document.createElement("img");

    menuAvatar.id =
        "menuAvatar";

    menuAvatar.style.width =
        "55px";

    menuAvatar.style.height =
        "55px";

    menuAvatar.style.borderRadius =
        "50%";

    menuAvatar.style.objectFit =
        "cover";


    const menuInfo =
        document.createElement("div");


    const menuName =
        document.createElement("strong");

    menuName.id =
        "menuName";

    menuName.style.display =
        "block";

    menuName.style.fontSize =
        "17px";


    const menuEmail =
        document.createElement("small");

    menuEmail.id =
        "menuEmail";

    menuEmail.style.display =
        "block";

    menuEmail.style.opacity =
        "0.6";

    menuEmail.style.marginTop =
        "4px";


    menuInfo.appendChild(
        menuName
    );

    menuInfo.appendChild(
        menuEmail
    );


    menuHeader.appendChild(
        menuAvatar
    );

    menuHeader.appendChild(
        menuInfo
    );


    // ======================================
    // MY PROFILE
    // ======================================

    const myProfileButton =
        document.createElement("button");

    myProfileButton.id =
        "myProfileButton";

    myProfileButton.textContent =
        "👤 MY PROFILE";

    styleMenuButton(
        myProfileButton
    );


    myProfileButton.addEventListener(
        "click",
        function(){

            console.log(
                "👤 Opening profile..."
            );

            // Notre prochaine étape
            window.location.href =
                "pages/profile.html";

        }
    );


    // ======================================
    // LOGOUT
    // ======================================

    const logoutButton =
        document.createElement("button");

    logoutButton.id =
        "logoutButton";

    logoutButton.textContent =
        "🚪 SIGN OUT";

    styleMenuButton(
        logoutButton
    );


    logoutButton.style.color =
        "#ff6b6b";


    logoutButton.addEventListener(
        "click",
        signOut
    );


    // ======================================
    // ADD TO MENU
    // ======================================

    menu.appendChild(
        menuHeader
    );

    menu.appendChild(
        myProfileButton
    );

    menu.appendChild(
        logoutButton
    );


    // ======================================
    // ADD TO PAGE
    // ======================================

    if(loginButton){

        loginButton.parentElement.appendChild(
            profileButton
        );

    }
    else{

        document.body.appendChild(
            profileButton
        );

    }


    document.body.appendChild(
        menu
    );


    // ======================================
    // PROFILE BUTTON CLICK
    // ======================================

    profileButton.addEventListener(
        "click",
        function(event){

            event.stopPropagation();


            if(
                menu.style.display ===
                "block"
            ){

                menu.style.display =
                    "none";

            }
            else{

                menu.style.display =
                    "block";

            }

        }
    );


    // ======================================
    // CLICK OUTSIDE
    // ======================================

    document.addEventListener(
        "click",
        function(){

            menu.style.display =
                "none";

        }
    );


    console.log(
        "👤 Profile interface created"
    );
}


// ==========================================
// STYLE MENU BUTTON
// ==========================================

function styleMenuButton(button){

    button.style.width =
        "100%";

    button.style.padding =
        "12px";

    button.style.marginTop =
        "8px";

    button.style.background =
        "rgba(255,255,255,0.05)";

    button.style.border =
        "none";

    button.style.borderRadius =
        "10px";

    button.style.color =
        "white";

    button.style.cursor =
        "pointer";

    button.style.textAlign =
        "left";

    button.style.fontSize =
        "14px";

}


// ==========================================
// GOOGLE LOGIN
// ==========================================

async function signInWithGoogle(){

    console.log(
        "🔐 GOOGLE LOGIN STARTING..."
    );


    try{

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithOAuth({

                provider:
                    "google",

                options: {

                    redirectTo:
                        window.location.origin +
                        window.location.pathname

                }

            });


        if(error){

            console.error(
                "❌ Google login error:",
                error
            );


            alert(
                "Impossible de se connecter avec Google."
            );


            return;

        }


        console.log(
            "🚀 Redirection vers Google..."
        );

    }

    catch(error){

        console.error(
            "🔥 Google authentication error:",
            error
        );

    }

}


// ==========================================
// SIGN OUT
// ==========================================

async function signOut(){

    console.log(
        "🚪 Signing out..."
    );


    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if(error){

        console.error(
            "❌ Logout error:",
            error
        );

        return;

    }


    console.log(
        "✅ User signed out"
    );


    updateAuthUI(
        null
    );

}


// ==========================================
// UPDATE AUTH UI
// ==========================================

function updateAuthUI(user){

    const profileButton =
        document.getElementById(
            "chessfk-profile"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );


    const profileMenu =
        document.getElementById(
            "profileMenu"
        );


    const menuAvatar =
        document.getElementById(
            "menuAvatar"
        );


    const menuName =
        document.getElementById(
            "menuName"
        );


    const menuEmail =
        document.getElementById(
            "menuEmail"
        );


    // ======================================
    // NOT CONNECTED
    // ======================================

    if(!user){

        if(loginButton){

            loginButton.style.display =
                "block";

        }


        if(profileButton){

            profileButton.style.display =
                "none";

        }


        if(profileMenu){

            profileMenu.style.display =
                "none";

        }


        return;

    }


    // ======================================
    // CONNECTED
    // ======================================

    if(loginButton){

        loginButton.style.display =
            "none";

    }


    if(profileButton){

        profileButton.style.display =
            "flex";

    }


    // ======================================
    // GOOGLE DATA
    // ======================================

    const metadata =
        user.user_metadata || {};


    const fullName =
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "PLAYER";


    const avatar =
        metadata.avatar_url ||
        metadata.picture ||
        "";


    // ======================================
    // NAME
    // ======================================

    if(profileName){

        profileName.textContent =
            fullName;

    }


    if(menuName){

        menuName.textContent =
            fullName;

    }


    // ======================================
    // EMAIL
    // ======================================

    if(menuEmail){

        menuEmail.textContent =
            user.email || "";

    }


    // ======================================
    // AVATAR
    // ======================================

    if(avatar){

        if(profileAvatar){

            profileAvatar.src =
                avatar;

        }


        if(menuAvatar){

            menuAvatar.src =
                avatar;

        }

    }


    console.log(
        "👤 CHESS_FK USER:",
        fullName
    );

    console.log(
        "📧 EMAIL:",
        user.email
    );

    console.log(
        "🆔 USER ID:",
        user.id
    );

}


// ==========================================
// AUTH STATE CHANGE
// ==========================================

supabaseClient.auth.onAuthStateChange(
    function(
        event,
        session
    ){

        console.log(
            "🔄 AUTH EVENT:",
            event
        );


        const user =
            session?.user || null;


        updateAuthUI(
            user
        );

    }
);


// ==========================================
// INITIAL SESSION
// ==========================================

async function loadInitialSession(){

    console.log(
        "🔎 Checking ChessFK session..."
    );


    try{

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if(error){

            console.error(
                "❌ Session error:",
                error
            );

            return;

        }


        const user =
            data.session?.user || null;


        updateAuthUI(
            user
        );


        if(user){

            console.log(
                "✅ Existing ChessFK account detected"
            );

        }
        else{

            console.log(
                "👤 No user connected"
            );

        }

    }

    catch(error){

        console.error(
            "🔥 Session exception:",
            error
        );

    }

}


// ==========================================
// START
// ==========================================

createProfileUI();


// Login button
if(loginButton){

    loginButton.addEventListener(
        "click",
        signInWithGoogle
    );

}
else{

    console.error(
        "❌ SIGN IN button not found"
    );

}


loadInitialSession();


console.log(
    "🚀 CHESS_FK AUTH SYSTEM READY"
);