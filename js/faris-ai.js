// ==========================================
// CHESS_FK - FARIS AI
// VERSION PRO - BLANC / NOIR
// STOCKFISH 18
// ==========================================

console.log("==========================================");
console.log("♟️ CHESS_FK - FARIS AI");
console.log("🤖 STOCKFISH 18");
console.log("==========================================");


// ==========================================
// PARAMÈTRES URL
// ==========================================

const farisParams =
    new URLSearchParams(window.location.search);


// ==========================================
// ÂGE FARIS
// ==========================================

const farisAgeNumber =
    parseInt(
        farisParams.get("faris"),
        10
    );


const farisAge =
    Number.isFinite(farisAgeNumber)
        ? Math.max(
            7,
            Math.min(
                18,
                farisAgeNumber
            )
        )
        : 18;


// ==========================================
// COULEUR FARIS
// ==========================================
//
// ?faris=18&color=white
// Faris = blanc
//
// ?faris=18&color=black
// Faris = noir
//
// Par défaut : noir
// ==========================================

const colorParameter =
    farisParams.get("color");


const farisColor =
    colorParameter === "white"
        ? "white"
        : "black";


const humanColor =
    farisColor === "white"
        ? "black"
        : "white";


window.farisColor =
    farisColor;


window.humanColor =
    humanColor;


console.log(
    "🤖 FARIS COULEUR:",
    farisColor
);


console.log(
    "👤 JOUEUR COULEUR:",
    humanColor
);


// ==========================================
// NIVEAUX FARIS
// ==========================================

const farisLevels = {

    7: {
        elo: 1100,
        searchTime: 250
    },

    8: {
        elo: 1200,
        searchTime: 300
    },

    9: {
        elo: 1300,
        searchTime: 350
    },

    10: {
        elo: 1400,
        searchTime: 400
    },

    11: {
        elo: 1700,
        searchTime: 500
    },

    12: {
        elo: 1800,
        searchTime: 550
    },

    13: {
        elo: 1900,
        searchTime: 600
    },

    14: {
        elo: 2000,
        searchTime: 700
    },

    15: {
        elo: 2100,
        searchTime: 800
    },

    16: {
        elo: 2200,
        searchTime: 900
    },

    17: {
        elo: 2300,
        searchTime: 1050
    },

    18: {
        elo: 2400,
        searchTime: 1200
    }

};


const farisLevel =
    farisLevels[farisAge] ||
    farisLevels[18];


console.log(
    "♟️ FARIS:",
    farisAge,
    "ans |",
    farisLevel.elo,
    "ELO |",
    farisLevel.searchTime,
    "ms"
);


// ==========================================
// ÉTAT FARIS
// ==========================================

let farisThinking =
    false;


let farisMoveToken =
    0;


let farisEngine =
    null;


let farisEngineReady =
    false;


// ==========================================
// VARIABLES GLOBALES
// ==========================================

window.farisThinking =
    false;

window.farisMoveToken =
    0;


// ==========================================
// PIÈCES
// ==========================================

const farisPieceValues = {

    "♙": 100,
    "♟": 100,

    "♘": 320,
    "♞": 320,

    "♗": 330,
    "♝": 330,

    "♖": 500,
    "♜": 500,

    "♕": 900,
    "♛": 900,

    "♔": 20000,
    "♚": 20000

};


// ==========================================
// COULEURS PIÈCES
// ==========================================

function isFarisWhitePiece(piece){

    return (

        piece === "♙" ||
        piece === "♘" ||
        piece === "♗" ||
        piece === "♖" ||
        piece === "♕" ||
        piece === "♔"

    );

}


function isFarisBlackPiece(piece){

    return (

        piece === "♟" ||
        piece === "♞" ||
        piece === "♝" ||
        piece === "♜" ||
        piece === "♛" ||
        piece === "♚"

    );

}


function isFarisPieceOfColor(
    piece,
    color
){

    if(color === "white"){

        return isFarisWhitePiece(piece);

    }

    return isFarisBlackPiece(piece);

}


// ==========================================
// OBTENIR LE MOTEUR STOCKFISH
// ==========================================
//
// Compatible avec plusieurs versions
// de stockfish-loader.js
// ==========================================

