// ======================================
// CHESS_FK CHESS ENGINE
// board.js
// VERSION PRO — FARIS BLANC / NOIR
// ======================================


// ======================================
// PLATEAU
// ======================================

const board = document.getElementById("board");


// ======================================
// POSITION DE DÉPART
// ======================================

const initialPieces = [

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
// COPIE
// ======================================

let pieces =
    initialPieces.map(row => [...row]);


// ======================================
// SÉLECTION
// ======================================

let markedSquare = null;

let selectedRow = null;
let selectedCol = null;

let possibleMoves = [];


// ======================================
// JOUEUR
// ======================================

let currentPlayer = "white";


// ======================================
// COULEUR FARIS / JOUEUR
// ======================================
//
// faris-ai.js définit :
//
// window.farisColor = "white" / "black"
// window.humanColor = "white" / "black"
//
// Sécurité : par défaut Faris = noir.
//

function getFarisColor(){

    return (
        typeof window.farisColor !== "undefined"
        &&
        (
            window.farisColor === "white" ||
            window.farisColor === "black"
        )
    )
        ? window.farisColor
        : "black";

}


function getHumanColor(){

    const faris =
        getFarisColor();

    return faris === "white"
        ? "black"
        : "white";

}


function isFarisTurn(){

    return (
        currentPlayer ===
        getFarisColor()
    );

}


function isHumanTurn(){

    return (
        currentPlayer ===
        getHumanColor()
    );

}


// ======================================
// PARTIE TERMINÉE
// ======================================

let gameOver = false;


// ======================================
// DERNIER COUP
// ======================================

let lastMove = null;


// ======================================
// ROQUE
// ======================================

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;

let blackRookLeftMoved = false;
let blackRookRightMoved = false;


// ======================================
// PENDULE
// ======================================

function getGameTimeFromURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlTime =
        parseInt(
            params.get("time"),
            10
        );


    if(
        !Number.isFinite(urlTime) ||
        urlTime <= 0
    ){

        return 10 * 60;

    }


    if(urlTime > 24 * 60 * 60){

        return 10 * 60;

    }


    return urlTime;

}


// ======================================
// INCRÉMENT
// ======================================

function getIncrementFromURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlIncrement =
        parseInt(
            params.get("increment"),
            10
        );


    if(
        !Number.isFinite(urlIncrement) ||
        urlIncrement < 0
    ){

        return 0;

    }


    if(urlIncrement > 60 * 60){

        return 0;

    }


    return urlIncrement;

}


// ======================================
// TEMPS CHOISI
// ======================================

const selectedGameTime =
    getGameTimeFromURL();


// ======================================
// INCRÉMENT CHOISI
// ======================================

const selectedIncrement =
    getIncrementFromURL();


// ======================================
// TEMPS ACTUEL
// ======================================

let whiteTime =
    selectedGameTime;

let blackTime =
    selectedGameTime;


// ======================================
// CHRONOMÈTRE
// ======================================

let clockInterval = null;

let clockStarted = false;


// ======================================
// NOTATION
// ======================================

let moveNumber = 1;

let whiteMoveNotation = null;


// ======================================
// HISTORIQUE
// ======================================

let moveHistory = [];


// ======================================
// FLÈCHES
// ======================================

let arrows = [];

let drawingArrow = null;


// ======================================
// HORLOGES
// ======================================

const whiteClock =
    document.querySelector(
        ".white-player .clock"
    );


const blackClock =
    document.querySelector(
        ".black-player .clock"
    );


// ======================================
// TEMPS
// ======================================

function formatTime(seconds){

    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2,"0")
        +
        ":"
        +
        String(remainingSeconds).padStart(2,"0")
    );

}


// ======================================
// METTRE À JOUR LES HORLOGES
// ======================================

function updateClocks(){

    if(whiteClock){

        whiteClock.textContent =
            formatTime(whiteTime);

    }


    if(blackClock){

        blackClock.textContent =
            formatTime(blackTime);

    }

}


// ======================================
// DÉMARRER LA PENDULE
// ======================================

function startClock(){

    if(clockInterval !== null){

        return;

    }


    clockInterval =
        setInterval(function(){

            if(gameOver){

                stopClock();

                return;

            }


            if(currentPlayer === "white"){

                whiteTime--;

                if(whiteTime <= 0){

                    whiteTime = 0;

                    updateClocks();

                    finishGame(
                        "⏰ TIME OUT ! BLACK WINS !"
                    );

                    return;

                }

            }

            else{

                blackTime--;

                if(blackTime <= 0){

                    blackTime = 0;

                    updateClocks();

                    finishGame(
                        "⏰ TIME OUT ! WHITE WINS !"
                    );

                    return;

                }

            }


            updateClocks();

        },1000);

}


// ======================================
// ARRÊTER LA PENDULE
// ======================================

function stopClock(){

    if(clockInterval !== null){

        clearInterval(
            clockInterval
        );

        clockInterval = null;

    }

}


// ======================================
// AJOUTER L'INCRÉMENT
// ======================================

function addIncrement(player){

    if(selectedIncrement <= 0){

        return;

    }


    if(player === "white"){

        whiteTime +=
            selectedIncrement;

    }

    else{

        blackTime +=
            selectedIncrement;

    }


    updateClocks();

}


// ======================================
// SAUVEGARDER POSITION
// ======================================

