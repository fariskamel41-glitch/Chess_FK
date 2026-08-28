// ======================================
// CHESS_FK CHESS ENGINE
// board.js
// VERSION PRO — FARIS BLANC / NOIR
// ======================================

console.log("♟️ CHESS_FK BOARD STARTING...");


// ======================================
// PARAMÈTRES DE LA PARTIE
// ======================================

const chessParams =
    new URLSearchParams(
        window.location.search
    );

const chessMode =
    chessParams.get("mode") || "ai";

const onlineMode =
    chessMode === "online";

const onlineGameId =
    chessParams.get("game");

let onlineMatch =
    null;

try{

    onlineMatch =
        JSON.parse(
            localStorage.getItem(
                "chess_fk_match"
            )
        );

}catch(error){

    onlineMatch = null;

}

let onlineMyColor =
    onlineMatch &&
    onlineMatch.you &&
    onlineMatch.you.color
        ? onlineMatch.you.color
        : "white";

let onlineSupabase =
    null;

let onlineChannel =
    null;

let onlineLastMoveId =
    null;

let onlineWaiting =
    false;


// ======================================
// CONFIGURATION
// ======================================

const boardElement =
    document.getElementById("board");

const movesElement =
    document.getElementById("moves");

const turnElement =
    document.querySelector(".turn");

const gameResultElement =
    document.getElementById("gameResult");

const boardSizeLabel =
    document.getElementById(
        "boardSizeLabel"
    );

let squareSize =
    60;


// ======================================
// PIÈCES
// ======================================

let pieces = [

    ["♜","♞","♝","♛","♚","♝","♞","♜"],

    ["♟","♟","♟","♟","♟","♟","♟","♟"],

    ["","","","","","","",""],

    ["","","","","","","",""],

    ["","","","","","","",""],

    ["","","","","","","",""],

    ["♙","♙","♙","♙","♙","♙","♙","♙"],

    ["♖","♘","♗","♕","♔","♗","♘","♖"]

];


// ======================================
// ÉTAT DU JEU
// ======================================

let currentPlayer =
    "white";

let selectedRow =
    null;

let selectedCol =
    null;

let possibleMoves =
    [];

let gameOver =
    false;

let moveHistory =
    [];

let lastMove =
    null;

let enPassantTarget =
    null;


// ======================================
// ROQUE
// ======================================

let whiteKingMoved =
    false;

let blackKingMoved =
    false;

let whiteLeftRookMoved =
    false;

let whiteRightRookMoved =
    false;

let blackLeftRookMoved =
    false;

let blackRightRookMoved =
    false;


// ======================================
// PROMOTION
// ======================================

let promotionInProgress =
    false;


// ======================================
// TEMPS
// ======================================

let whiteTime =
    10 * 60;

let blackTime =
    10 * 60;

let gameTimer =
    null;


// ======================================
// CAPTURE INITIALE
// ======================================

let whiteCaptured =
    [];

let blackCaptured =
    [];


// ======================================
// FONCTIONS COULEUR
// ======================================

function isWhitePiece(piece){

    return [
        "♙",
        "♖",
        "♘",
        "♗",
        "♕",
        "♔"
    ].includes(piece);

}


function isBlackPiece(piece){

    return [
        "♟",
        "♜",
        "♞",
        "♝",
        "♛",
        "♚"
    ].includes(piece);

}


function getPieceColor(piece){

    if(
        isWhitePiece(piece)
    ){

        return "white";

    }

    if(
        isBlackPiece(piece)
    ){

        return "black";

    }

    return null;

}


// ======================================
// MODE ONLINE
// ======================================

function isOnlineGame(){

    return (
        onlineMode &&
        !!onlineGameId
    );

}


function getOnlinePlayerColor(){

    return onlineMyColor;

}


function canHumanMove(){

    if(
        !isOnlineGame()
    ){

        return true;

    }

    return (
        currentPlayer ===
        getOnlinePlayerColor()
    );

}


// ======================================
// SUPABASE
// ======================================

function getOnlineSupabase(){

    if(
        window.chessfkSupabase
    ){

        return window.chessfkSupabase;

    }

    if(
        window.supabaseClient
    ){

        return window.supabaseClient;

    }

    return null;

}


// ======================================
// CRÉER LA TABLE DE COUPS
// ======================================
// Le code attend une table Supabase :
//
// online_moves
//
// colonnes :
// id
// game_id
// player_id
// move_data
// created_at
//
// ======================================


// ======================================
// INITIALISATION ONLINE
// ======================================

async function chessfkStartOnlineGame(){

    if(
        !isOnlineGame()
    ){

        return;

    }

    console.log(
        "🌐 ONLINE GAME MODE",
        onlineGameId
    );

    onlineSupabase =
        getOnlineSupabase();

    if(
        !onlineSupabase
    ){

        console.error(
            "❌ SUPABASE NOT READY"
        );

        return;

    }

    await chessfkLoadOnlineGame();

    chessfkSubscribeOnlineMoves();

    updateTurn();

}


// ======================================
// CHARGER LA PARTIE
// ======================================

