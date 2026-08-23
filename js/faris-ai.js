// ==========================================
// CHESS_FK - FARIS AI
// VERSION PRO - BLANC / NOIR
// STOCKFISH 18
// OUVERTURES À PARTIR DE 11 ANS
// ==========================================

console.log("♟️ FARIS AI STARTING...");


// ==========================================
// PARAMÈTRES URL
// ==========================================

const farisParams =
    new URLSearchParams(window.location.search);


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
// COULEUR
// ==========================================
//
// ?color=white
// Faris = blanc
//
// ?color=black
// Faris = noir
//
// Par défaut Faris = noir
//

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
    "🤖 Faris couleur:",
    farisColor
);


console.log(
    "👤 Joueur couleur:",
    humanColor
);


// ==========================================
// NIVEAUX
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
// ÉTAT
// ==========================================

let farisThinking =
    false;


let farisMoveToken = 0;


// ==========================================
// VALEURS PIÈCES
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
// UTILITAIRES
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
// BOARD → COORDONNÉES
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
// POSITION FEN
// ==========================================

function getFarisFEN(){

    if(
        typeof pieces === "undefined"
    ){

        return null;

    }


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
                piece === ""
            ){

                empty++;

            }

            else{

                if(empty > 0){

                    fen += empty;

                    empty = 0;

                }


                const map = {

                    "♙":"P",
                    "♘":"N",
                    "♗":"B",
                    "♖":"R",
                    "♕":"Q",
                    "♔":"K",

                    "♟":"p",
                    "♞":"n",
                    "♝":"b",
                    "♜":"r",
                    "♛":"q",
                    "♚":"k"

                };


                fen +=
                    map[piece] || "1";

            }

        }


        if(empty > 0){

            fen += empty;

        }


        if(row < 7){

            fen += "/";

        }

    }


    // ======================================
    // TOUR DE JEU
    // ======================================

    fen +=
        " " +
        (
            currentPlayer === "white"
                ? "w"
                : "b"
        );


    // ======================================
    // ROQUE
    // ======================================

    let castling = "";


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

        castling = "-";

    }


    fen +=
        " " +
        castling;


    // ======================================
    // EN PASSANT
    // ======================================

    let enPassant = "-";


    if(
        typeof lastMove !== "undefined" &&
        lastMove
    ){

        if(
            lastMove.piece === "♙" &&
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


        if(
            lastMove.piece === "♟" &&
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


    // ======================================
    // HALF MOVE
    // ======================================

    fen +=
        " 0";


    // ======================================
    // FULL MOVE
    // ======================================

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
// POSITION SIMPLE
// ==========================================

function getPositionSignature(){

    if(
        typeof pieces === "undefined"
    ){

        return "";

    }


    return pieces
        .map(
            row => row.join("")
        )
        .join("/");

}


// ==========================================
// COMPTER LES COUPS
// ==========================================

function getLegalMovesForColor(
    color
){

    const result = [];


    if(
        typeof pieces === "undefined" ||
        typeof getPossibleMoves !== "function" ||
        typeof isMoveLegal !== "function"
    ){

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


            const moves =
                getPossibleMoves(
                    row,
                    col
                );


            for(
                const move of moves
            ){

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
// OUVERTURES
// ==========================================
//
// À partir de 11 ans.
//
// BLANC :
// 1.e4
// puis Nf3
//
// NOIR contre e4 :
// Sicilienne : ...c5
//
// NOIR contre d4 c4 :
// Gambit Dame Accepté : ...dxc4
//

function getOpeningMove(){

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

        // -------------------------------
        // PREMIER COUP : e4
        // -------------------------------

        const whiteFirstMove =
            findMove(
                legalMoves,
                6,
                4,
                4,
                4
            );


        if(
            whiteFirstMove &&
            isInitialPosition()
        ){

            console.log(
                "📖 FARIS OPENING → 1.e4"
            );

            return whiteFirstMove;

        }


        // -------------------------------
        // DEUXIÈME COUP : Nf3
        // -------------------------------

        const moveCount =
            typeof moveHistory !== "undefined"
                ? moveHistory.length
                : 0;


        if(moveCount >= 1){

            const knightMove =
                findMove(
                    legalMoves,
                    7,
                    6,
                    5,
                    5
                );


            if(
                knightMove &&
                pieces[4][4] === "♙"
            ){

                console.log(
                    "📖 FARIS OPENING → Nf3"
                );

                return knightMove;

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
        // SICILIENNE
        // Après 1.e4
        // ----------------------------------

        if(
            pieces[4][4] === "♙" &&
            pieces[6][4] === "" &&
            pieces[6][3] === "♙"
        ){

            const sicilian =
                findMove(
                    legalMoves,
                    6,
                    2,
                    4,
                    2
                );


            if(sicilian){

                console.log(
                    "📖 FARIS OPENING → SICILIENNE ...c5"
                );

                return sicilian;

            }

        }


        // ----------------------------------
        // SICILIENNE SIMPLE
        // Après 1.e4
        // ----------------------------------

        if(
            pieces[4][4] === "♙" &&
            pieces[6][4] === "♙" &&
            pieces[6][3] === ""
        ){

            const sicilian =
                findMove(
                    legalMoves,
                    1,
                    2,
                    3,
                    2
                );


            if(sicilian){

                console.log(
                    "📖 FARIS OPENING → SICILIENNE ...c5"
                );

                return sicilian;

            }

        }


        // ----------------------------------
        // GAMBIT DAME ACCEPTÉ
        //
        // 1.d4 d5
        // 2.c4
        // ...dxc4
        // ----------------------------------

        if(
            pieces[3][3] === "♙" &&
            pieces[3][2] === "♙" &&
            pieces[4][3] === "♟"
        ){

            const d4c4 =
                findMove(
                    legalMoves,
                    3,
                    3,
                    4,
                    2
                );


            if(d4c4){

                console.log(
                    "📖 FARIS OPENING → GAMBIT DAME ACCEPTÉ ...dxc4"
                );

                return d4c4;

            }

        }

    }


    return null;

}


// ==========================================
// TROUVER COUP
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
// ÉVALUATION
// ==========================================

function evaluateBoard(){

    if(
        typeof pieces === "undefined"
    ){

        return 0;

    }


    let score = 0;


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


            if(!piece){

                continue;

            }


            const value =
                farisPieceValues[piece] ||
                0;


            if(
                isFarisWhitePiece(piece)
            ){

                score += value;

            }

            else{

                score -= value;

            }

        }

    }


    return (
        farisColor === "white"
            ? score
            : -score
    );

}


// ==========================================
// CHOISIR COUP DE SECOURS
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


    // ======================================
    // CAPTURE LA PLUS FORTE
    // ======================================

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
                        pieces[a.toRow][a.toCol]
                    ] || 0;


                const valueB =
                    farisPieceValues[
                        pieces[b.toRow][b.toCol]
                    ] || 0;


                return valueB - valueA;

            }
        );


        return captures[0];

    }


    return moves[0];

}


