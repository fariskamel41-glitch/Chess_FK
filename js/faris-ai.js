// ======================================
// CHESS FK - FARIS AI
// STOCKFISH 18 EDITION
// ======================================

console.log("♟️ FARIS AI + STOCKFISH 18 LOADED");


// ======================================
// ÂGE / NIVEAUX FARIS
// ======================================

const farisParams =
    new URLSearchParams(window.location.search);

const farisAgeNumber =
    parseInt(
        farisParams.get("faris"),
        10
    );

const farisAge =
    Number.isFinite(farisAgeNumber)
        ? Math.max(7, Math.min(18, farisAgeNumber))
        : 18;


// ======================================
// NIVEAUX FARIS
// ======================================
//
// 7  -> très facile
// 8  -> facile
// 9  -> facile +
// 10 -> moyen
// 11 -> moyen / sérieux
// 12 -> fort
// 13 -> très fort
// 14 -> fort
// 15 -> très fort
// 16 -> très très fort
// 17 -> extrêmement fort
// 18 -> STOCKFISH NATIF
//
// IMPORTANT :
// Le niveau 18 reste exactement dans
// la configuration forte que nous avons
// validée.
// ======================================

const farisLevels = {

    // ==============================
    // 7 ANS
    // ==============================

    7: {
        elo: 700,
        time: 250,
        useLimitStrength: true
    },


    // ==============================
    // 8 ANS
    // ==============================

    8: {
        elo: 850,
        time: 300,
        useLimitStrength: true
    },


    // ==============================
    // 9 ANS
    // ==============================

    9: {
        elo: 1000,
        time: 350,
        useLimitStrength: true
    },


    // ==============================
    // 10 ANS
    // ==============================

    10: {
        elo: 1150,
        time: 450,
        useLimitStrength: true
    },


    // ==============================
    // 11 ANS
    // ==============================

    11: {
        elo: 1300,
        time: 600,
        useLimitStrength: true
    },


    // ==============================
    // 12 ANS
    // ==============================

    12: {
        elo: 1450,
        time: 800,
        useLimitStrength: true
    },


    // ==============================
    // 13 ANS
    // ==============================

    13: {
        elo: 1600,
        time: 1000,
        useLimitStrength: true
    },


    // ==============================
    // 14 ANS
    // ==============================

    14: {
        elo: 1800,
        time: 1400,
        useLimitStrength: true
    },


    // ==============================
    // 15 ANS
    // ==============================

    15: {
        elo: 2000,
        time: 1800,
        useLimitStrength: true
    },


    // ==============================
    // 16 ANS
    // ==============================

    16: {
        elo: 2200,
        time: 2200,
        useLimitStrength: true
    },


    // ==============================
    // 17 ANS
    // ==============================

    17: {
        elo: 2400,
        time: 2800,
        useLimitStrength: true
    },


    // ==============================
    // 18 ANS
    // ==============================
    //
    // NE PAS CHANGER
    //
    // Stockfish joue à sa force native.
    // ==================================

    18: {
        elo: 3200,
        time: 4000,
        useLimitStrength: false
    }

};


const farisLevel =
    farisLevels[farisAge] ||
    farisLevels[18];


let farisThinking = false;

let farisStockfish = null;

let farisStockfishReady = false;

let farisSearchToken = 0;


console.log(
    `♟️ FARIS: ${farisAge} ans | ${farisLevel.elo} ELO | ${farisLevel.time} ms`
);


// ======================================
// PIÈCES -> FEN
// ======================================

const farisPieceToFen = {

    "♜": "r",
    "♞": "n",
    "♝": "b",
    "♛": "q",
    "♚": "k",
    "♟": "p",

    "♖": "R",
    "♘": "N",
    "♗": "B",
    "♕": "Q",
    "♔": "K",
    "♙": "P"

};


// ======================================
// CRÉER FEN DU PLATEAU
// ======================================