async function chessfkLoadOnlineGame(){

    if(
        !onlineSupabase ||
        !onlineGameId
    ){

        return;

    }

    try{

        const result =
            await onlineSupabase
                .from("online_games")
                .select("*")
                .eq(
                    "id",
                    onlineGameId
                )
                .single();

        if(
            result.error
        ){

            console.error(
                "❌ Impossible de charger la partie :",
                result.error
            );

            return;

        }

        const game =
            result.data;

        if(
            !game
        ){

            return;

        }

        let localId =
            null;

        try{

            localId =
                localStorage.getItem(
                    "chess_fk_user_id"
                );

        }catch(error){

        }

        if(
            localId &&
            game.white_player_id ===
            localId
        ){

            onlineMyColor =
                "white";

        }else if(
            localId &&
            game.black_player_id ===
            localId
        ){

            onlineMyColor =
                "black";

        }

        console.log(
            "♟️ ONLINE COLOR:",
            onlineMyColor
        );

        if(
            onlineMatch
        ){

            if(
                onlineMatch.you
            ){

                onlineMatch.you.color =
                    onlineMyColor;

            }

            localStorage.setItem(
                "chess_fk_match",
                JSON.stringify(
                    onlineMatch
                )
            );

        }


        // Charger les coups déjà joués

        const movesResult =
            await onlineSupabase
                .from("online_moves")
                .select("*")
                .eq(
                    "game_id",
                    onlineGameId
                )
                .order(
                    "created_at",
                    {
                        ascending:true
                    }
                );

        if(
            movesResult.error
        ){

            console.warn(
                "⚠️ Impossible de charger les anciens coups :",
                movesResult.error
            );

            return;

        }

        const moves =
            movesResult.data || [];

        if(
            moves.length > 0
        ){

            resetOnlineBoard();

            for(
                const moveRow of moves
            ){

                if(
                    !moveRow.move_data
                ){

                    continue;

                }

                const move =
                    typeof moveRow.move_data ===
                    "string"
                        ? JSON.parse(
                            moveRow.move_data
                        )
                        : moveRow.move_data;

                applyOnlineMove(
                    move,
                    true
                );

                onlineLastMoveId =
                    moveRow.id;

            }

        }

    }catch(error){

        console.error(
            "❌ Erreur online game :",
            error
        );

    }

}


// ======================================
// RESET ONLINE BOARD
// ======================================

function resetOnlineBoard(){

    pieces = [

        ["♜","♞","♝","♛","♚","♝","♞","♜"],

        ["♟","♟","♟","♟","♟","♟","♟","♟"],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["","","","","","","",""],

        ["♙","♙","♙","♙","♙","♙","♙","♙"],

        ["♖","♘","♗","♕","♔","♗","♘","♖"]

    ];

    currentPlayer =
        "white";

    selectedRow =
        null;

    selectedCol =
        null;

    possibleMoves =
        [];

    gameOver =
        false;

    moveHistory =
        [];

    lastMove =
        null;

    enPassantTarget =
        null;

    whiteKingMoved =
        false;

    blackKingMoved =
        false;

    whiteLeftRookMoved =
        false;

    whiteRightRookMoved =
        false;

    blackLeftRookMoved =
        false;

    blackRightRookMoved =
        false;

    whiteCaptured =
        [];

    blackCaptured =
        [];

}


// ======================================
// ÉCOUTER LES COUPS ONLINE
// ======================================

function chessfkSubscribeOnlineMoves(){

    if(
        !onlineSupabase ||
        !onlineGameId
    ){

        return;

    }

    if(
        onlineChannel
    ){

        onlineSupabase.removeChannel(
            onlineChannel
        );

    }

    onlineChannel =
        onlineSupabase
            .channel(
                "online-game-" +
                onlineGameId
            )
            .on(
                "postgres_changes",
                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "online_moves",

                    filter:
                        "game_id=eq." +
                        onlineGameId

                },

                payload => {

                    const row =
                        payload.new;

                    if(
                        !row
                    ){

                        return;

                    }

                    if(
                        row.id ===
                        onlineLastMoveId
                    ){

                        return;

                    }

                    let myId =
                        null;

                    try{

                        myId =
                            localStorage.getItem(
                                "chess_fk_user_id"
                            );

                    }catch(error){

                    }

                    if(
                        myId &&
                        row.player_id ===
                        myId
                    ){

                        onlineLastMoveId =
                            row.id;

                        return;

                    }

                    let move =
                        row.move_data;

                    try{

                        if(
                            typeof move ===
                            "string"
                        ){

                            move =
                                JSON.parse(
                                    move
                                );

                        }

                    }catch(error){

                        console.error(
                            "❌ Move parse error",
                            error
                        );

                        return;

                    }

                    onlineLastMoveId =
                        row.id;

                    console.log(
                        "📥 ADVERSAIRE JOUE :",
                        move
                    );

                    applyOnlineMove(
                        move,
                        false
                    );

                }

            )
            .subscribe(
                status => {

                    console.log(
                        "📡 ONLINE CHANNEL:",
                        status
                    );

                }
            );

}


// ======================================
// ENVOYER UN COUP
// ======================================

async function sendOnlineMove(move){

    if(
        !isOnlineGame() ||
        !onlineSupabase ||
        !onlineGameId
    ){

        return;

    }

    let playerId =
        null;

    try{

        playerId =
            localStorage.getItem(
                "chess_fk_user_id"
            );

    }catch(error){

    }

    const result =
        await onlineSupabase
            .from("online_moves")
            .insert({

                game_id:
                    onlineGameId,

                player_id:
                    playerId,

                move_data:
                    move

            })
            .select()
            .single();

    if(
        result.error
    ){

        console.error(
            "❌ Impossible d'envoyer le coup :",
            result.error
        );

        return;

    }

    onlineLastMoveId =
        result.data.id;

}


// ======================================
// APPLIQUER UN COUP ONLINE
// ======================================

function applyOnlineMove(
    move,
    fromHistory
){

    if(
        !move
    ){

        return;

    }

    const fromRow =
        move.fromRow;

    const fromCol =
        move.fromCol;

    const toRow =
        move.toRow;

    const toCol =
        move.toCol;

    if(
        typeof fromRow !== "number" ||
        typeof fromCol !== "number" ||
        typeof toRow !== "number" ||
        typeof toCol !== "number"
    ){

        return;

    }

    const piece =
        pieces[fromRow][fromCol];

    if(
        !piece
    ){

        return;

    }

    makeMove(
        fromRow,
        fromCol,
        toRow,
        toCol,
        {

            onlineMove:true,

            skipSend:true,

            fromHistory:
                fromHistory === true

        }
    );

}


// ======================================
// DESSINER L'ÉCHIQUIER
// ======================================

