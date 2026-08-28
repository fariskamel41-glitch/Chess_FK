// ======================================================
// CHESS_FK - SUPABASE
// ======================================================

console.log("♟️ CHESS_FK SUPABASE STARTING...");

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


if (!window.supabase) {

    console.error("❌ SUPABASE CDN NON CHARGÉ");

} else {

    console.log("✅ SUPABASE JS DÉTECTÉ");

    const client =
        window.supabase.createClient(
            CHESSFK_SUPABASE_URL,
            CHESSFK_SUPABASE_KEY
        );

    // Ancien nom : compatible avec auth.js
    window.chessfkSupabase = client;

    // Nouveau nom : utilisé par online.js
    window.supabaseClient = client;

    console.log("✅ CHESS_FK CONNECTÉ À SUPABASE");

}