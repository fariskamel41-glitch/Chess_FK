// ======================================
// Chess_FK CHESS ENGINE
// pieces.js
// Toutes les règles des pièces
// ======================================


// ======================================
// TROUVER LES MOUVEMENTS POSSIBLES
// ======================================

function getPossibleMoves(row, col, checkingAttack = false){

    const piece = pieces[row][col];

    switch(piece){

        // ==================================
        // PION BLANC
        // ==================================

        case "♙":
            return getWhitePawnMoves(row, col);


        // ==================================
        // PION NOIR
        // ==================================

        case "♟":
            return getBlackPawnMoves(row, col);


        // ==================================
        // CAVALIER
        // ==================================

        case "♘":
        case "♞":
            return getKnightMoves(row, col);


        // ==================================
        // TOUR
        // ==================================

        case "♖":
        case "♜":
            return getRookMoves(row, col);


        // ==================================
        // FOU
        // ==================================

        case "♗":
        case "♝":
            return getBishopMoves(row, col);


        // ==================================
        // DAME
        // ==================================

        case "♕":
        case "♛":
            return getQueenMoves(row, col);


        // ==================================
        // ROI
        // ==================================

        case "♔":
        case "♚":
            return getKingMoves(row, col, checkingAttack);


        default:
            return [];

    }

}


// ======================================
// COULEUR DES PIÈCES
// ======================================

function isWhitePiece(piece){

    const whitePieces = [

        "♙",
        "♖",
        "♘",
        "♗",
        "♕",
        "♔"

    ];

    return whitePieces.includes(piece);

}


function isBlackPiece(piece){

    const blackPieces = [

        "♟",
        "♜",
        "♞",
        "♝",
        "♛",
        "♚"

    ];

    return blackPieces.includes(piece);

}


// ======================================
// PION BLANC
// ======================================

function getWhitePawnMoves(row, col){

    let moves = [];


    // ==================================
    // AVANCER D'UNE CASE
    // ==================================

    if(
        row > 0 &&
        pieces[row - 1][col] === ""
    ){

        moves.push([
            row - 1,
            col
        ]);

    }


    // ==================================
    // AVANCER DE DEUX CASES
    // ==================================

    if(
        row === 6 &&
        pieces[5][col] === "" &&
        pieces[4][col] === ""
    ){

        moves.push([
            4,
            col
        ]);

    }


    // ==================================
    // CAPTURE DIAGONALE GAUCHE
    // ==================================

    if(
        row > 0 &&
        col > 0 &&
        isBlackPiece(
            pieces[row - 1][col - 1]
        )
    ){

        moves.push([
            row - 1,
            col - 1
        ]);

    }


    // ==================================
    // CAPTURE DIAGONALE DROITE
    // ==================================

    if(
        row > 0 &&
        col < 7 &&
        isBlackPiece(
            pieces[row - 1][col + 1]
        )
    ){

        moves.push([
            row - 1,
            col + 1
        ]);

    }


    // ==================================
    // PRISE EN PASSANT
    // ==================================

    if(row === 3){

        // Gauche

        if(col > 0){

            if(
                pieces[row][col - 1] === "♟" &&
                lastMove !== null &&
                lastMove.piece === "♟" &&
                lastMove.fromRow === 1 &&
                lastMove.toRow === 3 &&
                lastMove.toCol === col - 1
            ){

                moves.push([
                    row - 1,
                    col - 1
                ]);

            }

        }


        // Droite

        if(col < 7){

            if(
                pieces[row][col + 1] === "♟" &&
                lastMove !== null &&
                lastMove.piece === "♟" &&
                lastMove.fromRow === 1 &&
                lastMove.toRow === 3 &&
                lastMove.toCol === col + 1
            ){

                moves.push([
                    row - 1,
                    col + 1
                ]);

            }

        }

    }


    return moves;

}


// ======================================
// PION NOIR
// ======================================