function drawBoard(){

    if(
        !boardElement
    ){

        return;

    }

    boardElement.innerHTML =
        "";

    boardElement.style.display =
        "grid";

    boardElement.style.gridTemplateColumns =
        `repeat(8, ${squareSize}px)`;

    boardElement.style.gridTemplateRows =
        `repeat(8, ${squareSize}px)`;


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

            const square =
                document.createElement(
                    "div"
                );

            square.className =
                "square";

            square.dataset.row =
                row;

            square.dataset.col =
                col;

            square.style.width =
                squareSize + "px";

            square.style.height =
                squareSize + "px";


            if(
                (row + col) % 2 === 0
            ){

                square.classList.add(
                    "light-square"
                );

            }else{

                square.classList.add(
                    "dark-square"
                );

            }


            const piece =
                pieces[row][col];

            if(
                piece
            ){

                const pieceElement =
                    document.createElement(
                        "span"
                    );

                pieceElement.className =
                    "piece";

                pieceElement.textContent =
                    piece;

                square.appendChild(
                    pieceElement
                );

            }


            if(
                selectedRow === row &&
                selectedCol === col
            ){

                square.classList.add(
                    "selected"
                );

            }


            if(
                isPossibleMove(
                    row,
                    col
                )
            ){

                square.classList.add(
                    "possible-move"
                );

            }


            if(
                lastMove &&
                (
                    (
                        lastMove.fromRow === row &&
                        lastMove.fromCol === col
                    )
                    ||
                    (
                        lastMove.toRow === row &&
                        lastMove.toCol === col
                    )
                )
            ){

                square.classList.add(
                    "last-move"
                );

            }


            square.addEventListener(
                "click",
                () => {

                    clickSquare(
                        row,
                        col
                    );

                }
            );


            boardElement.appendChild(
                square
            );

        }

    }

}


// ======================================
// TESTER CASE POSSIBLE
// ======================================

function isPossibleMove(
    row,
    col
){

    return possibleMoves.some(
        move =>

            move.row === row &&
            move.col === col
    );

}


// ======================================
// CLIC SUR UNE CASE
// ======================================

function clickSquare(
    row,
    col
){

    if(
        gameOver
    ){

        return;

    }


    // ONLINE :
    // le joueur ne peut jouer
    // que quand c'est sa couleur.

    if(
        isOnlineGame() &&
        !canHumanMove()
    ){

        console.log(
            "⏳ Ce n'est pas ton tour."
        );

        return;

    }


    const clickedPiece =
        pieces[row][col];


    // ==================================
    // PREMIER CLIC
    // ==================================

    if(
        selectedRow === null
    ){

        if(
            currentPlayer === "white" &&
            !isWhitePiece(
                clickedPiece
            )
        ){

            return;

        }


        if(
            currentPlayer === "black" &&
            !isBlackPiece(
                clickedPiece
            )
        ){

            return;

        }


        selectedRow =
            row;

        selectedCol =
            col;

        possibleMoves =
            getLegalMoves(
                row,
                col
            );

        drawBoard();

        return;

    }


    // ==================================
    // DEUXIÈME CLIC SUR MÊME CASE
    // ==================================

    if(
        selectedRow === row &&
        selectedCol === col
    ){

        selectedRow =
            null;

        selectedCol =
            null;

        possibleMoves =
            [];

        drawBoard();

        return;

    }


    // ==================================
    // CHANGER DE PIÈCE
    // ==================================

    if(
        getPieceColor(
            clickedPiece
        ) === currentPlayer
    ){

        selectedRow =
            row;

        selectedCol =
            col;

        possibleMoves =
            getLegalMoves(
                row,
                col
            );

        drawBoard();

        return;

    }


    // ==================================
    // VÉRIFIER LE COUP
    // ==================================

    const legal =
        possibleMoves.some(
            move =>

                move.row === row &&
                move.col === col
        );


    if(
        !legal
    ){

        selectedRow =
            null;

        selectedCol =
            null;

        possibleMoves =
            [];

        drawBoard();

        return;

    }


    const fromRow =
        selectedRow;

    const fromCol =
        selectedCol;


    selectedRow =
        null;

    selectedCol =
        null;

    possibleMoves =
        [];


    makeMove(
        fromRow,
        fromCol,
        row,
        col,
        {

            onlineMove:
                isOnlineGame(),

            skipSend:
                false,

            fromHistory:
                false

        }
    );

}


// ======================================
// EFFECTUER UN COUP
// ======================================

function makeMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    options = {}
){

    if(
        gameOver
    ){

        return;

    }

    const movingPiece =
        pieces[fromRow][fromCol];

    if(
        !movingPiece
    ){

        return;

    }


    const movingColor =
        getPieceColor(
            movingPiece
        );

    if(
        movingColor !==
        currentPlayer
    ){

        return;

    }


    const targetPiece =
        pieces[toRow][toCol];


    // ==================================
    // SAUVEGARDE
    // ==================================

    const moveData = {

        fromRow:
            fromRow,

        fromCol:
            fromCol,

        toRow:
            toRow,

        toCol:
            toCol,

        piece:
            movingPiece,

        captured:
            targetPiece,

        promotion:
            null,

        castling:
            false,

        enPassant:
            false

    };


    // ==================================
    // EN PASSANT
    // ==================================

    if(
        (
            movingPiece === "♙" ||
            movingPiece === "♟"
        )
        &&
        fromCol !== toCol
        &&
        !targetPiece
    ){

        if(
            enPassantTarget &&
            enPassantTarget.row ===
            toRow &&
            enPassantTarget.col ===
            toCol
        ){

            const capturedRow =
                movingPiece === "♙"
                    ? toRow + 1
                    : toRow - 1;

            const capturedPiece =
                pieces[capturedRow][toCol];

            if(
                capturedPiece
            ){

                moveData.captured =
                    capturedPiece;

                moveData.enPassant =
                    true;

                pieces[capturedRow][toCol] =
                    "";

                if(
                    isWhitePiece(
                        capturedPiece
                    )
                ){

                    whiteCaptured.push(
                        capturedPiece
                    );

                }else{

                    blackCaptured.push(
                        capturedPiece
                    );

                }

            }

        }

    }


    // ==================================
    // CAPTURE NORMALE
    // ==================================

    if(
        targetPiece
    ){

        if(
            isWhitePiece(
                targetPiece
            )
        ){

            whiteCaptured.push(
                targetPiece
            );

        }else{

            blackCaptured.push(
                targetPiece
            );

        }

    }


    // ==================================
    // DÉPLACEMENT
    // ==================================

    pieces[toRow][toCol] =
        movingPiece;

    pieces[fromRow][fromCol] =
        "";


    // ==================================
    // ROQUE
    // ==================================

    if(
        (
            movingPiece === "♔" ||
            movingPiece === "♚"
        )
        &&
        Math.abs(
            toCol - fromCol
        ) === 2
    ){

        moveData.castling =
            true;


        if(
            toCol > fromCol
        ){

            const rookFromCol =
                7;

            const rookToCol =
                5;

            pieces[toRow][rookToCol] =
                pieces[toRow][rookFromCol];

            pieces[toRow][rookFromCol] =
                "";

        }else{

            const rookFromCol =
                0;

            const rookToCol =
                3;

            pieces[toRow][rookToCol] =
                pieces[toRow][rookFromCol];

            pieces[toRow][rookFromCol] =
                "";

        }

    }


    // ==================================
    // MISE À JOUR ROQUES
    // ==================================

    updateCastlingRights(
        movingPiece,
        fromRow,
        fromCol
    );


    // ==================================
    // EN PASSANT CIBLE
    // ==================================

    enPassantTarget =
        null;

    if(
        movingPiece === "♙" &&
        fromRow === 6 &&
        toRow === 4
    ){

        enPassantTarget = {

            row:5,

            col:fromCol

        };

    }

    if(
        movingPiece === "♟" &&
        fromRow === 1 &&
        toRow === 3
    ){

        enPassantTarget = {

            row:2,

            col:fromCol

        };

    }


    // ==================================
    // PROMOTION
    // ==================================

    if(
        movingPiece === "♙" &&
        toRow === 0
    ){

        const promotionPiece =
            choosePromotion(
                "white"
            );

        pieces[toRow][toCol] =
            promotionPiece;

        moveData.promotion =
            promotionPiece;

    }

    if(
        movingPiece === "♟" &&
        toRow === 7
    ){

        const promotionPiece =
            choosePromotion(
                "black"
            );

        pieces[toRow][toCol] =
            promotionPiece;

        moveData.promotion =
            promotionPiece;

    }


    lastMove =
        {

            fromRow:
                fromRow,

            fromCol:
                fromCol,

            toRow:
                toRow,

            toCol:
                toCol

        };


    // ==================================
    // NOTATION
    // ==================================

    const notation =
        getMoveNotation(
            movingPiece,
            fromRow,
            fromCol,
            toRow,
            toCol,
            moveData
        );

    moveHistory.push(
        notation
    );


    // ==================================
    // CHANGER LE JOUEUR
    // ==================================

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";


    updateMoveHistory();

    drawBoard();

    updateTurn();


    // ==================================
    // FIN DE PARTIE
    // ==================================

    checkGameState();


    // ==================================
    // ENVOI ONLINE
    // ==================================

    if(
        options.onlineMove &&
        !options.skipSend
    ){

        sendOnlineMove(
            moveData
        );

    }


    // ==================================
    // FARIS AI
    // ==================================

    if(
        !isOnlineGame() &&
        !gameOver
    ){

        startFarisIfNeeded();

    }

}


// ======================================
// PROMOTION
// ======================================

function choosePromotion(
    color
){

    if(
        color === "white"
    ){

        return "♕";

    }

    return "♛";

}


// ======================================
// ROQUE - DROITS
// ======================================

function updateCastlingRights(
    piece,
    row,
    col
){

    if(
        piece === "♔"
    ){

        whiteKingMoved =
            true;

    }

    if(
        piece === "♚"
    ){

        blackKingMoved =
            true;

    }

    if(
        piece === "♖"
    ){

        if(
            row === 7 &&
            col === 0
        ){

            whiteLeftRookMoved =
                true;

        }

        if(
            row === 7 &&
            col === 7
        ){

            whiteRightRookMoved =
                true;

        }

    }

    if(
        piece === "♜"
    ){

        if(
            row === 0 &&
            col === 0
        ){

            blackLeftRookMoved =
                true;

        }

        if(
            row === 0 &&
            col === 7
        ){

            blackRightRookMoved =
                true;

        }

    }

}


// ======================================
// COUPS LÉGAUX
// ======================================

function getLegalMoves(
    row,
    col
){

    const piece =
        pieces[row][col];

    if(
        !piece
    ){

        return [];

    }

    const color =
        getPieceColor(
            piece
        );

    const pseudoMoves =
        getPossibleMoves(
            row,
            col,
            true
        );

    const legalMoves =
        [];


    for(
        const move of pseudoMoves
    ){

        if(
            isMoveSafe(
                row,
                col,
                move.row,
                move.col,
                color
            )
        ){

            legalMoves.push(
                move
            );

        }

    }

    return legalMoves;

}


// ======================================
// VÉRIFIER SI LE COUP EST LÉGAL
// ======================================

