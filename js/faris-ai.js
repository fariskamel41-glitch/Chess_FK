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


const farisLevels = {

    7: {
        elo: 1100,
        time: 280,
        randomness: 0.38,
        blunder: 0.10
    },

    8: {
        elo: 1200,
        time: 320,
        randomness: 0.28,
        blunder: 0.06
    },

    9: {
        elo: 1300,
        time: 360,
        randomness: 0.18,
        blunder: 0.035
    },

    10: {
        elo: 1400,
        time: 400,
        randomness: 0.12,
        blunder: 0.020
    },

    11: {
        elo: 1700,
        time: 500,
        randomness: 0.055,
        blunder: 0.008
    },

    12: {
        elo: 1800,
        time: 550,
        randomness: 0.040,
        blunder: 0.005
    },

    13: {
        elo: 1900,
        time: 600,
        randomness: 0.025,
        blunder: 0.003
    },

    14: {
        elo: 2000,
        time: 700,
        randomness: 0.015,
        blunder: 0.001
    },

    15: {
        elo: 2100,
        time: 800,
        randomness: 0.008,
        blunder: 0.0005
    },

    16: {
        elo: 2200,
        time: 900,
        randomness: 0.004,
        blunder: 0.0002
    },

    17: {
        elo: 2300,
        time: 1050,
        randomness: 0.002,
        blunder: 0
    },

    18: {
        elo: 2400,
        time: 1200,
        randomness: 0,
        blunder: 0
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


            fen +=
                farisPieceToFen[piece] ||
                "?";

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


    // ROI BLANC

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


    // ROI NOIR

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
    // ÉCOUTER LES RÉPONSES
    // ==================================

    farisStockfish.addEventListener(
        "message",
        farisStockfishMessage
    );


    // ==================================
    // CONFIGURATION
    // ==================================

    farisStockfish.postMessage(
        "setoption name Threads value 1"
    );


    farisStockfish.postMessage(
        "setoption name Hash value 64"
    );


    // ==================================
    // FORCE FARIS
    // ==================================

    const engineElo =
        Math.max(
            1320,
            farisLevel.elo
        );


    farisStockfish.postMessage(
        "setoption name UCI_LimitStrength value true"
    );


    farisStockfish.postMessage(
        "setoption name UCI_Elo value " +
        engineElo
    );


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
                    3000,
                    farisLevel.time + 2500
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
                farisAge,
                "ans |",
                farisLevel.elo,
                "ELO |",
                farisLevel.time,
                "ms"
            );


            // ==================================
            // NOUVELLE PARTIE
            // ==================================

            farisStockfish.postMessage(
                "stop"
            );


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
// PETIT HASARD POUR LES JEUNES
// ======================================

function maybeMakeYoungMistake(
    move
){

    if(!move){

        return move;

    }


    if(
        farisAge >= 17
    ){

        return move;

    }


    if(
        Math.random() >=
        farisLevel.randomness
    ){

        return move;

    }


    console.log(
        "😂 Faris jeune laisse un peu de hasard."
    );


    // On garde le coup Stockfish
    // pour ne jamais créer de coup illégal.

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

        // PETIT ROQUE

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


        // GRAND ROQUE

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
    // RESET SÉLECTION
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
        "ms"
    );


    try{

        // ==================================
        // DÉMARRER STOCKFISH
        // ==================================

        await initFarisStockfish();


        if(
            token !==
            farisSearchToken
        ){

            return;

        }


        // ==================================
        // VÉRIFICATION
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
        // STOCKFISH CHERCHE
        // ==================================

        const bestUCI =
            await askStockfishForMove(
                fen
            );


        if(
            token !==
            farisSearchToken
        ){

            return;

        }


        // ==================================
        // AUCUN COUP
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
        // CONVERTIR UCI
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
        // PETIT HASARD JEUNES
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

        farisWaitingReject(
            new Error(
                "Faris reset"
            )
        );


        farisWaitingResolve =
            null;


        farisWaitingReject =
            null;

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
    "======================================"
);