function saveGameState(){

    return {

        pieces:
            pieces.map(
                row => [...row]
            ),

        currentPlayer:
            currentPlayer,

        gameOver:
            gameOver,

        lastMove:
            lastMove
            ? {...lastMove}
            : null,

        whiteKingMoved:
            whiteKingMoved,

        blackKingMoved:
            blackKingMoved,

        whiteRookLeftMoved:
            whiteRookLeftMoved,

        whiteRookRightMoved:
            whiteRookRightMoved,

        blackRookLeftMoved:
            blackRookLeftMoved,

        blackRookRightMoved:
            blackRookRightMoved,

        whiteTime:
            whiteTime,

        blackTime:
            blackTime,

        clockStarted:
            clockStarted,

        moveNumber:
            moveNumber,

        whiteMoveNotation:
            whiteMoveNotation,

        movesHTML:
            document.getElementById("moves")
            ? document.getElementById("moves").innerHTML
            : ""

    };

}


// ======================================
// RESTAURER POSITION
// ======================================

function restoreGameState(state){

    pieces =
        state.pieces.map(
            row => [...row]
        );


    currentPlayer =
        state.currentPlayer;


    gameOver =
        state.gameOver;


    lastMove =
        state.lastMove
        ? {...state.lastMove}
        : null;


    whiteKingMoved =
        state.whiteKingMoved;


    blackKingMoved =
        state.blackKingMoved;


    whiteRookLeftMoved =
        state.whiteRookLeftMoved;


    whiteRookRightMoved =
        state.whiteRookRightMoved;


    blackRookLeftMoved =
        state.blackRookLeftMoved;


    blackRookRightMoved =
        state.blackRookRightMoved;


    whiteTime =
        state.whiteTime;


    blackTime =
        state.blackTime;


    clockStarted =
        state.clockStarted;


    moveNumber =
        state.moveNumber;


    whiteMoveNotation =
        state.whiteMoveNotation;


    const moves =
        document.getElementById(
            "moves"
        );


    if(moves){

        moves.innerHTML =
            state.movesHTML;

    }


    selectedRow = null;

    selectedCol = null;

    possibleMoves = [];

    arrows = [];

    drawingArrow = null;


    drawBoard();


    if(
        clockStarted &&
        !gameOver
    ){

        startClock();

    }

    else{

        stopClock();

    }


    updateClocks();

    updateGameStatus();

}


// ======================================
// DESSINER LE PLATEAU
// ======================================

function drawBoard(){

    if(!board){

        return;

    }


    board.innerHTML = "";


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


            square.classList.add(
                "square"
            );


            square.dataset.row = row;

            square.dataset.col = col;


            if(
                (row + col) % 2 === 0
            ){

                square.classList.add(
                    "white"
                );

            }

            else{

                square.classList.add(
                    "black"
                );

            }


            if(
                pieces[row][col] === "♔" &&
                isKingInCheck("white")
            ){

                square.classList.add(
                    "king-in-check"
                );

            }


            if(
                pieces[row][col] === "♚" &&
                isKingInCheck("black")
            ){

                square.classList.add(
                    "king-in-check"
                );

            }


            if(
                row === selectedRow &&
                col === selectedCol
            ){

                square.style.outline =
                    "4px solid yellow";

            }


            if(
                markedSquare !== null &&
                markedSquare.row === row &&
                markedSquare.col === col
            ){

                square.classList.add(
                    "marked-square"
                );

            }


            for(
                let move of possibleMoves
            ){

                if(
                    move[0] === row &&
                    move[1] === col
                ){

                    square.classList.add(
                        "possible-move"
                    );

                }

            }


            if(
                pieces[row][col] !== ""
            ){

                const piece =
                    document.createElement(
                        "span"
                    );


                piece.classList.add(
                    "piece"
                );


                piece.textContent =
                    pieces[row][col];


                if(
                    isBlackPiece(
                        pieces[row][col]
                    )
                ){

                    piece.classList.add(
                        "black-piece"
                    );

                }

                else if(
                    isWhitePiece(
                        pieces[row][col]
                    )
                ){

                    piece.classList.add(
                        "white-piece"
                    );

                }


                square.appendChild(
                    piece
                );

            }


            square.addEventListener(
                "click",
                function(){

                    clearArrows();

                    clickSquare(
                        row,
                        col
                    );

                }
            );


            board.appendChild(
                square
            );

        }

    }


    applyBoardSize();

    drawArrows();

}


// ======================================
// CLIC DROIT — MARQUAGE
// ======================================

board.addEventListener(
    "contextmenu",
    function(event){

        event.preventDefault();


        const square =
            getSquareFromMouse(
                event
            );


        if(!square){

            return;

        }


        if(
            markedSquare !== null &&
            markedSquare.row === square.row &&
            markedSquare.col === square.col
        ){

            markedSquare = null;

        }

        else{

            markedSquare = {

                row: square.row,

                col: square.col

            };

        }


        drawBoard();

    }
);


// ======================================
// VÉRIFIER COUP LÉGAL
// ======================================

function isMoveLegal(
    fromRow,
    fromCol,
    toRow,
    toCol
){

    const movingPiece =
        pieces[fromRow][fromCol];


    const capturedPiece =
        pieces[toRow][toCol];


    const color =
        isWhitePiece(
            movingPiece
        )
        ? "white"
        : "black";


    pieces[toRow][toCol] =
        movingPiece;


    pieces[fromRow][fromCol] =
        "";


    const kingInCheck =
        isKingInCheck(color);


    pieces[fromRow][fromCol] =
        movingPiece;


    pieces[toRow][toCol] =
        capturedPiece;


    return !kingInCheck;

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
    captured
){

    const files =
        [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"
        ];


    const destination =
        files[toCol]
        +
        (8 - toRow);


    if(
        piece === "♙" ||
        piece === "♟"
    ){

        if(captured){

            return (
                files[fromCol]
                +
                "x"
                +
                destination
            );

        }


        return destination;

    }


    let letter = "";


    if(
        piece === "♘" ||
        piece === "♞"
    ){

        letter = "N";

    }

    else if(
        piece === "♗" ||
        piece === "♝"
    ){

        letter = "B";

    }

    else if(
        piece === "♖" ||
        piece === "♜"
    ){

        letter = "R";

    }

    else if(
        piece === "♕" ||
        piece === "♛"
    ){

        letter = "Q";

    }

    else if(
        piece === "♔" ||
        piece === "♚"
    ){

        letter = "K";

    }


    if(captured){

        return (
            letter
            +
            "x"
            +
            destination
        );

    }


    return (
        letter
        +
        destination
    );

}