function getBlackPawnMoves(row, col){

    let moves = [];


    // ==================================
    // AVANCER D'UNE CASE
    // ==================================

    if(
        row < 7 &&
        pieces[row + 1][col] === ""
    ){

        moves.push([
            row + 1,
            col
        ]);

    }


    // ==================================
    // AVANCER DE DEUX CASES
    // ==================================

    if(
        row === 1 &&
        pieces[2][col] === "" &&
        pieces[3][col] === ""
    ){

        moves.push([
            3,
            col
        ]);

    }


    // ==================================
    // CAPTURE DIAGONALE GAUCHE
    // ==================================

    if(
        row < 7 &&
        col > 0 &&
        isWhitePiece(
            pieces[row + 1][col - 1]
        )
    ){

        moves.push([
            row + 1,
            col - 1
        ]);

    }


    // ==================================
    // CAPTURE DIAGONALE DROITE
    // ==================================

    if(
        row < 7 &&
        col < 7 &&
        isWhitePiece(
            pieces[row + 1][col + 1]
        )
    ){

        moves.push([
            row + 1,
            col + 1
        ]);

    }


    // ==================================
    // PRISE EN PASSANT
    // ==================================

    if(row === 4){

        // Gauche

        if(col > 0){

            if(
                pieces[row][col - 1] === "♙" &&
                lastMove !== null &&
                lastMove.piece === "♙" &&
                lastMove.fromRow === 6 &&
                lastMove.toRow === 4 &&
                lastMove.toCol === col - 1
            ){

                moves.push([
                    row + 1,
                    col - 1
                ]);

            }

        }


        // Droite

        if(col < 7){

            if(
                pieces[row][col + 1] === "♙" &&
                lastMove !== null &&
                lastMove.piece === "♙" &&
                lastMove.fromRow === 6 &&
                lastMove.toRow === 4 &&
                lastMove.toCol === col + 1
            ){

                moves.push([
                    row + 1,
                    col + 1
                ]);

            }

        }

    }


    return moves;

}


// ======================================
// CAVALIER
// ======================================

function getKnightMoves(row, col){

    let moves = [];

    const piece = pieces[row][col];


    const knightMoves = [

        [-2, -1],
        [-2,  1],

        [-1, -2],
        [-1,  2],

        [1, -2],
        [1,  2],

        [2, -1],
        [2,  1]

    ];


    for(let move of knightMoves){

        const newRow = row + move[0];

        const newCol = col + move[1];


        // Vérifier les limites

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


        // Case vide

        if(target === ""){

            moves.push([
                newRow,
                newCol
            ]);

        }


        // Blanc mange noir

        else if(
            isWhitePiece(piece) &&
            isBlackPiece(target)
        ){

            moves.push([
                newRow,
                newCol
            ]);

        }


        // Noir mange blanc

        else if(
            isBlackPiece(piece) &&
            isWhitePiece(target)
        ){

            moves.push([
                newRow,
                newCol
            ]);

        }

    }


    return moves;

}


// ======================================
// TOUR
// ======================================

function getRookMoves(row, col){

    let moves = [];

    const piece = pieces[row][col];


    const directions = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    for(let direction of directions){

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


            // Case vide

            if(target === ""){

                moves.push([
                    newRow,
                    newCol
                ]);

            }


            // Une pièce est rencontrée

            else{

                // Blanc mange noir

                if(
                    isWhitePiece(piece) &&
                    isBlackPiece(target)
                ){

                    moves.push([
                        newRow,
                        newCol
                    ]);

                }


                // Noir mange blanc

                else if(
                    isBlackPiece(piece) &&
                    isWhitePiece(target)
                ){

                    moves.push([
                        newRow,
                        newCol
                    ]);

                }


                // La tour ne peut pas
                // traverser une pièce

                break;

            }


            newRow += direction[0];

            newCol += direction[1];

        }

    }


    return moves;

}


// ======================================
// FOU
// ======================================

function getBishopMoves(row, col){

    let moves = [];

    const piece = pieces[row][col];


    const directions = [

        [-1, -1],
        [-1,  1],
        [1, -1],
        [1,  1]

    ];


    for(let direction of directions){

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


            // Case vide

            if(target === ""){

                moves.push([
                    newRow,
                    newCol
                ]);

            }


            // Une pièce est rencontrée

            else{

                // Blanc mange noir

                if(
                    isWhitePiece(piece) &&
                    isBlackPiece(target)
                ){

                    moves.push([
                        newRow,
                        newCol
                    ]);

                }


                // Noir mange blanc

                else if(
                    isBlackPiece(piece) &&
                    isWhitePiece(target)
                ){

                    moves.push([
                        newRow,
                        newCol
                    ]);

                }


                // Le fou s'arrête

                break;

            }


            newRow += direction[0];

            newCol += direction[1];

        }

    }


    return moves;

}


// ======================================
// DAME
// ======================================

function getQueenMoves(row, col){

    return [

        ...getRookMoves(row, col),

        ...getBishopMoves(row, col)

    ];

}


// ======================================
// ROI
// ======================================