function getBoardFEN(){

    let fen = "";


    for(
        let row = 0;
        row < 8;
        row++
    ){

        let empty = 0;


        for(
            let col = 0;
            col < 8;
            col++
        ){

            const piece =
                pieces[row][col];


            if(
                piece === "" ||
                piece == null
            ){

                empty++;

                continue;

            }


            if(empty){

                fen += empty;

                empty = 0;

            }


            const fenPiece =
                farisPieceToFen[piece];


            if(!fenPiece){

                console.error(
                    "❌ Pièce inconnue dans le plateau:",
                    piece,
                    "row:",
                    row,
                    "col:",
                    col
                );

                fen += "?";

            }
            else{

                fen += fenPiece;

            }

        }


        if(empty){

            fen += empty;

        }


        if(row < 7){

            fen += "/";

        }

    }


    return fen;

}


// ======================================
// DROITS AU ROQUE
// ======================================

function getFarisCastlingRights(){

    let rights = "";


    // ==================================
    // ROI BLANC
    // ==================================

    if(
        typeof whiteKingMoved !== "undefined" &&
        !whiteKingMoved
    ){

        if(
            typeof whiteRookRightMoved !== "undefined" &&
            !whiteRookRightMoved
        ){

            rights += "K";

        }


        if(
            typeof whiteRookLeftMoved !== "undefined" &&
            !whiteRookLeftMoved
        ){

            rights += "Q";

        }

    }


    // ==================================
    // ROI NOIR
    // ==================================

    if(
        typeof blackKingMoved !== "undefined" &&
        !blackKingMoved
    ){

        if(
            typeof blackRookRightMoved !== "undefined" &&
            !blackRookRightMoved
        ){

            rights += "k";

        }


        if(
            typeof blackRookLeftMoved !== "undefined" &&
            !blackRookLeftMoved
        ){

            rights += "q";

        }

    }


    return rights || "-";

}


// ======================================
// CASE EN PASSANT
// ======================================

function getFarisEnPassantSquare(){

    if(
        typeof lastMove === "undefined" ||
        !lastMove
    ){

        return "-";

    }


    if(
        lastMove.piece !== "♙" &&
        lastMove.piece !== "♟"
    ){

        return "-";

    }


    if(
        Math.abs(
            lastMove.toRow -
            lastMove.fromRow
        ) !== 2
    ){

        return "-";

    }


    const file =
        String.fromCharCode(
            97 + lastMove.toCol
        );


    const rank =
        8 -
        (
            (
                lastMove.fromRow +
                lastMove.toRow
            ) / 2
        );


    return file + rank;

}


// ======================================
// FEN COMPLET
// ======================================

function getFarisFullFEN(){

    const boardFen =
        getBoardFEN();


    const side =
        currentPlayer === "black"
            ? "b"
            : "w";


    const castling =
        getFarisCastlingRights();


    const enPassant =
        getFarisEnPassantSquare();


    return (
        boardFen +
        " " +
        side +
        " " +
        castling +
        " " +
        enPassant +
        " 0 1"
    );

}


// ======================================
// CASE -> UCI
// ======================================

function squareToUCI(
    row,
    col
){

    return (
        String.fromCharCode(
            97 + col
        ) +
        (
            8 - row
        )
    );

}


// ======================================
// UCI -> COUP
// ======================================

function uciToMove(uci){

    if(
        !uci ||
        typeof uci !== "string"
    ){

        return null;

    }


    uci =
        uci
            .trim()
            .toLowerCase();


    if(
        uci.length < 4
    ){

        return null;

    }


    const fromCol =
        uci.charCodeAt(0) -
        97;


    const fromRow =
        8 -
        parseInt(
            uci[1],
            10
        );


    const toCol =
        uci.charCodeAt(2) -
        97;


    const toRow =
        8 -
        parseInt(
            uci[3],
            10
        );


    if(
        !Number.isInteger(fromRow) ||
        !Number.isInteger(toRow) ||

        fromRow < 0 ||
        fromRow > 7 ||

        toRow < 0 ||
        toRow > 7 ||

        fromCol < 0 ||
        fromCol > 7 ||

        toCol < 0 ||
        toCol > 7
    ){

        return null;

    }


    return {

        fromRow:
            fromRow,

        fromCol:
            fromCol,

        toRow:
            toRow,

        toCol:
            toCol,

        promotion:
            uci.length >= 5
                ? uci[4]
                : null,

        uci:
            uci

    };

}