function isMoveSafe(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
){

    const movingPiece =
        pieces[fromRow][fromCol];

    const targetPiece =
        pieces[toRow][toCol];

    let enPassantCaptured =
        null;

    let enPassantRow =
        null;

    let rookMove =
        null;


    // Simulation du coup

    if(
        (
            movingPiece === "♙" ||
            movingPiece === "♟"
        )
        &&
        fromCol !== toCol &&
        !targetPiece &&
        enPassantTarget &&
        enPassantTarget.row === toRow &&
        enPassantTarget.col === toCol
    ){

        enPassantRow =
            movingPiece === "♙"
                ? toRow + 1
                : toRow - 1;

        enPassantCaptured =
            pieces[enPassantRow][toCol];

        pieces[enPassantRow][toCol] =
            "";

    }


    if(
        (
            movingPiece === "♔" ||
            movingPiece === "♚"
        )
        &&
        Math.abs(
            toCol - fromCol
        ) === 2
    ){

        if(
            isSquareAttacked(
                fromRow,
                fromCol,
                color === "white"
                    ? "black"
                    : "white"
            )
        ){

            if(
                enPassantCaptured
            ){

                pieces[enPassantRow][toCol] =
                    enPassantCaptured;

            }

            return false;

        }


        const direction =
            toCol > fromCol
                ? 1
                : -1;

        const middleCol =
            fromCol + direction;

        const enemyColor =
            color === "white"
                ? "black"
                : "white";


        // Le roi ne peut pas traverser
        // une case attaquée.

        if(
            isSquareAttacked(
                fromRow,
                middleCol,
                enemyColor
            )
        ){

            if(
                enPassantCaptured
            ){

                pieces[enPassantRow][toCol] =
                    enPassantCaptured;

            }

            return false;

        }


        rookMove =
            toCol > fromCol
                ? {
                    fromCol:7,
                    toCol:5
                }
                : {
                    fromCol:0,
                    toCol:3
                };


        pieces[toRow][toCol] =
            movingPiece;

        pieces[fromRow][fromCol] =
            "";

        pieces[fromRow][rookMove.toCol] =
            pieces[fromRow][rookMove.fromCol];

        pieces[fromRow][rookMove.fromCol] =
            "";


        const safe =
            !isKingInCheck(
                color
            );


        pieces[fromRow][fromCol] =
            movingPiece;

        pieces[toRow][toCol] =
            targetPiece;

        pieces[fromRow][rookMove.fromCol] =
            pieces[fromRow][rookMove.toCol];

        pieces[fromRow][rookMove.toCol] =
            "";


        if(
            enPassantCaptured
        ){

            pieces[enPassantRow][toCol] =
                enPassantCaptured;

        }

        return safe;

    }


    pieces[toRow][toCol] =
        movingPiece;

    pieces[fromRow][fromCol] =
        "";


    const safe =
        !isKingInCheck(
            color
        );


    pieces[fromRow][fromCol] =
        movingPiece;

    pieces[toRow][toCol] =
        targetPiece;


    if(
        enPassantCaptured
    ){

        pieces[enPassantRow][toCol] =
            enPassantCaptured;

    }

    return safe;

}


// ======================================
// POSSIBLES MOVES
// ======================================

function getPossibleMoves(
    row,
    col,
    ignoreCheck = false
){

    const piece =
        pieces[row][col];

    if(
        !piece
    ){

        return [];

    }


    switch(piece){

        case "♙":

            return getWhitePawnMoves(
                row,
                col
            );

        case "♟":

            return getBlackPawnMoves(
                row,
                col
            );

        case "♖":

        case "♜":

            return getRookMoves(
                row,
                col
            );

        case "♗":

        case "♝":

            return getBishopMoves(
                row,
                col
            );

        case "♕":

        case "♛":

            return getQueenMoves(
                row,
                col
            );

        case "♘":

        case "♞":

            return getKnightMoves(
                row,
                col
            );

        case "♔":

        case "♚":

            return getKingMoves(
                row,
                col,
                ignoreCheck
            );

    }

    return [];

}


// ======================================
// PION BLANC
// ======================================

function getWhitePawnMoves(
    row,
    col
){

    const moves =
        [];


    if(
        row > 0 &&
        pieces[row - 1][col] === ""
    ){

        moves.push({

            row:row - 1,

            col:col

        });


        if(
            row === 6 &&
            pieces[row - 2][col] === ""
        ){

            moves.push({

                row:row - 2,

                col:col

            });

        }

    }


    if(
        row > 0 &&
        col > 0 &&
        isBlackPiece(
            pieces[row - 1][col - 1]
        )
    ){

        moves.push({

            row:row - 1,

            col:col - 1

        });

    }


    if(
        row > 0 &&
        col < 7 &&
        isBlackPiece(
            pieces[row - 1][col + 1]
        )
    ){

        moves.push({

            row:row - 1,

            col:col + 1

        });

    }


    if(
        enPassantTarget &&
        row === 3 &&
        Math.abs(
            col -
            enPassantTarget.col
        ) === 1 &&
        enPassantTarget.row === 2
    ){

        moves.push({

            row:
                enPassantTarget.row,

            col:
                enPassantTarget.col

        });

    }

    return moves;

}


// ======================================
// PION NOIR
// ======================================

function getBlackPawnMoves(
    row,
    col
){

    const moves =
        [];


    if(
        row < 7 &&
        pieces[row + 1][col] === ""
    ){

        moves.push({

            row:row + 1,

            col:col

        });


        if(
            row === 1 &&
            pieces[row + 2][col] === ""
        ){

            moves.push({

                row:row + 2,

                col:col

            });

        }

    }


    if(
        row < 7 &&
        col > 0 &&
        isWhitePiece(
            pieces[row + 1][col - 1]
        )
    ){

        moves.push({

            row:row + 1,

            col:col - 1

        });

    }


    if(
        row < 7 &&
        col < 7 &&
        isWhitePiece(
            pieces[row + 1][col + 1]
        )
    ){

        moves.push({

            row:row + 1,

            col:col + 1

        });

    }


    if(
        enPassantTarget &&
        row === 4 &&
        Math.abs(
            col -
            enPassantTarget.col
        ) === 1 &&
        enPassantTarget.row === 5
    ){

        moves.push({

            row:
                enPassantTarget.row,

            col:
                enPassantTarget.col

        });

    }

    return moves;

}


// ======================================
// TOUR
// ======================================

function getRookMoves(
    row,
    col
){

    const moves =
        [];

    const directions = [

        [-1,0],
        [1,0],
        [0,-1],
        [0,1]

    ];


    for(
        const direction of directions
    ){

        let newRow =
            row + direction[0];

        let newCol =
            col + direction[1];


        while(
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8
        ){

            const target =
                pieces[newRow][newCol];


            if(
                target === ""
            ){

                moves.push({

                    row:newRow,

                    col:newCol

                });

            }else{

                if(
                    getPieceColor(
                        target
                    ) !==
                    getPieceColor(
                        pieces[row][col]
                    )
                ){

                    moves.push({

                        row:newRow,

                        col:newCol

                    });

                }

                break;

            }


            newRow +=
                direction[0];

            newCol +=
                direction[1];

        }

    }

    return moves;

}


// ======================================
// FOU
// ======================================