async function getFarisEngine(){

    // --------------------------------------
    // 1. MOTEUR DÉJÀ EXISTANT
    // --------------------------------------

    if(
        window.stockfish
    ){

        console.log(
            "♟️ Stockfish trouvé : window.stockfish"
        );

        return window.stockfish;

    }


    // --------------------------------------
    // 2. stockfishEngine
    // --------------------------------------

    if(
        window.stockfishEngine
    ){

        console.log(
            "♟️ Stockfish trouvé : window.stockfishEngine"
        );

        return window.stockfishEngine;

    }


    // --------------------------------------
    // 3. engine
    // --------------------------------------

    if(
        window.engine
    ){

        console.log(
            "♟️ Stockfish trouvé : window.engine"
        );

        return window.engine;

    }


    // --------------------------------------
    // 4. createStockfish()
    // --------------------------------------

    if(
        typeof window.createStockfish === "function"
    ){

        console.log(
            "♟️ Création de Stockfish..."
        );


        const engine =
            await window.createStockfish();


        if(engine){

            console.log(
                "✅ Stockfish créé avec createStockfish()"
            );

            return engine;

        }

    }


    return null;

}


// ==========================================
// INITIALISATION STOCKFISH
// ==========================================

async function initializeFarisEngine(){

    if(farisEngine){

        return farisEngine;

    }


    try{

        farisEngine =
            await getFarisEngine();


        if(!farisEngine){

            console.warn(
                "⚠️ Stockfish pas encore disponible."
            );

            farisEngineReady =
                false;

            return null;

        }


        console.log(
            "✅ MOTEUR STOCKFISH CONNECTÉ"
        );


        // ----------------------------------
        // CONFIGURATION UCI
        // ----------------------------------

        try{

            farisEngine.postMessage(
                "uci"
            );

            farisEngine.postMessage(
                "setoption name UCI_LimitStrength value true"
            );

            farisEngine.postMessage(
                "setoption name UCI_Elo value " +
                farisLevel.elo
            );

            farisEngine.postMessage(
                "isready"
            );

        }
        catch(error){

            console.warn(
                "⚠️ Configuration UCI :",
                error
            );

        }


        farisEngineReady =
            true;


        console.log(
            "✅ FARIS AI STOCKFISH READY"
        );


        return farisEngine;

    }
    catch(error){

        console.error(
            "❌ Impossible de charger Stockfish:",
            error
        );


        farisEngineReady =
            false;


        return null;

    }

}


// ==========================================
// ATTENDRE STOCKFISH
// ==========================================

async function waitForFarisEngine(){

    for(
        let i = 0;
        i < 40;
        i++
    ){

        const engine =
            await initializeFarisEngine();


        if(engine){

            return engine;

        }


        await new Promise(
            function(resolve){

                setTimeout(
                    resolve,
                    250
                );

            }
        );

    }


    console.error(
        "❌ STOCKFISH N'EST PAS DISPONIBLE."
    );


    return null;

}


// ==========================================
// COORDONNÉES
// ==========================================

function farisSquareToCoords(square){

    if(
        typeof square !== "string" ||
        square.length !== 2
    ){

        return null;

    }


    const file =
        square.charCodeAt(0) - 97;


    const rank =
        parseInt(
            square.charAt(1),
            10
        );


    if(
        file < 0 ||
        file > 7 ||
        rank < 1 ||
        rank > 8
    ){

        return null;

    }


    return {

        row:
            8 - rank,

        col:
            file

    };

}


// ==========================================
// UCI → BOARD
// ==========================================

function uciToBoardMove(uci){

    if(
        typeof uci !== "string" ||
        uci.length < 4
    ){

        return null;

    }


    const from =
        farisSquareToCoords(
            uci.substring(
                0,
                2
            )
        );


    const to =
        farisSquareToCoords(
            uci.substring(
                2,
                4
            )
        );


    if(
        !from ||
        !to
    ){

        return null;

    }


    return {

        fromRow:
            from.row,

        fromCol:
            from.col,

        toRow:
            to.row,

        toCol:
            to.col,

        promotion:
            uci.length >= 5
                ? uci.charAt(4)
                : null

    };

}


window.uciToBoardMove =
    uciToBoardMove;


// ==========================================
// BOARD → CASE
// ==========================================

function boardToSquare(
    row,
    col
){

    const files =
        "abcdefgh";


    return (
        files[col] +
        (8 - row)
    );

}


// ==========================================
// FEN
// ==========================================