function getKingMoves(
    row,
    col,
    checkingAttack = false
){

    let moves = [];

    const piece = pieces[row][col];


    const directions = [

        [-1, -1],
        [-1, 0],
        [-1, 1],

        [0, -1],
        [0, 1],

        [1, -1],
        [1, 0],
        [1, 1]

    ];


    // ==================================
    // MOUVEMENTS NORMAUX
    // ==================================

    for(let direction of directions){

        const newRow =
            row + direction[0];

        const newCol =
            col + direction[1];


        // Hors du plateau

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


        // Case vide

        if(target === ""){

            moves.push([
                newRow,
                newCol
            ]);

        }


        // Blanc mange noir

        else if(
            isWhitePiece(piece) &&
            isBlackPiece(target)
        ){

            moves.push([
                newRow,
                newCol
            ]);

        }


        // Noir mange blanc

        else if(
            isBlackPiece(piece) &&
            isWhitePiece(target)
        ){

            moves.push([
                newRow,
                newCol
            ]);

        }

    }


    // ==================================
    // PETIT ROQUE BLANC
    // ==================================

    if(
        !checkingAttack &&
        piece === "♔" &&
        row === 7 &&
        col === 4
    ){

        if(

            !whiteKingMoved &&
            !whiteRookRightMoved &&
            pieces[7][7] === "♖" &&
            pieces[7][5] === "" &&
            pieces[7][6] === "" &&
            !isKingInCheck("white")

        ){

            moves.push([
                7,
                6
            ]);

        }

    }


    // ==================================
    // GRAND ROQUE BLANC
    // ==================================

    if(
        !checkingAttack &&
        piece === "♔" &&
        row === 7 &&
        col === 4
    ){

        if(

            !whiteKingMoved &&
            !whiteRookLeftMoved &&
            pieces[7][0] === "♖" &&
            pieces[7][1] === "" &&
            pieces[7][2] === "" &&
            pieces[7][3] === "" &&
            !isKingInCheck("white")

        ){

            moves.push([
                7,
                2
            ]);

        }

    }


    // ==================================
    // PETIT ROQUE NOIR
    // ==================================

    if(
        !checkingAttack &&
        piece === "♚" &&
        row === 0 &&
        col === 4
    ){

        if(

            !blackKingMoved &&
            !blackRookRightMoved &&
            pieces[0][7] === "♜" &&
            pieces[0][5] === "" &&
            pieces[0][6] === "" &&
            !isKingInCheck("black")

        ){

            moves.push([
                0,
                6
            ]);

        }

    }


    // ==================================
    // GRAND ROQUE NOIR
    // ==================================

    if(
        !checkingAttack &&
        piece === "♚" &&
        row === 0 &&
        col === 4
    ){

        if(

            !blackKingMoved &&
            !blackRookLeftMoved &&
            pieces[0][0] === "♜" &&
            pieces[0][1] === "" &&
            pieces[0][2] === "" &&
            pieces[0][3] === "" &&
            !isKingInCheck("black")

        ){

            moves.push([
                0,
                2
            ]);

        }

    }


    return moves;

}


// ======================================
// TROUVER LE ROI
// ======================================

function findKing(color){

    const king =
        color === "white"
        ? "♔"
        : "♚";


    for(let row = 0; row < 8; row++){

        for(let col = 0; col < 8; col++){

            if(
                pieces[row][col] === king
            ){

                return [
                    row,
                    col
                ];

            }

        }

    }


    return null;

}


// ======================================
// VÉRIFIER SI LE ROI EST EN ÉCHEC
// ======================================

function isKingInCheck(color){

    const kingPosition =
        findKing(color);


    if(kingPosition === null){

        return false;

    }


    const kingRow =
        kingPosition[0];

    const kingCol =
        kingPosition[1];


    const enemyColor =
        color === "white"
        ? "black"
        : "white";


    for(let row = 0; row < 8; row++){

        for(let col = 0; col < 8; col++){

            const piece =
                pieces[row][col];


            // Ignorer les cases vides

            if(piece === ""){

                continue;

            }


            // Chercher uniquement
            // les pièces ennemies

            if(
                enemyColor === "white" &&
                !isWhitePiece(piece)
            ){

                continue;

            }


            if(
                enemyColor === "black" &&
                !isBlackPiece(piece)
            ){

                continue;

            }


            // Calculer leurs attaques

            const enemyMoves =
                getPossibleMoves(
                    row,
                    col,
                    true
                );


            for(let move of enemyMoves){

                if(
                    move[0] === kingRow &&
                    move[1] === kingCol
                ){

                    return true;

                }

            }

        }

    }


    return false;

}