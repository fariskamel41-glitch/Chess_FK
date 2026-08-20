```javascript
// ==========================================
// CHESSFK
// AUTHENTICATION SYSTEM
// SUPABASE + GOOGLE
// ==========================================

console.log("🔐 CHESSFK AUTH SYSTEM STARTING...");


// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


const supabaseClient =
    window.supabase.createClient(
        CHESSFK_SUPABASE_URL,
        CHESSFK_SUPABASE_KEY
    );


console.log("✅ Supabase connected");


// ==========================================
// ELEMENTS
// ==========================================

const loginButton =
    document.getElementById("loginButton");

const profileButton =
    document.getElementById("profileButton");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileMenu =
    document.getElementById("profileMenu");

const menuAvatar =
    document.getElementById("menuAvatar");

const menuName =
    document.getElementById("menuName");

const menuEmail =
    document.getElementById("menuEmail");

const logoutButton =
    document.getElementById("logoutButton");

const myProfileButton =
    document.getElementById("myProfileButton");


// ==========================================
// GOOGLE LOGIN
// ==========================================

async function signInWithGoogle(){

    console.log(
        "🔐 Starting Google authentication..."
    );


    try{

        const { data, error } =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

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

        }

    }

    catch(error){

        console.error(
            "🔥 Authentication error:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

async function signOut(){

    try{

        const { error } =
            await supabaseClient.auth.signOut();


        if(error){

            console.error(
                "❌ Logout error:",
                error
            );

            return;

        }


        console.log(
            "🚪 User signed out"
        );


        closeProfileMenu();


        updateAuthUI(null);

    }

    catch(error){

        console.error(
            "🔥 Logout exception:",
            error
        );

    }

}


// ==========================================
// UPDATE UI
// ==========================================

function updateAuthUI(user){

    if(!loginButton){

        return;

    }


    // ======================================
    // NOT CONNECTED
    // ======================================

    if(!user){

        loginButton.style.display =
            "block";


        if(profileButton){

            profileButton.style.display =
                "none";

        }


        closeProfileMenu();

        return;

    }


    // ======================================
    // CONNECTED
    // ======================================

    loginButton.style.display =
        "none";


    if(profileButton){

        profileButton.style.display =
            "flex";

    }


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


    if(profileName){

        profileName.textContent =
            fullName;

    }


    if(menuName){

        menuName.textContent =
            fullName;

    }


    if(menuEmail){

        menuEmail.textContent =
            user.email || "";

    }


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
        "👤 Logged in:",
        fullName
    );

}


// ==========================================
// PROFILE MENU
// ==========================================

function openProfileMenu(){

    if(!profileMenu){

        return;

    }


    profileMenu.style.display =
        "block";

}


function closeProfileMenu(){

    if(!profileMenu){

        return;

    }


    profileMenu.style.display =
        "none";

}


// ==========================================
// PROFILE BUTTON
// ==========================================

if(profileButton){

    profileButton.addEventListener(
        "click",
        function(event){

            event.stopPropagation();


            if(
                profileMenu.style.display ===
                "block"
            ){

                closeProfileMenu();

            }
            else{

                openProfileMenu();

            }

        }
    );

}


// ==========================================
// LOGIN BUTTON
// ==========================================

if(loginButton){

    loginButton.addEventListener(
        "click",
        signInWithGoogle
    );

}


// ==========================================
// LOGOUT BUTTON
// ==========================================

if(logoutButton){

    logoutButton.addEventListener(
        "click",
        signOut
    );

}


// ==========================================
// PROFILE BUTTON
// ==========================================

if(myProfileButton){

    myProfileButton.addEventListener(
        "click",
        function(){

            console.log(
                "👤 Profile clicked"
            );


            // Plus tard :
            // pages/profile.html

            alert(
                "Le profil ChessFK arrive bientôt 🔥"
            );

        }
    );

}


// ==========================================
// CLICK OUTSIDE
// ==========================================

document.addEventListener(
    "click",
    function(){

        closeProfileMenu();

    }
);


// ==========================================
// AUTH STATE
// ==========================================

supabaseClient.auth.onAuthStateChange(
    async function(
        event,
        session
    ){

        console.log(
            "🔄 AUTH EVENT:",
            event
        );


        const user =
            session?.user || null;


        updateAuthUI(user);


        if(user){

            console.log(
                "👤 CHESSFK USER:",
                user.id
            );


            console.log(
                "📧 EMAIL:",
                user.email
            );

        }

    }
);


// ==========================================
// INITIAL SESSION
// ==========================================

async function loadInitialSession(){

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


        updateAuthUI(user);


        if(user){

            console.log(
                "✅ Existing ChessFK session found"
            );

        }
        else{

            console.log(
                "👤 No ChessFK session"
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

loadInitialSession();


console.log(
    "🚀 CHESSFK AUTH SYSTEM READY"
);
```