function getFarisFEN(){

    if(
        typeof pieces === "undefined"
    ){

        return null;

    }


    let fen =
        "";


    // --------------------------------------
    // POSITION
    // --------------------------------------

    for(
        let row = 0;
        row < 8;
        row++
    ){

        let empty =
            0;


        for(
            let col = 0;
            col < 8;
            col++
        ){

            const piece =
                pieces[row][col];


            if(
                piece === ""
            ){

                empty++;

                continue;

            }


            if(empty > 0){

                fen +=
                    empty;

                empty = 0;

            }


            const map = {

                "♙": "P",
                "♘": "N",
                "♗": "B",
                "♖": "R",
                "♕": "Q",
                "♔": "K",

                "♟": "p",
                "♞": "n",
                "♝": "b",
                "♜": "r",
                "♛": "q",
                "♚": "k"

            };


            fen +=
                map[piece] || "1";

        }


        if(empty > 0){

            fen +=
                empty;

        }


        if(row < 7){

            fen += "/";

        }

    }


    // --------------------------------------
    // TOUR
    // --------------------------------------

    fen +=
        " " +
        (
            currentPlayer === "white"
                ? "w"
                : "b"
        );


    // --------------------------------------
    // ROQUE
    // --------------------------------------

    let castling =
        "";


    if(
        typeof whiteKingMoved !== "undefined" &&
        typeof whiteRookRightMoved !== "undefined" &&
        !whiteKingMoved &&
        !whiteRookRightMoved
    ){

        castling += "K";

    }


    if(
        typeof whiteKingMoved !== "undefined" &&
        typeof whiteRookLeftMoved !== "undefined" &&
        !whiteKingMoved &&
        !whiteRookLeftMoved
    ){

        castling += "Q";

    }


    if(
        typeof blackKingMoved !== "undefined" &&
        typeof blackRookRightMoved !== "undefined" &&
        !blackKingMoved &&
        !blackRookRightMoved
    ){

        castling += "k";

    }


    if(
        typeof blackKingMoved !== "undefined" &&
        typeof blackRookLeftMoved !== "undefined" &&
        !blackKingMoved &&
        !blackRookLeftMoved
    ){

        castling += "q";

    }


    if(castling === ""){

        castling =
            "-";

    }


    fen +=
        " " +
        castling;


    // --------------------------------------
    // EN PASSANT
    // --------------------------------------

    let enPassant =
        "-";


    if(
        typeof lastMove !== "undefined" &&
        lastMove
    ){

        if(
            (
                lastMove.piece === "♙" ||
                lastMove.piece === "♟"
            )
            &&
            Math.abs(
                lastMove.fromRow -
                lastMove.toRow
            ) === 2
        ){

            enPassant =
                boardToSquare(
                    (
                        lastMove.fromRow +
                        lastMove.toRow
                    ) / 2,
                    lastMove.fromCol
                );

        }

    }


    fen +=
        " " +
        enPassant;


    // --------------------------------------
    // HALF MOVE
    // --------------------------------------

    fen +=
        " 0";


    // --------------------------------------
    // FULL MOVE
    // --------------------------------------

    const fullMove =
        typeof moveNumber !== "undefined"
            ? Math.max(
                1,
                moveNumber
            )
            : 1;


    fen +=
        " " +
        fullMove;


    return fen;

}


window.getFarisFullFEN =
    getFarisFEN;


// ==========================================
// POSITION INITIALE
// ==========================================

function isInitialPosition(){

    if(
        typeof pieces === "undefined"
    ){

        return false;

    }


    const initial = [

        ["♜","♞","♝","♛","♚","♝","♞","♜"],

        ["♟","♟","♟","♟","♟","♟","♟","♟"],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["♙","♙","♙","♙","♙","♙","♙","♙"],

        ["♖","♘","♗","♕","♔","♗","♘","♖"]

    ];


    for(
        let row = 0;
        row < 8;
        row++
    ){

        for(
            let col = 0;
            col < 8;
            col++
        ){

            if(
                pieces[row][col] !==
                initial[row][col]
            ){

                return false;

            }

        }

    }


    return true;

}


// ==========================================
// TROUVER LES COUPS LÉGAUX
// ==========================================

function getLegalMovesForColor(
    color
){

    const result =
        [];


    if(
        typeof pieces === "undefined"
    ){

        return result;

    }


    if(
        typeof getPossibleMoves !== "function"
    ){

        console.error(
            "❌ getPossibleMoves() absent."
        );

        return result;

    }


    if(
        typeof isMoveLegal !== "function"
    ){

        console.error(
            "❌ isMoveLegal() absent."
        );

        return result;

    }


    for(
        let row = 0;
        row < 8;
        row++
    ){

        for(
            let col = 0;
            col < 8;
            col++
        ){

            const piece =
                pieces[row][col];


            if(
                !isFarisPieceOfColor(
                    piece,
                    color
                )
            ){

                continue;

            }


            const possible =
                getPossibleMoves(
                    row,
                    col
                );


            if(
                !Array.isArray(possible)
            ){

                continue;

            }


            for(
                const move of possible
            ){

                if(
                    !move ||
                    move.length < 2
                ){

                    continue;

                }


                if(
                    isMoveLegal(
                        row,
                        col,
                        move[0],
                        move[1]
                    )
                ){

                    result.push({

                        fromRow:
                            row,

                        fromCol:
                            col,

                        toRow:
                            move[0],

                        toCol:
                            move[1]

                    });

                }

            }

        }

    }


    return result;

}