// ======================================
// AFFICHER LES COUPS
// ======================================

function addMoveToList(
    notation,
    player
){

    const moves =
        document.getElementById(
            "moves"
        );


    if(!moves){

        return;

    }


    if(player === "white"){

        whiteMoveNotation =
            notation;

    }

    else{

        const moveElement =
            document.createElement(
                "div"
            );


        moveElement.classList.add(
            "move-row"
        );


        moveElement.textContent =
            moveNumber
            +
            ". "
            +
            whiteMoveNotation
            +
            " - "
            +
            notation;


        moves.appendChild(
            moveElement
        );


        moveNumber++;


        whiteMoveNotation =
            null;

    }

}


// ======================================
// CLIC SUR UNE CASE
// ======================================

function clickSquare(row,col){

    markedSquare = null;


    if(gameOver){

        return;

    }


    // ==================================
    // BLOQUER LE JOUEUR PENDANT FARIS
    // ==================================

    if(
        isFarisTurn()
    ){

        console.log(
            "🤖 C'est le tour de Faris."
        );

        return;

    }


    // ==================================
    // FARIS RÉFLÉCHIT
    // ==================================

    if(
        typeof farisThinking !== "undefined" &&
        farisThinking
    ){

        return;

    }


    // ==================================
    // PREMIER CLIC
    // ==================================

    if(selectedRow === null){

        // ==============================
        // LE JOUEUR DOIT JOUER SA COULEUR
        // ==============================

        if(
            !isHumanTurn()
        ){

            return;

        }


        if(
            getHumanColor() === "white" &&
            !isWhitePiece(
                pieces[row][col]
            )
        ){

            return;

        }


        if(
            getHumanColor() === "black" &&
            !isBlackPiece(
                pieces[row][col]
            )
        ){

            return;

        }


        if(
            pieces[row][col] === ""
        ){

            return;

        }


        selectedRow = row;

        selectedCol = col;


        possibleMoves =
            getPossibleMoves(
                row,
                col
            )
            .filter(
                move =>
                    isMoveLegal(
                        row,
                        col,
                        move[0],
                        move[1]
                    )
            );


        drawBoard();

        return;

    }


    // ==================================
    // DEUXIÈME CLIC
    // ==================================

    let moveAllowed = false;


    for(
        const move of possibleMoves
    ){

        if(
            move[0] === row &&
            move[1] === col
        ){

            moveAllowed = true;

            break;

        }

    }


    // ==================================
    // MÊME CASE
    // ==================================

    if(
        row === selectedRow &&
        col === selectedCol
    ){

        selectedRow = null;

        selectedCol = null;

        possibleMoves = [];

        drawBoard();

        return;

    }


    // ==================================
    // COUP INTERDIT
    // ==================================

    if(!moveAllowed){

        selectedRow = null;

        selectedCol = null;

        possibleMoves = [];

        drawBoard();

        return;

    }


    // ==================================
    // PIÈCE
    // ==================================

    const movingPiece =
        pieces[selectedRow][selectedCol];


    const capturedPiece =
        pieces[row][col] !== "";


    const movePlayer =
        currentPlayer;


    // ==================================
    // SÉCURITÉ COULEUR
    // ==================================

    if(
        movePlayer !== getHumanColor()
    ){

        selectedRow = null;

        selectedCol = null;

        possibleMoves = [];

        drawBoard();

        return;

    }


    // ==================================
    // VÉRIFICATION
    // ==================================

    if(
        !isMoveLegal(
            selectedRow,
            selectedCol,
            row,
            col
        )
    ){

        selectedRow = null;

        selectedCol = null;

        possibleMoves = [];

        drawBoard();

        return;

    }


    // ==================================
    // HISTORIQUE
    // ==================================

    moveHistory.push(
        saveGameState()
    );


    // ==================================
    // NOTATION
    // ==================================

    let notation =
        getMoveNotation(

            movingPiece,

            selectedRow,
            selectedCol,

            row,
            col,

            capturedPiece

        );


    // ==================================
    // PETIT ROQUE BLANC
    // ==================================

    if(
        movingPiece === "♔" &&
        selectedRow === 7 &&
        selectedCol === 4 &&
        row === 7 &&
        col === 6
    ){

        pieces[7][5] =
            pieces[7][7];

        pieces[7][7] =
            "";

        notation =
            "O-O";

    }


    // ==================================
    // GRAND ROQUE BLANC
    // ==================================

    if(
        movingPiece === "♔" &&
        selectedRow === 7 &&
        selectedCol === 4 &&
        row === 7 &&
        col === 2
    ){

        pieces[7][3] =
            pieces[7][0];

        pieces[7][0] =
            "";

        notation =
            "O-O-O";

    }


    // ==================================
    // PETIT ROQUE NOIR
    // ==================================

    if(
        movingPiece === "♚" &&
        selectedRow === 0 &&
        selectedCol === 4 &&
        row === 0 &&
        col === 6
    ){

        pieces[0][5] =
            pieces[0][7];

        pieces[0][7] =
            "";

        notation =
            "O-O";

    }


    // ==================================
    // GRAND ROQUE NOIR
    // ==================================

    if(
        movingPiece === "♚" &&
        selectedRow === 0 &&
        selectedCol === 4 &&
        row === 0 &&
        col === 2
    ){

        pieces[0][3] =
            pieces[0][0];

        pieces[0][0] =
            "";

        notation =
            "O-O-O";

    }


    // ==================================
    // EN PASSANT BLANC
    // ==================================

    if(
        movingPiece === "♙" &&
        selectedRow === 3 &&
        row === 2 &&
        Math.abs(
            col - selectedCol
        ) === 1 &&
        pieces[row][col] === ""
    ){

        pieces[3][col] =
            "";

    }


    // ==================================
    // EN PASSANT NOIR
    // ==================================

    if(
        movingPiece === "♟" &&
        selectedRow === 4 &&
        row === 5 &&
        Math.abs(
            col - selectedCol
        ) === 1 &&
        pieces[row][col] === ""
    ){

        pieces[4][col] =
            "";

    }


    // ==================================
    // DÉPLACEMENT
    // ==================================

    pieces[row][col] =
        pieces[selectedRow][selectedCol];


    pieces[selectedRow][selectedCol] =
        "";


    // ==================================
    // PROMOTION BLANCHE
    // ==================================

    if(
        movingPiece === "♙" &&
        row === 0
    ){

        promotePawn(
            row,
            col,
            "white"
        );

    }


    // ==================================
    // PROMOTION NOIRE
    // ==================================

    if(
        movingPiece === "♟" &&
        row === 7
    ){

        promotePawn(
            row,
            col,
            "black"
        );

    }


    // ==================================
    // DERNIER COUP
    // ==================================

    lastMove = {

        piece:
            movingPiece,

        fromRow:
            selectedRow,

        fromCol:
            selectedCol,

        toRow:
            row,

        toCol:
            col

    };


    // ==================================
    // ROIS
    // ==================================

    if(movingPiece === "♔"){

        whiteKingMoved = true;

    }


    if(movingPiece === "♚"){

        blackKingMoved = true;

    }


    // ==================================
    // TOURS BLANCHES
    // ==================================

    if(
        movingPiece === "♖" &&
        selectedRow === 7 &&
        selectedCol === 0
    ){

        whiteRookLeftMoved = true;

    }


    if(
        movingPiece === "♖" &&
        selectedRow === 7 &&
        selectedCol === 7
    ){

        whiteRookRightMoved = true;

    }


    // ==================================
    // TOURS NOIRES
    // ==================================

    if(
        movingPiece === "♜" &&
        selectedRow === 0 &&
        selectedCol === 0
    ){

        blackRookLeftMoved = true;

    }


    if(
        movingPiece === "♜" &&
        selectedRow === 0 &&
        selectedCol === 7
    ){

        blackRookRightMoved = true;

    }


    // ==================================
    // NOTATION
    // ==================================

    addMoveToList(
        notation,
        movePlayer
    );


    // ==================================
    // INCRÉMENT
    // ==================================

    addIncrement(
        movePlayer
    );


    // ==================================
    // CHRONOMÈTRE
    // ==================================

    if(!clockStarted){

        clockStarted = true;

        startClock();

    }


    // ==================================
    // CHANGER DE JOUEUR
    // ==================================

    currentPlayer =
        currentPlayer === "white"
            ? "black"
            : "white";


    // ==================================
    // DÉSÉLECTION
    // ==================================

    selectedRow = null;

    selectedCol = null;

    possibleMoves = [];


    // ==================================
    // FLÈCHES
    // ==================================

    clearArrows();


    // ==================================
    // AFFICHAGE
    // ==================================

    drawBoard();

    updateGameStatus();


    // ==================================
    // FARIS AI
    // ==================================
    //
    // IMPORTANT :
    // On ne regarde PLUS si le coup vient
    // des blancs.
    //
    // On regarde simplement :
    //
    // currentPlayer === farisColor
    //
    // Cela permet à Faris d'être blanc OU noir.
    //

    if(
        currentPlayer === getFarisColor() &&
        !gameOver &&
        typeof farisPlay === "function"
    ){

        console.log(
            "🤖 Lancement automatique de Faris..."
        );


        setTimeout(
            function(){

                if(
                    !gameOver &&
                    currentPlayer === getFarisColor() &&
                    typeof farisPlay === "function"
                ){

                    farisPlay();

                }

            },
            100
        );

    }

}