function getBishopMoves(
    row,
    col
){

    const moves =
        [];

    const directions = [

        [-1,-1],
        [-1,1],
        [1,-1],
        [1,1]

    ];


    for(
        const direction of directions
    ){

        let newRow =
            row + direction[0];

        let newCol =
            col + direction[1];


        while(
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8
        ){

            const target =
                pieces[newRow][newCol];


            if(
                target === ""
            ){

                moves.push({

                    row:newRow,

                    col:newCol

                });

            }else{

                if(
                    getPieceColor(
                        target
                    ) !==
                    getPieceColor(
                        pieces[row][col]
                    )
                ){

                    moves.push({

                        row:newRow,

                        col:newCol

                    });

                }

                break;

            }


            newRow +=
                direction[0];

            newCol +=
                direction[1];

        }

    }

    return moves;

}


// ======================================
// DAME
// ======================================

function getQueenMoves(
    row,
    col
){

    return [

        ...getRookMoves(
            row,
            col
        ),

        ...getBishopMoves(
            row,
            col
        )

    ];

}


// ======================================
// CAVALIER
// ======================================

function getKnightMoves(
    row,
    col
){

    const moves =
        [];

    const directions = [

        [-2,-1],
        [-2,1],

        [-1,-2],
        [-1,2],

        [1,-2],
        [1,2],

        [2,-1],
        [2,1]

    ];


    const ownColor =
        getPieceColor(
            pieces[row][col]
        );


    for(
        const direction of directions
    ){

        const newRow =
            row + direction[0];

        const newCol =
            col + direction[1];


        if(
            newRow < 0 ||
            newRow > 7 ||
            newCol < 0 ||
            newCol > 7
        ){

            continue;

        }


        const target =
            pieces[newRow][newCol];


        if(
            !target ||
            getPieceColor(
                target
            ) !== ownColor
        ){

            moves.push({

                row:newRow,

                col:newCol

            });

        }

    }

    return moves;

}


// ======================================
// ROI + ROQUE
// ======================================

function getKingMoves(
    row,
    col,
    ignoreCheck = false
){

    const moves =
        [];

    const directions = [

        [-1,-1],
        [-1,0],
        [-1,1],

        [0,-1],
        [0,1],

        [1,-1],
        [1,0],
        [1,1]

    ];

    const ownColor =
        getPieceColor(
            pieces[row][col]
        );


    for(
        const direction of directions
    ){

        const newRow =
            row + direction[0];

        const newCol =
            col + direction[1];


        if(
            newRow < 0 ||
            newRow > 7 ||
            newCol < 0 ||
            newCol > 7
        ){

            continue;

        }


        const target =
            pieces[newRow][newCol];


        if(
            !target ||
            getPieceColor(
                target
            ) !== ownColor
        ){

            moves.push({

                row:newRow,

                col:newCol

            });

        }

    }


    // ==================================
    // ROQUE BLANC
    // ==================================

    if(
        ownColor === "white" &&
        !whiteKingMoved &&
        row === 7 &&
        col === 4
    ){

        const enemy =
            "black";


        // Petit roque

        if(
            !whiteRightRookMoved &&
            pieces[7][7] === "♖" &&
            pieces[7][5] === "" &&
            pieces[7][6] === "" &&
            !isSquareAttacked(
                7,
                4,
                enemy
            ) &&
            !isSquareAttacked(
                7,
                5,
                enemy
            ) &&
            !isSquareAttacked(
                7,
                6,
                enemy
            )
        ){

            moves.push({

                row:7,

                col:6

            });

        }


        // Grand roque

        if(
            !whiteLeftRookMoved &&
            pieces[7][0] === "♖" &&
            pieces[7][1] === "" &&
            pieces[7][2] === "" &&
            pieces[7][3] === "" &&
            !isSquareAttacked(
                7,
                4,
                enemy
            ) &&
            !isSquareAttacked(
                7,
                3,
                enemy
            ) &&
            !isSquareAttacked(
                7,
                2,
                enemy
            )
        ){

            moves.push({

                row:7,

                col:2

            });

        }

    }


    // ==================================
    // ROQUE NOIR
    // ==================================

    if(
        ownColor === "black" &&
        !blackKingMoved &&
        row === 0 &&
        col === 4
    ){

        const enemy =
            "white";


        // Petit roque

        if(
            !blackRightRookMoved &&
            pieces[0][7] === "♜" &&
            pieces[0][5] === "" &&
            pieces[0][6] === "" &&
            !isSquareAttacked(
                0,
                4,
                enemy
            ) &&
            !isSquareAttacked(
                0,
                5,
                enemy
            ) &&
            !isSquareAttacked(
                0,
                6,
                enemy
            )
        ){

            moves.push({

                row:0,

                col:6

            });

        }


        // Grand roque

        if(
            !blackLeftRookMoved &&
            pieces[0][0] === "♜" &&
            pieces[0][1] === "" &&
            pieces[0][2] === "" &&
            pieces[0][3] === "" &&
            !isSquareAttacked(
                0,
                4,
                enemy
            ) &&
            !isSquareAttacked(
                0,
                3,
                enemy
            ) &&
            !isSquareAttacked(
                0,
                2,
                enemy
            )
        ){

            moves.push({

                row:0,

                col:2

            });

        }

    }


    return moves;

}


// ======================================
// CASE ATTAQUÉE
// ======================================

function isSquareAttacked(
    targetRow,
    targetCol,
    byColor
){

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
                !piece ||
                getPieceColor(
                    piece
                ) !== byColor
            ){

                continue;

            }


            // Pions

            if(
                piece === "♙"
            ){

                if(
                    row - 1 === targetRow &&
                    (
                        col - 1 === targetCol ||
                        col + 1 === targetCol
                    )
                ){

                    return true;

                }

                continue;

            }


            if(
                piece === "♟"
            ){

                if(
                    row + 1 === targetRow &&
                    (
                        col - 1 === targetCol ||
                        col + 1 === targetCol
                    )
                ){

                    return true;

                }

                continue;

            }


            // Roi

            if(
                piece === "♔" ||
                piece === "♚"
            ){

                if(
                    Math.abs(
                        row - targetRow
                    ) <= 1 &&
                    Math.abs(
                        col - targetCol
                    ) <= 1
                ){

                    return true;

                }

                continue;

            }


            const moves =
                getPossibleMoves(
                    row,
                    col,
                    true
                );


            for(
                const move of moves
            ){

                if(
                    move.row === targetRow &&
                    move.col === targetCol
                ){

                    return true;

                }

            }

        }

    }

    return false;

}