// ======================================
// INITIALISER STOCKFISH
// ======================================

async function initFarisStockfish(){

    if(
        farisStockfish &&
        farisStockfishReady
    ){

        return farisStockfish;

    }


    if(
        typeof window.createStockfish !==
        "function"
    ){

        throw new Error(
            "createStockfish() introuvable. Vérifie stockfish-loader.js"
        );

    }


    console.log(
        "♟️ FARIS → démarrage de Stockfish..."
    );


    farisStockfish =
        await window.createStockfish();


    farisStockfishReady =
        true;


    console.log(
        "✅ FARIS → STOCKFISH CONNECTÉ"
    );


    // ==================================
    // ÉCOUTE DES MESSAGES
    // ==================================

    farisStockfish.addEventListener(
        "message",
        farisStockfishMessage
    );


    // ==================================
    // CONFIGURATION MOTEUR
    // ==================================

    farisStockfish.postMessage(
        "setoption name Threads value 1"
    );


    farisStockfish.postMessage(
        "setoption name Hash value 64"
    );


    // ==================================
    // 7 → 17 ANS
    // ==================================

    if(
        farisLevel.useLimitStrength
    ){

        farisStockfish.postMessage(
            "setoption name UCI_LimitStrength value true"
        );


        farisStockfish.postMessage(
            "setoption name UCI_Elo value " +
            farisLevel.elo
        );


        console.log(
            `🎯 FARIS → moteur limité à environ ${farisLevel.elo} ELO`
        );

    }


    // ==================================
    // 18 ANS
    // ==================================

    else{

        farisStockfish.postMessage(
            "setoption name UCI_LimitStrength value false"
        );


        console.log(
            "🔥 FARIS 18 → STOCKFISH FORCE NATIVE"
        );


        console.log(
            "🔥 FARIS 18 → aucune limitation UCI_Elo"
        );

    }


    // ==================================
    // SYNCHRONISATION
    // ==================================

    farisStockfish.postMessage(
        "isready"
    );


    return farisStockfish;

}


// ======================================
// VARIABLES D'ATTENTE
// ======================================

let farisWaitingResolve =
    null;

let farisWaitingReject =
    null;

let farisWaitingTimer =
    null;


// ======================================
// MESSAGE STOCKFISH
// ======================================

function farisStockfishMessage(event){

    const message =
        event.data;


    if(
        typeof message !== "string"
    ){

        return;

    }


    // ==================================
    // READY
    // ==================================

    if(
        message === "readyok"
    ){

        console.log(
            "✅ STOCKFISH READYOK"
        );

        return;

    }


    // ==================================
    // BESTMOVE
    // ==================================

    if(
        message.startsWith(
            "bestmove "
        )
    ){

        const parts =
            message
                .trim()
                .split(/\s+/);


        const bestMove =
            parts[1];


        console.log(
            "♟️ STOCKFISH BESTMOVE:",
            bestMove
        );


        if(
            farisWaitingResolve
        ){

            const resolve =
                farisWaitingResolve;


            clearTimeout(
                farisWaitingTimer
            );


            farisWaitingResolve =
                null;

            farisWaitingReject =
                null;


            resolve(
                bestMove
            );

        }

    }

}


// ======================================
// DEMANDER UN COUP
// ======================================