// ======================================
// PROMOTION
// ======================================

function promotePawn(
    row,
    col,
    color
){

    let choice =
        prompt(
            "Promotion : Q = Dame, R = Tour, B = Fou, N = Cavalier",
            "Q"
        );


    if(!choice){

        choice = "Q";

    }


    choice =
        choice.toUpperCase();


    let promotedPiece;


    if(choice === "R"){

        promotedPiece =
            color === "white"
            ? "♖"
            : "♜";

    }

    else if(choice === "B"){

        promotedPiece =
            color === "white"
            ? "♗"
            : "♝";

    }

    else if(choice === "N"){

        promotedPiece =
            color === "white"
            ? "♘"
            : "♞";

    }

    else{

        promotedPiece =
            color === "white"
            ? "♕"
            : "♛";

    }


    pieces[row][col] =
        promotedPiece;

}


// ======================================
// ÉCHEC ET MAT
// ======================================

function isCheckmate(color){

    if(!isKingInCheck(color)){

        return false;

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
                color === "white" &&
                !isWhitePiece(piece)
            ){

                continue;

            }


            if(
                color === "black" &&
                !isBlackPiece(piece)
            ){

                continue;

            }


            if(piece === ""){

                continue;

            }


            const moves =
                getPossibleMoves(
                    row,
                    col
                );


            for(
                let move of moves
            ){

                if(
                    isMoveLegal(
                        row,
                        col,
                        move[0],
                        move[1]
                    )
                ){

                    return false;

                }

            }

        }

    }


    return true;

}


