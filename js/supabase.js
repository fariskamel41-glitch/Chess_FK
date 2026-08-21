// ======================================================
// CHESS_FK - SUPABASE
// ======================================================

console.log("♟️ CHESS_FK SUPABASE STARTING...");

const CHESSFK_SUPABASE_URL =
    "https://rqwmipinrjwanvxjiobj.supabase.co";

const CHESSFK_SUPABASE_KEY =
    "sb_publishable_d_9h8Joh38G85ru69uprAQ_ELbbHM5n";


if (!window.supabase) {

    console.error(
        "❌ SUPABASE CDN NON CHARGÉ"
    );

} else {

    console.log(
        "✅ SUPABASE JS DÉTECTÉ"
    );


    window.chessfkSupabase =
        window.supabase.createClient(
            CHESSFK_SUPABASE_URL,
            CHESSFK_SUPABASE_KEY
        );


    console.log(
        "✅ CHESS_FK CONNECTÉ À SUPABASE"
    );

}