// ==========================================
// FIND MOVE
// ==========================================

function findMove(
    moves,
    fromRow,
    fromCol,
    toRow,
    toCol
){

    return moves.find(
        function(move){

            return (

                move.fromRow === fromRow &&
                move.fromCol === fromCol &&
                move.toRow === toRow &&
                move.toCol === toCol

            );

        }
    ) || null;

}


// ==========================================
// OUVERTURES
// ==========================================

function getOpeningMove(){

    // --------------------------------------
    // Avant 11 ans :
    // pas d'ouverture forcée
    // --------------------------------------

    if(
        farisAge < 11
    ){

        return null;

    }


    if(
        typeof pieces === "undefined"
    ){

        return null;

    }


    const legalMoves =
        getLegalMovesForColor(
            farisColor
        );


    if(
        legalMoves.length === 0
    ){

        return null;

    }


    // ======================================
    // FARIS BLANC
    // ======================================

    if(
        farisColor === "white"
    ){

        // ----------------------------------
        // 1. e4
        // ----------------------------------

        if(
            isInitialPosition()
        ){

            const e4 =
                findMove(
                    legalMoves,
                    6,
                    4,
                    4,
                    4
                );


            if(e4){

                console.log(
                    "📖 FARIS OPENING → e4"
                );

                return e4;

            }

        }


        // ----------------------------------
        // Nf3 après e4
        // ----------------------------------

        if(
            pieces[4][4] === "♙"
        ){

            const nf3 =
                findMove(
                    legalMoves,
                    7,
                    6,
                    5,
                    5
                );


            if(nf3){

                console.log(
                    "📖 FARIS OPENING → Nf3"
                );

                return nf3;

            }

        }

    }


    // ======================================
    // FARIS NOIR
    // ======================================

    if(
        farisColor === "black"
    ){

        // ----------------------------------
        // Après 1.e4 → c5
        // ----------------------------------

        if(
            pieces[4][4] === "♙" &&
            pieces[6][4] === "" &&
            pieces[6][2] === "♟"
        ){

            const c5 =
                findMove(
                    legalMoves,
                    1,
                    2,
                    3,
                    2
                );


            if(c5){

                console.log(
                    "📖 FARIS OPENING → Sicilienne ...c5"
                );

                return c5;

            }

        }


        // ----------------------------------
        // Après 1.d4 d5 2.c4 → dxc4
        // ----------------------------------

        if(
            pieces[3][3] === "♙" &&
            pieces[3][2] === "♙" &&
            pieces[4][3] === "♟"
        ){

            const dxc4 =
                findMove(
                    legalMoves,
                    3,
                    3,
                    4,
                    2
                );


            if(dxc4){

                console.log(
                    "📖 FARIS OPENING → ...dxc4"
                );

                return dxc4;

            }

        }

    }


    return null;

}


// ==========================================
// COUP DE SECOURS
// ==========================================

function chooseFallbackMove(){

    const moves =
        getLegalMovesForColor(
            farisColor
        );


    if(
        moves.length === 0
    ){

        return null;

    }


    // --------------------------------------
    // Chercher une capture
    // --------------------------------------

    const captures =
        moves.filter(
            function(move){

                return (
                    pieces[
                        move.toRow
                    ][
                        move.toCol
                    ] !== ""
                );

            }
        );


    if(
        captures.length > 0
    ){

        captures.sort(
            function(a,b){

                const valueA =
                    farisPieceValues[
                        pieces[
                            a.toRow
                        ][
                            a.toCol
                        ]
                    ] || 0;


                const valueB =
                    farisPieceValues[
                        pieces[
                            b.toRow
                        ][
                            b.toCol
                        ]
                    ] || 0;


                return valueB - valueA;

            }
        );


        return captures[0];

    }


    // --------------------------------------
    // Sinon premier coup légal
    // --------------------------------------

    return moves[0];

}


// ==========================================
// EXÉCUTER LE COUP DE FARIS
// ==========================================