// ======================================
// ÉTAT DU JEU
// ======================================

function updateGameStatus(){

    const turn =
        document.querySelector(
            ".turn"
        );


    if(!turn){

        return;

    }


    if(isCheckmate("white")){

        finishGame(
            "👑 CHECKMATE ! BLACK WINS !"
        );

        return;

    }


    if(isCheckmate("black")){

        finishGame(
            "👑 CHECKMATE ! WHITE WINS !"
        );

        return;

    }


    if(isKingInCheck("white")){

        turn.textContent =
            "🚨 CHECK ! WHITE KING !";

        return;

    }


    if(isKingInCheck("black")){

        turn.textContent =
            "🚨 CHECK ! BLACK KING !";

        return;

    }


    if(currentPlayer === "white"){

        turn.textContent =
            "⚪ White to move";

    }

    else{

        turn.textContent =
            "⚫ Black to move";

    }

}


// ======================================
// TERMINER PARTIE
// ======================================

function finishGame(message){

    gameOver = true;

    stopClock();


    if(
        typeof farisMoveToken !== "undefined"
    ){

        farisMoveToken++;

    }


    if(
        typeof farisThinking !== "undefined"
    ){

        farisThinking = false;

    }


    const turn =
        document.querySelector(
            ".turn"
        );


    if(turn){

        turn.textContent =
            message;

    }


    showGameResult(message);

}


// ======================================
// ÉCRAN RÉSULTAT
// ======================================