// ==========================================
// EXÉCUTER COUP IA
// ==========================================

function executeAIMove(move){

    if(
        !move ||
        typeof pieces === "undefined"
    ){

        farisThinking = false;

        return;

    }


    if(
        gameOver
    ){

        farisThinking = false;

        return;

    }


    if(
        currentPlayer !== farisColor
    ){

        farisThinking = false;

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
            "❌ FARIS : mauvaise couleur"
        );

        farisThinking = false;

        return;

    }


    // ======================================
    // VÉRIFICATION
    // ======================================

    if(
        typeof getPossibleMoves !== "function" ||
        typeof isMoveLegal !== "function"
    ){

        console.error(
            "❌ Fonctions board.js absentes."
        );

        farisThinking = false;

        return;

    }


    const possible =
        getPossibleMoves(
            move.fromRow,
            move.fromCol
        );


    const legal =
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
            "❌ FARIS COUP ILLÉGAL:",
            move
        );

        farisThinking = false;

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


    const captured =
        pieces[
            move.toRow
        ][
            move.toCol
        ] !== "";


    let notation =
        typeof getMoveNotation === "function"
            ? getMoveNotation(
                movingPiece,
                move.fromRow,
                move.fromCol,
                move.toRow,
                move.toCol,
                captured
            )
            : boardToSquare(
                move.toRow,
                move.toCol
            );


    // ======================================
    // ROQUE
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
    // EN PASSANT
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
            "♕";

    }


    if(
        movingPiece === "♟" &&
        move.toRow === 7
    ){

        pieces[7][move.toCol] =
            "♛";

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

        whiteKingMoved = true;

    }


    if(
        movingPiece === "♚"
    ){

        blackKingMoved = true;

    }


    // ======================================
    // TOURS
    // ======================================

    if(
        movingPiece === "♖" &&
        move.fromRow === 7 &&
        move.fromCol === 0
    ){

        whiteRookLeftMoved = true;

    }


    if(
        movingPiece === "♖" &&
        move.fromRow === 7 &&
        move.fromCol === 7
    ){

        whiteRookRightMoved = true;

    }


    if(
        movingPiece === "♜" &&
        move.fromRow === 0 &&
        move.fromCol === 0
    ){

        blackRookLeftMoved = true;

    }


    if(
        movingPiece === "♜" &&
        move.fromRow === 0 &&
        move.fromCol === 7
    ){

        blackRookRightMoved = true;

    }


    // ======================================
    // NOTATION
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

        clockStarted = true;

        if(
            typeof startClock === "function"
        ){

            startClock();

        }

    }


    // ======================================
    // CHANGER JOUEUR
    // ======================================

    currentPlayer =
        farisColor === "white"
            ? "black"
            : "white";


    // ======================================
    // RESET SÉLECTION
    // ======================================

    selectedRow = null;

    selectedCol = null;

    possibleMoves = [];


    if(
        typeof clearArrows === "function"
    ){

        clearArrows();

    }


    // ======================================
    // AFFICHAGE
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


    farisThinking = false;


    console.log(
        "🤖 FARIS A JOUÉ:",
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

}