function askStockfishForMove(
    fen
){

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if(
                !farisStockfish ||
                !farisStockfishReady
            ){

                reject(
                    new Error(
                        "Stockfish n'est pas prêt"
                    )
                );

                return;

            }


            if(
                farisWaitingResolve
            ){

                reject(
                    new Error(
                        "Stockfish réfléchit déjà"
                    )
                );

                return;

            }


            farisWaitingResolve =
                resolve;


            farisWaitingReject =
                reject;


            const timeout =
                Math.max(
                    10000,
                    farisLevel.time + 7000
                );


            farisWaitingTimer =
                setTimeout(
                    () => {

                        if(
                            farisWaitingReject
                        ){

                            const rejectNow =
                                farisWaitingReject;


                            farisWaitingResolve =
                                null;


                            farisWaitingReject =
                                null;


                            rejectNow(
                                new Error(
                                    "Stockfish timeout"
                                )
                            );

                        }

                    },
                    timeout
                );


            console.log(
                "♟️ STOCKFISH POSITION:",
                fen
            );


            console.log(
                "🧠 FARIS → STOCKFISH |",
                `${farisAge} ans`,
                "|",
                farisLevel.elo,
                "ELO affiché",
                "|",
                farisLevel.time,
                "ms"
            );


            // ==================================
            // ARRÊTER ANCIENNE RECHERCHE
            // ==================================

            farisStockfish.postMessage(
                "stop"
            );


            // ==================================
            // NOUVELLE PARTIE
            // ==================================

            farisStockfish.postMessage(
                "ucinewgame"
            );


            // ==================================
            // POSITION
            // ==================================

            farisStockfish.postMessage(
                "position fen " +
                fen
            );


            // ==================================
            // RECHERCHE
            // ==================================

            farisStockfish.postMessage(
                "go movetime " +
                farisLevel.time
            );

        }
    );

}


// ======================================
// JEUNES
// ======================================
//
// On ne modifie jamais le bestmove.
// Les premiers niveaux sont affaiblis
// par UCI_Elo.
// ======================================

function maybeMakeYoungMistake(
    move
){

    return move;

}


// ======================================
// EXÉCUTER COUP IA
// ======================================

function executeAIMove(
    move
){

    if(!move){

        farisThinking =
            false;

        return;

    }


    const movingPiece =
        pieces[
            move.fromRow
        ][
            move.fromCol
        ];


    if(!movingPiece){

        console.error(
            "❌ FARIS: pièce introuvable",
            move
        );


        farisThinking =
            false;


        return;

    }


    const targetPiece =
        pieces[
            move.toRow
        ][
            move.toCol
        ];


    const captured =
        targetPiece !== "";


    // ==================================
    // HISTORIQUE
    // ==================================

    if(
        typeof saveGameState ===
        "function" &&

        typeof moveHistory !==
        "undefined"
    ){

        moveHistory.push(
            saveGameState()
        );

    }


    // ==================================
    // NOTATION
    // ==================================

    let notation = "";


    if(
        typeof getMoveNotation ===
        "function"
    ){

        notation =
            getMoveNotation(

                movingPiece,

                move.fromRow,
                move.fromCol,

                move.toRow,
                move.toCol,

                captured

            );

    }


    // ==================================
    // EN PASSANT NOIR
    // ==================================

    if(
        movingPiece === "♟" &&

        move.fromCol !==
        move.toCol &&

        targetPiece === ""
    ){

        const capturedRow =
            move.toRow - 1;


        if(
            capturedRow >= 0 &&

            pieces[
                capturedRow
            ][
                move.toCol
            ] === "♙"
        ){

            pieces[
                capturedRow
            ][
                move.toCol
            ] = "";

        }

    }


    // ==================================
    // ROQUE NOIR
    // ==================================

    if(
        movingPiece === "♚" &&

        move.fromRow === 0 &&

        move.fromCol === 4
    ){

        if(
            move.toCol === 6
        ){

            pieces[0][5] =
                pieces[0][7];


            pieces[0][7] =
                "";


            notation =
                "O-O";

        }


        else if(
            move.toCol === 2
        ){

            pieces[0][3] =
                pieces[0][0];


            pieces[0][0] =
                "";


            notation =
                "O-O-O";

        }

    }


    // ==================================
    // DÉPLACEMENT
    // ==================================

    pieces[
        move.toRow
    ][
        move.toCol
    ] =
        movingPiece;


    pieces[
        move.fromRow
    ][
        move.fromCol
    ] =
        "";


    // ==================================
    // PROMOTION
    // ==================================

    if(
        movingPiece === "♟" &&

        move.toRow === 7
    ){

        let promoted =
            "♛";


        if(
            move.promotion === "n"
        ){

            promoted =
                "♞";

        }


        if(
            move.promotion === "b"
        ){

            promoted =
                "♝";

        }


        if(
            move.promotion === "r"
        ){

            promoted =
                "♜";

        }


        pieces[
            move.toRow
        ][
            move.toCol
        ] =
            promoted;


        if(notation){

            notation +=
                "=" +
                promoted;

        }

    }


    // ==================================
    // DERNIER COUP
    // ==================================

    if(
        typeof lastMove !==
        "undefined"
    ){

        lastMove = {

            piece:
                movingPiece,

            fromRow:
                move.fromRow,

            fromCol:
                move.fromCol,

            toRow:
                move.toRow,

            toCol:
                move.toCol

        };

    }


    // ==================================
    // ROI NOIR
    // ==================================

    if(
        movingPiece === "♚"
    ){

        if(
            typeof blackKingMoved !==
            "undefined"
        ){

            blackKingMoved =
                true;

        }

    }


    // ==================================
    // TOUR NOIRE GAUCHE
    // ==================================

    if(
        movingPiece === "♜" &&

        move.fromRow === 0 &&

        move.fromCol === 0 &&

        typeof blackRookLeftMoved !==
        "undefined"
    ){

        blackRookLeftMoved =
            true;

    }


    // ==================================
    // TOUR NOIRE DROITE
    // ==================================

    if(
        movingPiece === "♜" &&

        move.fromRow === 0 &&

        move.fromCol === 7 &&

        typeof blackRookRightMoved !==
        "undefined"
    ){

        blackRookRightMoved =
            true;

    }


    // ==================================
    // HISTORIQUE DES COUPS
    // ==================================

    if(
        typeof addMoveToList ===
        "function"
    ){

        addMoveToList(
            notation || move.uci,
            "black"
        );

    }


    // ==================================
    // TOUR BLANC
    // ==================================

    currentPlayer =
        "white";


    // ==================================
    // RESET
    // ==================================

    selectedRow =
        null;


    selectedCol =
        null;


    possibleMoves =
        [];


    // ==================================
    // AFFICHAGE
    // ==================================

    if(
        typeof drawBoard ===
        "function"
    ){

        drawBoard();

    }


    if(
        typeof updateGameStatus ===
        "function"
    ){

        updateGameStatus();

    }


    farisThinking =
        false;


    console.log(
        "✅ FARIS A JOUÉ :",
        move.uci || notation
    );

}