function executeAIMove(move){

    if(
        !move
    ){

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    if(
        typeof pieces === "undefined"
    ){

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    if(gameOver){

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    if(
        currentPlayer !== farisColor
    ){

        console.warn(
            "⚠️ FARIS : ce n'est plus mon tour."
        );

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    const movingPiece =
        pieces[
            move.fromRow
        ][
            move.fromCol
        ];


    if(
        !isFarisPieceOfColor(
            movingPiece,
            farisColor
        )
    ){

        console.error(
            "❌ FARIS : mauvaise couleur de pièce."
        );

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    // ======================================
    // VÉRIFIER LE COUP
    // ======================================

    if(
        typeof getPossibleMoves !== "function" ||
        typeof isMoveLegal !== "function"
    ){

        console.error(
            "❌ Fonctions de board.js absentes."
        );

        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    const possible =
        getPossibleMoves(
            move.fromRow,
            move.fromCol
        );


    const legal =
        Array.isArray(possible) &&
        possible.some(
            function(candidate){

                return (

                    candidate[0] === move.toRow &&
                    candidate[1] === move.toCol &&

                    isMoveLegal(
                        move.fromRow,
                        move.fromCol,
                        move.toRow,
                        move.toCol
                    )

                );

            }
        );


    if(!legal){

        console.error(
            "❌ FARIS : COUP ILLÉGAL",
            move
        );


        farisThinking =
            false;

        window.farisThinking =
            false;

        return;

    }


    // ======================================
    // HISTORIQUE
    // ======================================

    if(
        typeof moveHistory !== "undefined" &&
        typeof saveGameState === "function"
    ){

        moveHistory.push(
            saveGameState()
        );

    }


    // ======================================
    // CAPTURE
    // ======================================

    const capturedPiece =
        pieces[
            move.toRow
        ][
            move.toCol
        ];


    const captured =
        capturedPiece !== "";


    // ======================================
    // NOTATION
    // ======================================

    let notation =
        boardToSquare(
            move.toRow,
            move.toCol
        );


    if(
        typeof getMoveNotation === "function"
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


    // ======================================
    // ROQUE BLANC
    // ======================================

    if(
        movingPiece === "♔" &&
        move.fromRow === 7 &&
        move.fromCol === 4 &&
        move.toRow === 7 &&
        move.toCol === 6
    ){

        pieces[7][5] =
            pieces[7][7];

        pieces[7][7] =
            "";

        notation =
            "O-O";

    }


    if(
        movingPiece === "♔" &&
        move.fromRow === 7 &&
        move.fromCol === 4 &&
        move.toRow === 7 &&
        move.toCol === 2
    ){

        pieces[7][3] =
            pieces[7][0];

        pieces[7][0] =
            "";

        notation =
            "O-O-O";

    }


    // ======================================
    // ROQUE NOIR
    // ======================================

    if(
        movingPiece === "♚" &&
        move.fromRow === 0 &&
        move.fromCol === 4 &&
        move.toRow === 0 &&
        move.toCol === 6
    ){

        pieces[0][5] =
            pieces[0][7];

        pieces[0][7] =
            "";

        notation =
            "O-O";

    }


    if(
        movingPiece === "♚" &&
        move.fromRow === 0 &&
        move.fromCol === 4 &&
        move.toRow === 0 &&
        move.toCol === 2
    ){

        pieces[0][3] =
            pieces[0][0];

        pieces[0][0] =
            "";

        notation =
            "O-O-O";

    }


    // ======================================
    // EN PASSANT BLANC
    // ======================================

    if(
        movingPiece === "♙" &&
        move.fromRow === 3 &&
        move.toRow === 2 &&
        Math.abs(
            move.toCol -
            move.fromCol
        ) === 1 &&
        pieces[
            move.toRow
        ][
            move.toCol
        ] === ""
    ){

        pieces[3][move.toCol] =
            "";

    }


    // ======================================
    // EN PASSANT NOIR
    // ======================================

    if(
        movingPiece === "♟" &&
        move.fromRow === 4 &&
        move.toRow === 5 &&
        Math.abs(
            move.toCol -
            move.fromCol
        ) === 1 &&
        pieces[
            move.toRow
        ][
            move.toCol
        ] === ""
    ){

        pieces[4][move.toCol] =
            "";

    }


    // ======================================
    // DÉPLACEMENT
    // ======================================

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


    // ======================================
    // PROMOTION
    // ======================================

    if(
        movingPiece === "♙" &&
        move.toRow === 0
    ){

        pieces[0][move.toCol] =
            move.promotion === "r"
                ? "♖"
                : move.promotion === "b"
                    ? "♗"
                    : move.promotion === "n"
                        ? "♘"
                        : "♕";

    }


    if(
        movingPiece === "♟" &&
        move.toRow === 7
    ){

        pieces[7][move.toCol] =
            move.promotion === "r"
                ? "♜"
                : move.promotion === "b"
                    ? "♝"
                    : move.promotion === "n"
                        ? "♞"
                        : "♛";

    }


    // ======================================
    // DERNIER COUP
    // ======================================

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


    // ======================================
    // ROIS
    // ======================================

    if(
        movingPiece === "♔"
    ){

        whiteKingMoved =
            true;

    }


    if(
        movingPiece === "♚"
    ){

        blackKingMoved =
            true;

    }


    // ======================================
    // TOURS BLANCHES
    // ======================================

    if(
        movingPiece === "♖"
    ){

        if(
            move.fromRow === 7 &&
            move.fromCol === 0
        ){

            whiteRookLeftMoved =
                true;

        }


        if(
            move.fromRow === 7 &&
            move.fromCol === 7
        ){

            whiteRookRightMoved =
                true;

        }

    }


    // ======================================
    // TOURS NOIRES
    // ======================================

    if(
        movingPiece === "♜"
    ){

        if(
            move.fromRow === 0 &&
            move.fromCol === 0
        ){

            blackRookLeftMoved =
                true;

        }


        if(
            move.fromRow === 0 &&
            move.fromCol === 7
        ){

            blackRookRightMoved =
                true;

        }

    }


    // ======================================
    // LISTE DES COUPS
    // ======================================

    if(
        typeof addMoveToList === "function"
    ){

        addMoveToList(
            notation,
            farisColor
        );

    }


    // ======================================
    // INCRÉMENT
    // ======================================

    if(
        typeof addIncrement === "function"
    ){

        addIncrement(
            farisColor
        );

    }


    // ======================================
    // HORLOGE
    // ======================================

    if(
        typeof clockStarted !== "undefined" &&
        !clockStarted
    ){

        clockStarted =
            true;


        if(
            typeof startClock === "function"
        ){

            startClock();

        }

    }


    // ======================================
    // CHANGER DE JOUEUR
    // ======================================

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";


    // ======================================
    // RESET SÉLECTION
    // ======================================

    selectedRow =
        null;

    selectedCol =
        null;

    possibleMoves =
        [];


    if(
        typeof clearArrows === "function"
    ){

        clearArrows();

    }


    // ======================================
    // REDESSIN
    // ======================================

    if(
        typeof drawBoard === "function"
    ){

        drawBoard();

    }


    if(
        typeof updateGameStatus === "function"
    ){

        updateGameStatus();

    }


    // ======================================
    // FIN
    // ======================================

    farisThinking =
        false;

    window.farisThinking =
        false;


    console.log(
        "=========================================="
    );

    console.log(
        "🤖 FARIS A JOUÉ"
    );

    console.log(
        "♟️",
        boardToSquare(
            move.fromRow,
            move.fromCol
        ),
        "→",
        boardToSquare(
            move.toRow,
            move.toCol
        )
    );

    console.log(
        "🎯 PROCHAIN TOUR:",
        currentPlayer
    );

    console.log(
        "=========================================="

    );

}


// ==========================================
// DEMANDER BESTMOVE
// ==========================================

function askStockfish(
    engine,
    fen,
    moveTime
){

    return new Promise(
        function(resolve,reject){

            let finished =
                false;


            let timeout =
                null;


            // ----------------------------------
            // MESSAGE
            // ----------------------------------

            function onMessage(event){

                const message =
                    typeof event === "string"
                        ? event
                        : event.data;


                if(!message){

                    return;

                }


                const text =
                    String(
                        message
                    ).trim();


                if(
                    !text.startsWith(
                        "bestmove"
                    )
                ){

                    return;

                }


                if(finished){

                    return;

                }


                const parts =
                    text.split(
                        /\s+/
                    );


                const bestmove =
                    parts[1];


                if(
                    !bestmove ||
                    bestmove === "(none)"
                ){

                    finished =
                        true;


                    cleanup();


                    reject(
                        new Error(
                            "Stockfish n'a trouvé aucun coup."
                        )
                    );


                    return;

                }


                finished =
                    true;


                cleanup();


                resolve(
                    bestmove
                );

            }


            // ----------------------------------
            // ERREUR
            // ----------------------------------

            function onError(error){

                if(finished){

                    return;

                }


                finished =
                    true;


                cleanup();


                reject(
                    error
                );

            }


            // ----------------------------------
            // CLEANUP
            // ----------------------------------

            function cleanup(){

                if(timeout){

                    clearTimeout(
                        timeout
                    );

                }


                if(
                    typeof engine.removeEventListener ===
                    "function"
                ){

                    engine.removeEventListener(
                        "message",
                        onMessage
                    );


                    engine.removeEventListener(
                        "error",
                        onError
                    );

                }

            }


            // ----------------------------------
            // ÉCOUTER
            // ----------------------------------

            if(
                typeof engine.addEventListener ===
                "function"
            ){

                engine.addEventListener(
                    "message",
                    onMessage
                );


                engine.addEventListener(
                    "error",
                    onError
                );

            }
            else{

                // --------------------------------
                // Compatibilité Worker classique
                // --------------------------------

                const oldHandler =
                    engine.onmessage;


                engine.onmessage =
                    function(event){

                        onMessage(event);


                        if(
                            oldHandler
                        ){

                            try{

                                oldHandler(
                                    event
                                );

                            }
                            catch(error){

                                console.warn(
                                    error
                                );

                            }

                        }

                    };

            }


            // ----------------------------------
            // TIMEOUT
            // ----------------------------------

            timeout =
                setTimeout(
                    function(){

                        if(finished){

                            return;

                        }


                        finished =
                            true;


                        cleanup();


                        reject(
                            new Error(
                                "Stockfish timeout."
                            )
                        );

                    },
                    Math.max(
                        moveTime + 5000,
                        7000
                    )
                );


            // ----------------------------------
            // POSITION
            // ----------------------------------

            try{

                engine.postMessage(
                    "position fen " +
                    fen
                );


                engine.postMessage(
                    "go movetime " +
                    moveTime
                );

            }
            catch(error){

                if(!finished){

                    finished =
                        true;


                    cleanup();


                    reject(
                        error
                    );

                }

            }

        }
    );

}


// ==========================================
// FARIS PLAY
// ==========================================

async function farisPlay(){

    // --------------------------------------
    // VÉRIFICATIONS
    // --------------------------------------

    if(gameOver){

        return;

    }


    if(
        typeof currentPlayer === "undefined"
    ){

        console.error(
            "❌ currentPlayer n'existe pas."
        );

        return;

    }


    if(
        currentPlayer !== farisColor
    ){

        console.log(
            "🤖 FARIS : ce n'est pas mon tour."
        );

        return;

    }


    if(farisThinking){

        return;

    }


    // --------------------------------------
    // COMMENCER À RÉFLÉCHIR
    // --------------------------------------

    farisThinking =
        true;

    window.farisThinking =
        true;


    const token =
        ++farisMoveToken;


    window.farisMoveToken =
        farisMoveToken;


    console.log(
        "=========================================="
    );

    console.log(
        "🤖 FARIS RÉFLÉCHIT..."
    );

    console.log(
        "👤 ÂGE:",
        farisAge
    );

    console.log(
        "🎯 ELO:",
        farisLevel.elo
    );

    console.log(
        "🎨 COULEUR:",
        farisColor
    );

    console.log(
        "=========================================="
    );


    try{

        // ==================================
        // OUVERTURE
        // ==================================

        const openingMove =
            getOpeningMove();


        if(openingMove){

            console.log(
                "📖 COUP D'OUVERTURE"
            );


            await new Promise(
                function(resolve){

                    setTimeout(
                        resolve,
                        Math.min(
                            350,
                            farisLevel.searchTime
                        )
                    );

                }
            );


            if(
                token !== farisMoveToken ||
                gameOver ||
                currentPlayer !== farisColor
            ){

                farisThinking =
                    false;

                window.farisThinking =
                    false;

                return;

            }


            executeAIMove(
                openingMove
            );


            return;

        }


        // ==================================
        // STOCKFISH
        // ==================================

        const engine =
            await waitForFarisEngine();


        if(!engine){

            throw new Error(
                "Stockfish n'est pas disponible."
            );

        }


        if(
            token !== farisMoveToken ||
            gameOver ||
            currentPlayer !== farisColor
        ){

            farisThinking =
                false;

            window.farisThinking =
                false;

            return;

        }


        const fen =
            getFarisFEN();


        if(!fen){

            throw new Error(
                "FEN impossible à créer."
            );

        }


        console.log(
            "🧠 POSITION:",
            fen
        );


        // ==================================
        // CONFIGURATION
        // ==================================

        engine.postMessage(
            "stop"
        );


        engine.postMessage(
            "ucinewgame"
        );


        engine.postMessage(
            "setoption name UCI_LimitStrength value true"
        );


        engine.postMessage(
            "setoption name UCI_Elo value " +
            farisLevel.elo
        );


        engine.postMessage(
            "isready"
        );


        // ==================================
        // PETIT DÉLAI
        // ==================================

        await new Promise(
            function(resolve){

                setTimeout(
                    resolve,
                    50
                );

            }
        );


        // ==================================
        // BESTMOVE
        // ==================================

        const bestmove =
            await askStockfish(
                engine,
                fen,
                farisLevel.searchTime
            );


        if(
            token !== farisMoveToken ||
            gameOver ||
            currentPlayer !== farisColor
        ){

            farisThinking =
                false;

            window.farisThinking =
                false;

            return;

        }


        console.log(
            "♟️ STOCKFISH BESTMOVE:",
            bestmove
        );


        const move =
            uciToBoardMove(
                bestmove
            );


        if(!move){

            throw new Error(
                "Coup Stockfish invalide."
            );

        }


        // ==================================
        // VÉRIFIER LA PIÈCE
        // ==================================

        const piece =
            pieces[
                move.fromRow
            ][
                move.fromCol
            ];


        if(
            !isFarisPieceOfColor(
                piece,
                farisColor
            )
        ){

            throw new Error(
                "La pièce proposée n'appartient pas à Faris."
            );

        }


        // ==================================
        // JOUER
        // ==================================

        executeAIMove(
            move
        );

    }
    catch(error){

        console.error(
            "🔥 ERREUR FARIS:",
            error
        );


        // ==================================
        // COUP DE SECOURS
        // ==================================

        if(
            !gameOver &&
            currentPlayer === farisColor
        ){

            console.log(
                "🛟 FARIS → COUP DE SECOURS"
            );


            const fallback =
                chooseFallbackMove();


            if(fallback){

                executeAIMove(
                    fallback
                );

            }
            else{

                farisThinking =
                    false;

                window.farisThinking =
                    false;

            }

        }
        else{

            farisThinking =
                false;

            window.farisThinking =
                false;

        }

    }

}


window.farisPlay =
    farisPlay;


// ==========================================
// RESET
// ==========================================

function resetFarisAI(){

    farisThinking =
        false;


    window.farisThinking =
        false;


    farisMoveToken++;


    window.farisMoveToken =
        farisMoveToken;


    if(farisEngine){

        try{

            farisEngine.postMessage(
                "stop"
            );

        }
        catch(error){

            console.warn(
                "⚠️ Impossible d'arrêter Stockfish."
            );

        }

    }


    console.log(
        "🔄 FARIS AI RESET"
    );

}


window.resetFarisAI =
    resetFarisAI;


// ==========================================
// DÉMARRAGE
// ==========================================

console.log(
    "=========================================="
);

console.log(
    "♟️ FARIS AI READY"
);

console.log(
    "Age:",
    farisAge
);

console.log(
    "Faris:",
    farisColor
);

console.log(
    "Human:",
    humanColor
);

console.log(
    "ELO:",
    farisLevel.elo
);

console.log(
    "Search:",
    farisLevel.searchTime,
    "ms"
);

console.log(
    "=========================================="
);


// ==========================================
// PRÉPARER STOCKFISH
// ==========================================

setTimeout(
    async function(){

        const engine =
            await initializeFarisEngine();


        if(engine){

            console.log(
                "✅ FARIS AI : STOCKFISH CONNECTÉ"
            );

        }
        else{

            console.warn(
                "⚠️ FARIS AI : Stockfish sera recherché au moment du coup."
            );

        }

    },
    300
);


// ==========================================
// SI FARIS EST BLANC
// ==========================================

function startFarisIfNeeded(){

    if(
        farisColor !== "white"
    ){

        return;

    }


    if(
        typeof currentPlayer === "undefined"
    ){

        setTimeout(
            startFarisIfNeeded,
            300
        );

        return;

    }


    if(
        currentPlayer !== "white"
    ){

        return;

    }


    if(gameOver){

        return;

    }


    console.log(
        "🤖 FARIS EST BLANC → IL COMMENCE"
    );


    setTimeout(
        function(){

            if(
                !gameOver &&
                currentPlayer === "white"
            ){

                farisPlay();

            }

        },
        500
    );

}


// ==========================================
// LANCEMENT
// ==========================================

if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            setTimeout(
                startFarisIfNeeded,
                300
            );

        }
    );

}
else{

    setTimeout(
        startFarisIfNeeded,
        300
    );

}