// ======================================
// ROI EN ÉCHEC
// ======================================

function isKingInCheck(
    color
){

    const king =
        color === "white"
            ? "♔"
            : "♚";


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
                pieces[row][col] ===
                king
            ){

                return isSquareAttacked(
                    row,
                    col,
                    color === "white"
                        ? "black"
                        : "white"
                );

            }

        }

    }

    return false;

}


// ======================================
// JOUEUR A UN COUP LÉGAL ?
// ======================================

function hasLegalMove(
    color
){

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
                !piece ||
                getPieceColor(
                    piece
                ) !== color
            ){

                continue;

            }


            const legalMoves =
                getLegalMoves(
                    row,
                    col
                );


            if(
                legalMoves.length > 0
            ){

                return true;

            }

        }

    }

    return false;

}


// ======================================
// VÉRIFIER FIN DE PARTIE
// ======================================

function checkGameState(){

    if(
        gameOver
    ){

        return;

    }

    const player =
        currentPlayer;

    const inCheck =
        isKingInCheck(
            player
        );

    const hasMove =
        hasLegalMove(
            player
        );


    // ==================================
    // ÉCHEC ET MAT
    // ==================================

    if(
        inCheck &&
        !hasMove
    ){

        gameOver =
            true;

        stopClock();

        const winner =
            player === "white"
                ? "BLACK"
                : "WHITE";

        showGameResult(
            "CHECKMATE",
            winner +
            " WINS BY CHECKMATE."
        );

        return;

    }


    // ==================================
    // PAT / STALEMATE
    // ==================================
    //
    // Le joueur n'est PAS en échec
    // mais aucune pièce ne peut jouer.
    // Résultat : MATCH NUL.
    //
    // ==================================

    if(
        !inCheck &&
        !hasMove
    ){

        gameOver =
            true;

        stopClock();

        showGameResult(
            "DRAW",
            "STALEMATE — NO LEGAL MOVE."
        );

        return;

    }


    // ==================================
    // ÉCHEC SIMPLE
    // ==================================

    updateTurn();

}


// ======================================
// NOTATION
// ======================================

function getMoveNotation(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    moveData
){

    const files =
        ["a","b","c","d","e","f","g","h"];

    const ranks =
        ["8","7","6","5","4","3","2","1"];


    if(
        moveData.castling
    ){

        return toCol === 6
            ? "O-O"
            : "O-O-O";

    }


    let pieceLetter =
        "";

    if(
        piece === "♖" ||
        piece === "♜"
    ){

        pieceLetter =
            "R";

    }

    if(
        piece === "♘" ||
        piece === "♞"
    ){

        pieceLetter =
            "N";

    }

    if(
        piece === "♗" ||
        piece === "♝"
    ){

        pieceLetter =
            "B";

    }

    if(
        piece === "♕" ||
        piece === "♛"
    ){

        pieceLetter =
            "Q";

    }

    if(
        piece === "♔" ||
        piece === "♚"
    ){

        pieceLetter =
            "K";

    }


    const capture =
        moveData.captured
            ? "x"
            : "";


    let notation =
        pieceLetter +
        capture +
        files[toCol] +
        ranks[toRow];


    if(
        moveData.promotion
    ){

        const promotionMap = {

            "♕":"Q",
            "♖":"R",
            "♗":"B",
            "♘":"N",

            "♛":"Q",
            "♜":"R",
            "♝":"B",
            "♞":"N"

        };

        notation +=
            "=" +
            (
                promotionMap[
                    moveData.promotion
                ] || "Q"
            );

    }


    const enemy =
        currentPlayer;

    if(
        isKingInCheck(
            enemy
        )
    ){

        notation +=
            hasLegalMove(
                enemy
            )
                ? "+"
                : "#";

    }

    return notation;

}


// ======================================
// HISTORIQUE DES COUPS
// ======================================

function updateMoveHistory(){

    if(
        !movesElement
    ){

        return;

    }

    movesElement.innerHTML =
        "";

    for(
        let i = 0;
        i < moveHistory.length;
        i += 2
    ){

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "move-row";

        const moveNumber =
            document.createElement(
                "span"
            );

        moveNumber.className =
            "move-number";

        moveNumber.textContent =
            Math.floor(
                i / 2
            ) + 1;


        const whiteMove =
            document.createElement(
                "span"
            );

        whiteMove.className =
            "move-white";

        whiteMove.textContent =
            moveHistory[i] || "";


        const blackMove =
            document.createElement(
                "span"
            );

        blackMove.className =
            "move-black";

        blackMove.textContent =
            moveHistory[i + 1] || "";


        row.appendChild(
            moveNumber
        );

        row.appendChild(
            whiteMove
        );

        row.appendChild(
            blackMove
        );

        movesElement.appendChild(
            row
        );

    }

}


// ======================================
// TOUR
// ======================================

function updateTurn(){

    if(
        !turnElement
    ){

        return;

    }

    if(
        gameOver
    ){

        return;

    }


    const inCheck =
        isKingInCheck(
            currentPlayer
        );


    let text =
        currentPlayer === "white"
            ? "⚪ White to move"
            : "⚫ Black to move";


    if(
        inCheck
    ){

        text +=
            " — CHECK!";

    }


    if(
        isOnlineGame()
    ){

        if(
            currentPlayer ===
            onlineMyColor
        ){

            text =
                "🟢 YOUR TURN" +
                (
                    inCheck
                        ? " — CHECK!"
                        : ""
                );

        }else{

            text =
                "🔴 OPPONENT'S TURN" +
                (
                    inCheck
                        ? " — CHECK!"
                        : ""
                );

        }

    }

    turnElement.textContent =
        text;

}


// ======================================
// RÉSULTAT
// ======================================