// ======================================
// FARIS PLAY
// ======================================

async function farisPlay(){

    console.log(
        "🤖 farisPlay() — STOCKFISH"
    );


    // ==================================
    // GAME OVER
    // ==================================

    if(
        typeof gameOver !==
        "undefined" &&
        gameOver
    ){

        return;

    }


    // ==================================
    // TOUR DE FARIS
    // ==================================

    if(
        typeof currentPlayer ===
        "undefined" ||
        currentPlayer !== "black"
    ){

        return;

    }


    // ==================================
    // DÉJÀ EN TRAIN DE RÉFLÉCHIR
    // ==================================

    if(farisThinking){

        return;

    }


    farisThinking =
        true;


    const token =
        ++farisSearchToken;


    console.log(
        "🧠 FARIS RÉFLÉCHIT"
    );


    console.log(
        "Age:",
        farisAge,

        "| ELO:",
        farisLevel.elo,

        "| Time:",
        farisLevel.time,
        "ms",

        "| Limit:",
        farisLevel.useLimitStrength
    );


    try{

        // ==================================
        // DÉMARRAGE STOCKFISH
        // ==================================

        await initFarisStockfish();


        if(
            token !==
            farisSearchToken
        ){

            farisThinking =
                false;

            return;

        }


        // ==================================
        // GAME OVER
        // ==================================

        if(
            typeof gameOver !==
            "undefined" &&
            gameOver
        ){

            farisThinking =
                false;

            return;

        }


        // ==================================
        // TOUR
        // ==================================

        if(
            currentPlayer !==
            "black"
        ){

            farisThinking =
                false;

            return;

        }


        // ==================================
        // FEN
        // ==================================

        const fen =
            getFarisFullFEN();


        console.log(
            "♟️ FEN:",
            fen
        );


        // ==================================
        // CHERCHER COUP
        // ==================================

        const bestUCI =
            await askStockfishForMove(
                fen
            );


        if(
            token !==
            farisSearchToken
        ){

            farisThinking =
                false;

            return;

        }


        // ==================================
        // PAS DE COUP
        // ==================================

        if(
            !bestUCI ||
            bestUCI === "(none)"
        ){

            console.log(
                "🏁 STOCKFISH ne trouve aucun coup."
            );


            farisThinking =
                false;


            if(
                typeof updateGameStatus ===
                "function"
            ){

                updateGameStatus();

            }


            return;

        }


        // ==================================
        // CONVERSION UCI
        // ==================================

        let move =
            uciToMove(
                bestUCI
            );


        if(!move){

            throw new Error(
                "Coup UCI invalide: " +
                bestUCI
            );

        }


        // ==================================
        // JEUNES
        // ==================================

        move =
            maybeMakeYoungMistake(
                move
            );


        // ==================================
        // PETIT DÉLAI
        // ==================================

        const delay =
            150 +
            Math.random() *
            250;


        setTimeout(
            () => {

                if(
                    token !==
                    farisSearchToken
                ){

                    return;

                }


                if(
                    typeof gameOver !==
                    "undefined" &&
                    gameOver
                ){

                    farisThinking =
                        false;

                    return;

                }


                if(
                    currentPlayer !==
                    "black"
                ){

                    farisThinking =
                        false;

                    return;

                }


                executeAIMove(
                    move
                );

            },
            delay
        );

    }

    catch(error){

        console.error(
            "🔥 ERREUR FARIS / STOCKFISH:",
            error
        );


        farisThinking =
            false;

    }

}


