// ==========================================
// CHESS_FK - STOCKFISH LOADER
// ==========================================

console.log("♟️ STOCKFISH LOADER STARTING...");

let stockfishEngine = null;
let stockfishReady = false;
let stockfishReadyPromise = null;


// ==========================================
// CRÉER STOCKFISH
// ==========================================

function createStockfish() {

    // Si Stockfish existe déjà
    if (stockfishEngine && stockfishReady) {

        return Promise.resolve(stockfishEngine);

    }


    // Si Stockfish est déjà en train de démarrer
    if (stockfishReadyPromise) {

        return stockfishReadyPromise;

    }


    stockfishReadyPromise = new Promise((resolve, reject) => {

        try {

            console.log(
                "♟️ Création du Worker Stockfish..."
            );


            const worker = new Worker(
                "../engine/stockfish-18-lite-single.js"
            );


            worker.onmessage = function(event) {

                const message = event.data;


                if (typeof message !== "string") {

                    return;

                }


                console.log(
                    "♟️ STOCKFISH:",
                    message
                );


                // ==================================
                // STOCKFISH PRÊT
                // ==================================

                if (message.includes("uciok")) {

                    console.log(
                        "✅ STOCKFISH READY"
                    );


                    stockfishReady = true;

                    stockfishEngine = worker;

                    resolve(worker);

                }

            };


            worker.onerror = function(error) {

                console.error(
                    "❌ STOCKFISH ERROR:",
                    error
                );


                stockfishReady = false;

                stockfishEngine = null;

                stockfishReadyPromise = null;

                reject(error);

            };


            // ==================================
            // DÉMARRER UCI
            // ==================================

            console.log(
                "♟️ Envoi de UCI à Stockfish..."
            );


            worker.postMessage("uci");


        } catch(error) {

            console.error(
                "❌ Impossible de démarrer Stockfish:",
                error
            );


            stockfishReadyPromise = null;

            reject(error);

        }

    });


    return stockfishReadyPromise;

}


// ==========================================
// ENVOYER UNE COMMANDE À STOCKFISH
// ==========================================

function sendStockfishCommand(command) {

    if (!stockfishEngine) {

        console.error(
            "❌ Stockfish n'est pas démarré."
        );

        return false;

    }


    console.log(
        "➡️ STOCKFISH COMMAND:",
        command
    );


    stockfishEngine.postMessage(command);

    return true;

}


// ==========================================
// RÉCUPÉRER LE WORKER
// ==========================================

function getStockfishEngine() {

    return stockfishEngine;

}


// ==========================================
// ARRÊTER STOCKFISH
// ==========================================

function stopStockfish() {

    if (!stockfishEngine) {

        return;

    }


    try {

        stockfishEngine.postMessage("stop");

    } catch(error) {

        console.error(
            "❌ Erreur stop Stockfish:",
            error
        );

    }

}


// ==========================================
// FERMER STOCKFISH
// ==========================================

function destroyStockfish() {

    if (!stockfishEngine) {

        return;

    }


    try {

        stockfishEngine.postMessage("quit");

    } catch(error) {

        console.error(
            "❌ Erreur fermeture Stockfish:",
            error
        );

    }


    stockfishEngine = null;

    stockfishReady = false;

    stockfishReadyPromise = null;


    console.log(
        "🛑 STOCKFISH FERMÉ"
    );

}


// ==========================================
// EXPORT GLOBAL
// ==========================================

window.createStockfish =
    createStockfish;

window.sendStockfishCommand =
    sendStockfishCommand;

window.getStockfishEngine =
    getStockfishEngine;

window.stopStockfish =
    stopStockfish;

window.destroyStockfish =
    destroyStockfish;


// ==========================================
// READY
// ==========================================

console.log(
    "♟️ STOCKFISH LOADER READY"
);