function showGameResult(message){

    let result =
        document.getElementById(
            "gameResult"
        );


    if(!result){

        result =
            document.createElement(
                "div"
            );


        result.id =
            "gameResult";


        result.innerHTML = `

            <div class="result-box">

                <div class="result-title">
                    🏆 GAME OVER
                </div>

                <div
                    class="result-message"
                    id="resultMessage">
                </div>

                <div class="result-buttons">

                    <button
                        id="resultRestartButton">
                        🔄 Nouvelle partie
                    </button>

                    <button
                        id="resultCloseButton">
                        ✕ Fermer
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            result
        );


        document
            .getElementById(
                "resultRestartButton"
            )
            .addEventListener(
                "click",
                restartGame
            );


        document
            .getElementById(
                "resultCloseButton"
            )
            .addEventListener(
                "click",
                closeGameResult
            );

    }


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if(resultMessage){

        resultMessage.textContent =
            message;

    }


    result.classList.add(
        "show"
    );

}


// ======================================
// FERMER RÉSULTAT
// ======================================

function closeGameResult(){

    const result =
        document.getElementById(
            "gameResult"
        );


    if(result){

        result.classList.remove(
            "show"
        );

    }

}


// ======================================
// ABANDONNER
// ======================================

function resignGame(){

    if(gameOver){

        return;

    }


    let winner;


    if(currentPlayer === "white"){

        winner =
            "BLACK WINS";

    }

    else{

        winner =
            "WHITE WINS";

    }


    const answer =
        confirm(
            "🏳️ Êtes-vous sûr de vouloir abandonner ?"
        );


    if(!answer){

        return;

    }


    finishGame(
        "🏳️ RESIGNATION — "
        +
        winner
        +
        " !"
    );

}


// ======================================
// NULLE
// ======================================

function offerDraw(){

    if(gameOver){

        return;

    }


    const answer =
        confirm(
            "🤝 Voulez-vous proposer une nulle ?"
        );


    if(!answer){

        return;

    }


    const opponent =
        confirm(
            "🤝 L'adversaire accepte-t-il la nulle ?"
        );


    if(opponent){

        finishGame(
            "🤝 NULLE — PARTIE TERMINÉE"
        );

    }

}


// ======================================
// UNDO
// ======================================

function undoMove(){

    if(
        moveHistory.length === 0
    ){

        alert(
            "↩️ Aucun coup à annuler."
        );

        return;

    }


    if(gameOver){

        gameOver = false;

        closeGameResult();

    }


    if(
        typeof resetFarisAI === "function"
    ){

        resetFarisAI();

    }


    const previousState =
        moveHistory.pop();


    restoreGameState(
        previousState
    );


    // ==================================
    // SI FARIS EST À NOUVEAU AU TRAIT
    // ==================================

    if(
        !gameOver &&
        currentPlayer === getFarisColor() &&
        typeof farisPlay === "function"
    ){

        setTimeout(
            farisPlay,
            150
        );

    }

}


// ======================================
// NOUVELLE PARTIE
// ======================================

function restartGame(){

    const answer =
        confirm(
            "🔄 Recommencer la partie ?"
        );


    if(!answer){

        return;

    }


    stopClock();


    if(
        typeof resetFarisAI === "function"
    ){

        resetFarisAI();

    }


    // ==================================
    // RESET PIÈCES
    // ==================================

    pieces =
        initialPieces.map(
            row => [...row]
        );


    // ==================================
    // RESET SÉLECTION
    // ==================================

    selectedRow = null;

    selectedCol = null;

    possibleMoves = [];

    markedSquare = null;


    // ==================================
    // RESET JOUEUR
    // ==================================

    currentPlayer = "white";


    // ==================================
    // RESET PARTIE
    // ==================================

    gameOver = false;

    lastMove = null;


    // ==================================
    // RESET ROQUE
    // ==================================

    whiteKingMoved = false;

    blackKingMoved = false;

    whiteRookLeftMoved = false;

    whiteRookRightMoved = false;

    blackRookLeftMoved = false;

    blackRookRightMoved = false;


    // ==================================
    // RESET TEMPS
    // ==================================

    whiteTime =
        selectedGameTime;

    blackTime =
        selectedGameTime;


    clockStarted = false;


    // ==================================
    // RESET NOTATION
    // ==================================

    moveNumber = 1;

    whiteMoveNotation = null;


    // ==================================
    // RESET HISTORIQUE
    // ==================================

    moveHistory = [];


    // ==================================
    // RESET FLÈCHES
    // ==================================

    arrows = [];

    drawingArrow = null;


    // ==================================
    // RESET COUPS
    // ==================================

    const moves =
        document.getElementById(
            "moves"
        );


    if(moves){

        moves.innerHTML = "";

    }


    // ==================================
    // FERMER RÉSULTAT
    // ==================================

    closeGameResult();


    // ==================================
    // AFFICHAGE
    // ==================================

    updateClocks();

    drawBoard();

    updateGameStatus();


    // ==================================
    // SI FARIS EST BLANC
    // ==================================

    if(
        getFarisColor() === "white" &&
        typeof farisPlay === "function"
    ){

        setTimeout(
            function(){

                if(
                    !gameOver &&
                    currentPlayer === "white"
                ){

                    farisPlay();

                }

            },
            400
        );

    }

}


// ======================================
// ACCUEIL
// ======================================

function goHome(){

    window.location.href =
        "../index.html";

}


// ======================================
// TAILLE DE L'ÉCHIQUIER
// ======================================

const increaseBoard =
    document.getElementById(
        "increaseBoard"
    );


const decreaseBoard =
    document.getElementById(
        "decreaseBoard"
    );


const boardSizeLabel =
    document.getElementById(
        "boardSizeLabel"
    );


let boardSize = 60;


// ======================================
// APPLIQUER TAILLE
// ======================================

function applyBoardSize(){

    if(!board){

        return;

    }


    const boardPixels =
        boardSize * 8;


    board.style.width =
        boardPixels + "px";


    board.style.height =
        boardPixels + "px";


    board.style.gridTemplateColumns =
        `repeat(8, ${boardSize}px)`;


    board.style.gridTemplateRows =
        `repeat(8, ${boardSize}px)`;


    const squares =
        board.querySelectorAll(
            ".square"
        );


    squares.forEach(
        function(square){

            square.style.width =
                boardSize + "px";

            square.style.height =
                boardSize + "px";

        }
    );


    const piecesHTML =
        board.querySelectorAll(
            ".piece"
        );


    const pieceSize =
        Math.max(
            25,
            Math.round(
                boardSize * 0.75
            )
        );


    piecesHTML.forEach(
        function(piece){

            piece.style.fontSize =
                pieceSize + "px";

        }
    );


    const numbers =
        document.querySelector(
            ".numbers"
        );


    if(numbers){

        numbers.style.height =
            boardPixels + "px";

        numbers.style.width =
            "25px";


        const numberSpans =
            numbers.querySelectorAll(
                "span"
            );


        numberSpans.forEach(
            function(span){

                span.style.height =
                    boardSize + "px";

            }
        );

    }


    const letters =
        document.querySelector(
            ".letters"
        );


    if(letters){

        letters.style.width =
            boardPixels + "px";


        letters.style.gridTemplateColumns =
            `repeat(8, ${boardSize}px)`;


        const letterSpans =
            letters.querySelectorAll(
                "span"
            );


        letterSpans.forEach(
            function(span){

                span.style.width =
                    boardSize + "px";

            }
        );

    }


    const players =
        document.querySelectorAll(
            ".player"
        );


    players.forEach(
        function(player){

            player.style.width =
                boardPixels + "px";

        }
    );


    if(boardSizeLabel){

        boardSizeLabel.textContent =
            boardSize;

    }

}


// ======================================
// AGRANDIR
// ======================================

if(increaseBoard){

    increaseBoard.addEventListener(
        "click",
        function(){

            if(boardSize < 90){

                boardSize += 5;

                applyBoardSize();

                drawArrows();

            }

        }
    );

}


// ======================================
// RÉDUIRE
// ======================================

if(decreaseBoard){

    decreaseBoard.addEventListener(
        "click",
        function(){

            if(boardSize > 40){

                boardSize -= 5;

                applyBoardSize();

                drawArrows();

            }

        }
    );

}


// ======================================
// COORDONNÉES SOURIS
// ======================================

function getSquareFromMouse(event){

    const rect =
        board.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left;


    const y =
        event.clientY -
        rect.top;


    if(
        x < 0 ||
        y < 0 ||
        x > rect.width ||
        y > rect.height
    ){

        return null;

    }


    const squareWidth =
        rect.width / 8;


    const squareHeight =
        rect.height / 8;


    const col =
        Math.floor(
            x / squareWidth
        );


    const row =
        Math.floor(
            y / squareHeight
        );


    if(
        row < 0 ||
        row > 7 ||
        col < 0 ||
        col > 7
    ){

        return null;

    }


    return {

        row: row,

        col: col

    };

}


// ======================================
// COULEUR DU THÈME
// ======================================

function getChessAccentColor(){

    const root =
        getComputedStyle(
            document.documentElement
        );


    const body =
        getComputedStyle(
            document.body
        );


    const variables = [

        "--accent-color",

        "--theme-color",

        "--primary-color",

        "--accent",

        "--red",

        "--main-color"

    ];


    for(
        const variable of variables
    ){

        const rootValue =
            root
                .getPropertyValue(
                    variable
                )
                .trim();


        if(rootValue){

            return rootValue;

        }


        const bodyValue =
            body
                .getPropertyValue(
                    variable
                )
                .trim();


        if(bodyValue){

            return bodyValue;

        }

    }


    const theme =
        document.documentElement.dataset.theme ||
        document.body.dataset.theme ||
        "red";


    const colors = {

        red: "#ff3030",

        rouge: "#ff3030",

        blue: "#3b82f6",

        bleu: "#3b82f6",

        green: "#22c55e",

        vert: "#22c55e",

        purple: "#a855f7",

        violet: "#a855f7",

        orange: "#f97316",

        yellow: "#eab308",

        gold: "#eab308",

        pink: "#ec4899"

    };


    return (
        colors[
            String(theme)
                .toLowerCase()
        ]
        ||
        "#ff3030"
    );

}


// ======================================
// CRÉER SVG FLÈCHES
// ======================================

function createArrowSVG(){

    let svg =
        document.getElementById(
            "chessArrows"
        );


    if(svg){

        return svg;

    }


    svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    svg.id =
        "chessArrows";


    svg.style.position =
        "absolute";


    svg.style.left =
        "0";


    svg.style.top =
        "0";


    svg.style.width =
        "100%";


    svg.style.height =
        "100%";


    svg.style.pointerEvents =
        "none";


    svg.style.zIndex =
        "50";


    if(board.parentElement){

        board.parentElement.appendChild(
            svg
        );

    }


    return svg;

}


// ======================================
// DESSINER UNE FLÈCHE
// ======================================

function drawSingleArrow(
    svg,
    arrow
){

    if(!arrow){

        return;

    }


    if(
        arrow.fromRow === arrow.toRow &&
        arrow.fromCol === arrow.toCol
    ){

        return;

    }


    const rect =
        board.getBoundingClientRect();


    const squareWidth =
        rect.width / 8;


    const squareHeight =
        rect.height / 8;


    const startX =
        (
            arrow.fromCol + 0.5
        )
        *
        squareWidth;


    const startY =
        (
            arrow.fromRow + 0.5
        )
        *
        squareHeight;


    const endX =
        (
            arrow.toCol + 0.5
        )
        *
        squareWidth;


    const endY =
        (
            arrow.toRow + 0.5
        )
        *
        squareHeight;


    const dx =
        endX - startX;


    const dy =
        endY - startY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if(distance <= 0){

        return;

    }


    const startOffset =
        Math.min(
            squareWidth * 0.18,
            distance * 0.12
        );


    const endOffset =
        Math.min(
            squareWidth * 0.25,
            distance * 0.18
        );


    const startRatio =
        startOffset / distance;


    const endRatio =
        endOffset / distance;


    const finalStartX =
        startX +
        dx *
        startRatio;


    const finalStartY =
        startY +
        dy *
        startRatio;


    const finalEndX =
        endX -
        dx *
        endRatio;


    const finalEndY =
        endY -
        dy *
        endRatio;


    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "x1",
        finalStartX
    );


    line.setAttribute(
        "y1",
        finalStartY
    );


    line.setAttribute(
        "x2",
        finalEndX
    );


    line.setAttribute(
        "y2",
        finalEndY
    );


    const color =
        getChessAccentColor();


    line.setAttribute(
        "stroke",
        color
    );


    line.setAttribute(
        "stroke-width",
        Math.max(
            4,
            squareWidth * 0.075
        )
    );


    line.setAttribute(
        "stroke-linecap",
        "round"
    );


    line.setAttribute(
        "stroke-linejoin",
        "round"
    );


    line.setAttribute(
        "opacity",
        "0.92"
    );


    line.setAttribute(
        "marker-end",
        "url(#chessArrowHead)"
    );


    line.style.filter =
        "drop-shadow(0 0 5px "
        +
        color
        +
        ")";


    svg.appendChild(
        line
    );

}


// ======================================
// DESSINER TOUTES LES FLÈCHES
// ======================================

function drawArrows(){

    const svg =
        createArrowSVG();


    if(!svg){

        return;

    }


    svg.innerHTML =
        "";


    const color =
        getChessAccentColor();


    const defs =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "defs"
        );


    const marker =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "marker"
        );


    marker.id =
        "chessArrowHead";


    marker.setAttribute(
        "markerWidth",
        "10"
    );


    marker.setAttribute(
        "markerHeight",
        "10"
    );


    marker.setAttribute(
        "refX",
        "8"
    );


    marker.setAttribute(
        "refY",
        "5"
    );


    marker.setAttribute(
        "orient",
        "auto"
    );


    marker.setAttribute(
        "markerUnits",
        "userSpaceOnUse"
    );


    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );


    polygon.setAttribute(
        "points",
        "0,0 10,5 0,10"
    );


    polygon.setAttribute(
        "fill",
        color
    );


    polygon.style.filter =
        "drop-shadow(0 0 4px "
        +
        color
        +
        ")";


    marker.appendChild(
        polygon
    );


    defs.appendChild(
        marker
    );


    svg.appendChild(
        defs
    );


    if(lastMove){

        drawSingleArrow(
            svg,
            lastMove
        );

    }


    if(
        Array.isArray(arrows)
    ){

        for(
            const arrow of arrows
        ){

            drawSingleArrow(
                svg,
                arrow
            );

        }

    }


    if(drawingArrow){

        drawSingleArrow(
            svg,
            drawingArrow
        );

    }

}


// ======================================
// EFFACER FLÈCHES MANUELLES
// ======================================

function clearArrows(){

    arrows = [];

    drawingArrow = null;

    drawArrows();

}


// ======================================
// CLIC GAUCHE / DROIT
// ======================================

board.addEventListener(
    "mousedown",
    function(event){

        if(event.button === 0){

            if(
                Array.isArray(arrows) &&
                arrows.length > 0
            ){

                arrows = [];

                drawArrows();

            }

            return;

        }


        if(event.button !== 2){

            return;

        }


        event.preventDefault();


        const square =
            getSquareFromMouse(
                event
            );


        if(!square){

            return;

        }


        drawingArrow = {

            fromRow:
                square.row,

            fromCol:
                square.col,

            toRow:
                square.row,

            toCol:
                square.col

        };


        drawArrows();

    }
);


// ======================================
// SOURIS — DÉPLACEMENT
// ======================================

board.addEventListener(
    "mousemove",
    function(event){

        if(!drawingArrow){

            return;

        }


        const square =
            getSquareFromMouse(
                event
            );


        if(!square){

            return;

        }


        drawingArrow.toRow =
            square.row;


        drawingArrow.toCol =
            square.col;


        drawArrows();

    }
);


// ======================================
// SOURIS — FIN FLÈCHE
// ======================================

document.addEventListener(
    "mouseup",
    function(event){

        if(event.button !== 2){

            return;

        }


        if(!drawingArrow){

            return;

        }


        event.preventDefault();


        const square =
            getSquareFromMouse(
                event
            );


        if(square){

            drawingArrow.toRow =
                square.row;

            drawingArrow.toCol =
                square.col;

        }


        if(
            drawingArrow.fromRow !==
                drawingArrow.toRow ||

            drawingArrow.fromCol !==
                drawingArrow.toCol
        ){

            arrows.push({

                fromRow:
                    drawingArrow.fromRow,

                fromCol:
                    drawingArrow.fromCol,

                toRow:
                    drawingArrow.toRow,

                toCol:
                    drawingArrow.toCol

            });

        }


        drawingArrow = null;


        drawArrows();

    }
);


// ======================================
// EMPÊCHER MENU CLIC DROIT
// ======================================

board.addEventListener(
    "contextmenu",
    function(event){

        event.preventDefault();

    }
);


// ======================================
// CHANGEMENT AUTOMATIQUE DU THÈME
// ======================================

const chessThemeObserver =
    new MutationObserver(
        function(){

            drawArrows();

        }
    );


chessThemeObserver.observe(
    document.documentElement,
    {

        attributes: true,

        attributeFilter: [

            "class",

            "data-theme",

            "style"

        ]

    }
);


chessThemeObserver.observe(
    document.body,
    {

        attributes: true,

        attributeFilter: [

            "class",

            "data-theme",

            "style"

        ]

    }
);


// ======================================
// REDIMENSIONNEMENT FENÊTRE
// ======================================

window.addEventListener(
    "resize",
    function(){

        drawArrows();

    }
);


// ======================================
// BOUTON UNDO
// ======================================

const undoButton =
    document.getElementById(
        "undoButton"
    );


if(undoButton){

    undoButton.addEventListener(
        "click",
        undoMove
    );

}


// ======================================
// BOUTON ABANDON
// ======================================

const resignButton =
    document.getElementById(
        "resignButton"
    );


if(resignButton){

    resignButton.addEventListener(
        "click",
        resignGame
    );

}


// ======================================
// BOUTON NULLE
// ======================================

const drawButton =
    document.getElementById(
        "drawButton"
    );


if(drawButton){

    drawButton.addEventListener(
        "click",
        offerDraw
    );

}


// ======================================
// BOUTON ACCUEIL
// ======================================

const homeButton =
    document.getElementById(
        "homeButton"
    );


if(homeButton){

    homeButton.addEventListener(
        "click",
        goHome
    );

}


// ======================================
// CLAVIER
// ======================================

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key === "ArrowLeft"
        ){

            undoMove();

        }

    }
);


// ======================================
// DÉMARRAGE
// ======================================

drawBoard();

updateGameStatus();

updateClocks();

applyBoardSize();

drawArrows();


// ======================================
// FARIS BLANC AU DÉMARRAGE
// ======================================
//
// Si l'URL contient :
//
// ?faris=18&color=white
//
// Faris joue automatiquement 1.e4.
//
// Si :
//
// ?faris=18&color=black
//
// le joueur joue les blancs normalement.
//

setTimeout(
    function(){

        if(
            !gameOver &&
            getFarisColor() === "white" &&
            currentPlayer === "white" &&
            typeof farisPlay === "function"
        ){

            console.log(
                "🤖 FARIS EST BLANC → IL COMMENCE"
            );


            farisPlay();

        }

    },
    500
);


// ======================================
// DEBUG TIME CONTROL
// ======================================

console.log(
    "⏱️ CHESS_FK TIME CONTROL"
);

console.log(
    "🎯 Selected time:",
    selectedGameTime,
    "seconds"
);

console.log(
    "⏱️ Display:",
    formatTime(selectedGameTime)
);

console.log(
    "➕ Increment:",
    selectedIncrement,
    "seconds"
);


// ======================================
// DEBUG FARIS
// ======================================

console.log(
    "=========================================="
);

console.log(
    "🤖 CHESS_FK FARIS COLOR SYSTEM"
);

console.log(
    "🤖 Faris:",
    getFarisColor()
);

console.log(
    "👤 Human:",
    getHumanColor()
);

console.log(
    "🎯 Current player:",
    currentPlayer
);

console.log(
    "=========================================="
);


// ======================================
// CHESS_FK BOARD READY
// ======================================

console.log(
    "♟️ CHESS_FK BOARD ENGINE READY"
);

console.log(
    "🎯 Board size:",
    boardSize
);

console.log(
    "➡️ Arrow system: READY"
);