// ======================================
// RESET FARIS
// ======================================

function resetFarisAI(){

    farisThinking =
        false;


    farisSearchToken++;


    if(
        farisWaitingReject
    ){

        const rejectNow =
            farisWaitingReject;


        farisWaitingResolve =
            null;


        farisWaitingReject =
            null;


        clearTimeout(
            farisWaitingTimer
        );


        rejectNow(
            new Error(
                "Faris reset"
            )
        );

    }


    if(
        farisStockfish &&
        farisStockfishReady
    ){

        try{

            farisStockfish.postMessage(
                "stop"
            );

        }

        catch(error){

            console.error(
                "❌ Erreur arrêt Stockfish:",
                error
            );

        }

    }

}


// ======================================
// MODE ANALYSE
// ======================================

async function farisAnalyzePosition(){

    try{

        await initFarisStockfish();


        const fen =
            getFarisFullFEN();


        farisStockfish.postMessage(
            "stop"
        );


        farisStockfish.postMessage(
            "position fen " +
            fen
        );


        farisStockfish.postMessage(
            "go depth 18"
        );


        console.log(
            "🔎 FARIS ANALYSE:",
            fen
        );

    }

    catch(error){

        console.error(
            "❌ Analyse impossible:",
            error
        );

    }

}


// ======================================
// EXPORTS
// ======================================

window.farisPlay =
    farisPlay;


window.executeAIMove =
    executeAIMove;


window.resetFarisAI =
    resetFarisAI;


window.getBoardFEN =
    getBoardFEN;


window.getFarisFullFEN =
    getFarisFullFEN;


window.farisAnalyzePosition =
    farisAnalyzePosition;


window.uciToMove =
    uciToMove;


window.squareToUCI =
    squareToUCI;


// ======================================
// READY
// ======================================

console.log(
    "======================================"
);


console.log(
    "♟️ FARIS AI READY"
);


console.log(
    "Age:",
    farisAge
);


console.log(
    "Target ELO:",
    farisLevel.elo
);


console.log(
    "Stockfish:",
    "18"
);


console.log(
    "Search time:",
    farisLevel.time,
    "ms"
);


console.log(
    "Strength limit:",
    farisLevel.useLimitStrength
        ? "LIMITED"
        : "NATIVE STOCKFISH"
);


console.log(
    "======================================"
);