function showGameResult(
    title,
    message
){

    if(
        !gameResultElement
    ){

        alert(
            title +
            "\n" +
            message
        );

        return;

    }

    const titleElement =
        gameResultElement.querySelector(
            ".result-title"
        );

    const messageElement =
        gameResultElement.querySelector(
            ".result-message"
        );


    if(
        titleElement
    ){

        titleElement.textContent =
            title;

    }


    if(
        messageElement
    ){

        messageElement.textContent =
            message;

    }


    gameResultElement.classList.add(
        "show"
    );

    gameResultElement.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ======================================
// PENDULE
// ======================================

function formatTime(
    seconds
){

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    return (
        String(
            minutes
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
        String(
            secs
        ).padStart(
            2,
            "0"
        )
    );

}


function updateClocks(){

    const clocks =
        document.querySelectorAll(
            ".clock"
        );

    if(
        clocks.length < 2
    ){

        return;

    }


    const blackClock =
        clocks[0];

    const whiteClock =
        clocks[1];


    blackClock.textContent =
        formatTime(
            blackTime
        );

    whiteClock.textContent =
        formatTime(
            whiteTime
        );

}


function startClock(){

    if(
        gameTimer
    ){

        clearInterval(
            gameTimer
        );

    }

    gameTimer =
        setInterval(
            () => {

                if(
                    gameOver
                ){

                    stopClock();

                    return;

                }


                if(
                    currentPlayer ===
                    "white"
                ){

                    whiteTime--;

                    if(
                        whiteTime <= 0
                    ){

                        whiteTime =
                            0;

                        gameOver =
                            true;

                        stopClock();

                        showGameResult(
                            "TIME OUT",
                            "BLACK WINS ON TIME."
                        );

                    }

                }else{

                    blackTime--;

                    if(
                        blackTime <= 0
                    ){

                        blackTime =
                            0;

                        gameOver =
                            true;

                        stopClock();

                        showGameResult(
                            "TIME OUT",
                            "WHITE WINS ON TIME."
                        );

                    }

                }

                updateClocks();

            },
            1000
        );

}


function stopClock(){

    if(
        gameTimer
    ){

        clearInterval(
            gameTimer
        );

        gameTimer =
            null;

    }

}


// ======================================
// FARIS AI
// ======================================

function getHumanColor(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    const color =
        params.get(
            "color"
        );

    if(
        color === "black"
    ){

        return "black";

    }

    return "white";

}


function getFarisColor(){

    return (
        getHumanColor() === "white"
    )
        ? "black"
        : "white";

}


function startFarisIfNeeded(){

    // IMPORTANT :
    // jamais Faris AI
    // pendant une partie online.

    if(
        isOnlineGame()
    ){

        return;

    }


    if(
        typeof farisPlay !==
        "function"
    ){

        return;

    }


    const farisColor =
        getFarisColor();


    if(
        currentPlayer !==
        farisColor
    ){

        return;

    }


    setTimeout(
        () => {

            if(
                gameOver ||
                isOnlineGame()
            ){

                return;

            }


            if(
                currentPlayer !==
                getFarisColor()
            ){

                return;

            }


            farisPlay();

        },
        250
    );

}


// ======================================
// COMPATIBILITÉ FARIS AI
// ======================================

window.CHESSFK =
    window.CHESSFK || {};

window.CHESSFK.board = {

    getPieces:
        () => pieces,

    getCurrentPlayer:
        () => currentPlayer,

    makeMove:
        makeMove,

    redraw:
        drawBoard,

    isOnline:
        isOnlineGame

};


// ======================================
// BOUTON HOME
// ======================================

const homeButton =
    document.getElementById(
        "homeButton"
    );

if(
    homeButton
){

    homeButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "../index.html";

        }
    );

}


// ======================================
// BOUTON RESIGN
// ======================================

const resignButton =
    document.getElementById(
        "resignButton"
    );

if(
    resignButton
){

    resignButton.addEventListener(
        "click",
        () => {

            if(
                gameOver
            ){

                return;

            }

            gameOver =
                true;

            stopClock();

            const winner =
                currentPlayer === "white"
                    ? "BLACK"
                    : "WHITE";

            showGameResult(
                "RESIGNATION",
                winner +
                " WINS."
            );

        }
    );

}


// ======================================
// TAILLE DE L'ÉCHIQUIER
// ======================================

function updateBoardSize(){

    if(
        boardSizeLabel
    ){

        boardSizeLabel.textContent =
            squareSize;

    }

    drawBoard();

}


const decreaseBoard =
    document.getElementById(
        "decreaseBoard"
    );

const increaseBoard =
    document.getElementById(
        "increaseBoard"
    );


if(
    decreaseBoard
){

    decreaseBoard.addEventListener(
        "click",
        () => {

            if(
                squareSize > 40
            ){

                squareSize -=
                    5;

                updateBoardSize();

            }

        }
    );

}


if(
    increaseBoard
){

    increaseBoard.addEventListener(
        "click",
        () => {

            if(
                squareSize < 100
            ){

                squareSize +=
                    5;

                updateBoardSize();

            }

        }
    );

}


// ======================================
// BOUTON UNDO
// ======================================

const undoButton =
    document.getElementById(
        "undoButton"
    );

if(
    undoButton
){

    undoButton.addEventListener(
        "click",
        () => {

            // Undo désactivé en online :
            // sinon les deux joueurs
            // ne seraient plus synchronisés.

            if(
                isOnlineGame()
            ){

                alert(
                    "UNDO is not available in online games."
                );

                return;

            }

            alert(
                "UNDO will be available soon."
            );

        }
    );

}


// ======================================
// BOUTON DRAW
// ======================================

const drawButton =
    document.getElementById(
        "drawButton"
    );

if(
    drawButton
){

    drawButton.addEventListener(
        "click",
        () => {

            if(
                gameOver
            ){

                return;

            }

            if(
                isOnlineGame()
            ){

                alert(
                    "Draw offer sent."
                );

                return;

            }

            gameOver =
                true;

            stopClock();

            showGameResult(
                "DRAW",
                "GAME DRAWN."
            );

        }
    );

}


// ======================================
// INITIALISATION
// ======================================

drawBoard();

updateMoveHistory();

updateTurn();

updateClocks();

startClock();


// ======================================
// ONLINE OU FARIS
// ======================================

if(
    isOnlineGame()
){

    chessfkStartOnlineGame();

}else{

    chessfkStartOnlineGame();

}