// ==========================================
// STOCKFISH
// ==========================================

async function getStockfish(){

    if(
        typeof createStockfish !== "function"
    ){

        throw new Error(
            "createStockfish() est absent. Vérifie stockfish-loader.js."
        );

    }


    return await createStockfish();

}


// ==========================================
// DEMANDER BESTMOVE À STOCKFISH
// ==========================================

function askStockfish(
    engine,
    fen,
    moveTime
){

    return new Promise(
        function(resolve,reject){

            let finished = false;


            const timeout =
                setTimeout(
                    function(){

                        if(finished){

                            return;

                        }


                        finished = true;


                        cleanup();


                        reject(
                            new Error(
                                "Stockfish timeout"
                            )
                        );

                    },
                    Math.max(
                        moveTime + 5000,
                        7000
                    )
                );


            function cleanup(){

                clearTimeout(
                    timeout
                );


                engine.removeEventListener(
                    "message",
                    onMessage
                );


                engine.removeEventListener(
                    "error",
                    onError
                );

            }


            function onMessage(event){

                const message =
                    String(
                        event.data || ""
                    ).trim();


                if(
                    !message.startsWith(
                        "bestmove"
                    )
                ){

                    return;

                }


                if(finished){

                    return;

                }


                const parts =
                    message.split(
                        /\s+/
                    );


                const bestmove =
                    parts[1];


                if(
                    !bestmove ||
                    bestmove === "(none)"
                ){

                    finished = true;

                    cleanup();


                    reject(
                        new Error(
                            "Stockfish n'a trouvé aucun coup."
                        )
                    );

                    return;

                }


                finished = true;

                cleanup();


                resolve(
                    bestmove
                );

            }


            function onError(error){

                if(finished){

                    return;

                }


                finished = true;

                cleanup();


                reject(error);

            }


            engine.addEventListener(
                "message",
                onMessage
            );


            engine.addEventListener(
                "error",
                onError
            );


            engine.postMessage(
                "position fen " +
                fen
            );


            engine.postMessage(
                "go movetime " +
                moveTime
            );

        }
    );

}


// ==========================================
// FARIS PLAY
// ==========================================

async function farisPlay(){

    // ======================================
    // PAS SON TOUR
    // ======================================

    if(
        typeof currentPlayer === "undefined" ||
        currentPlayer !== farisColor
    ){

        console.log(
            "🤖 FARIS : ce n'est pas mon tour."
        );

        return;

    }


    if(gameOver){

        return;

    }


    if(farisThinking){

        return;

    }


    farisThinking = true;


    const token =
        ++farisMoveToken;


    console.log(
        "🤖 FARIS RÉFLÉCHIT...",
        farisAge,
        "ans",
        "|",
        farisColor
    );


    try{

        // ==================================
        // OUVERTURE
        // ==================================

        const openingMove =
            getOpeningMove();


        if(
            openingMove
        ){

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        Math.min(
                            350,
                            farisLevel.searchTime
                        )
                    )
            );


            if(
                token !== farisMoveToken ||
                gameOver ||
                currentPlayer !== farisColor
            ){

                farisThinking = false;

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
            await getStockfish();


        if(
            token !== farisMoveToken ||
            gameOver ||
            currentPlayer !== farisColor
        ){

            farisThinking = false;

            return;

        }


        const fen =
            getFarisFEN();


        if(!fen){

            throw new Error(
                "Impossible de construire le FEN."
            );

        }


        console.log(
            "🧠 FARIS → STOCKFISH",
            fen
        );


        // ==================================
        // NIVEAU ELO
        // ==================================

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


        // ==================================
        // STOCKFISH
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

            farisThinking = false;

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
                "Coup UCI invalide."
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
                "Stockfish a donné une pièce qui n'appartient pas à Faris."
            );

        }


        // ==================================
        // EXÉCUTER
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
                "🛟 FARIS utilise un coup de secours..."
            );


            const fallback =
                chooseFallbackMove();


            if(fallback){

                executeAIMove(
                    fallback
                );

            }
            else{

                farisThinking = false;

            }

        }
        else{

            farisThinking = false;

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


    farisMoveToken++;

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
// SI FARIS EST BLANC
// ==========================================
//
// C'EST LA PARTIE IMPORTANTE.
//
// Avant, board.js lançait Faris uniquement
// après un coup blanc.
//
// Maintenant, si Faris est blanc,
// il commence automatiquement.
//

function startFarisIfNeeded(){

    if(
        farisColor !== "white"
    ){

        return;

    }


    if(
        typeof currentPlayer === "undefined"
    ){

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


    setTimeout(
        function(){

            if(
                currentPlayer === "white" &&
                !gameOver
            ){

                farisPlay();

            }

        },
        400
    );

}


if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        startFarisIfNeeded
    );

}
else{

    startFarisIfNeeded();

}