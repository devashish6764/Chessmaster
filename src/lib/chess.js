// Chess Engine Implementation

export const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class ChessEngine {
  constructor(fen = INITIAL_FEN) {
    this.board = this.parseFEN(fen);
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameStatus = 'active'; // active, check, checkmate, stalemate, draw
  }

  parseFEN(fen) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const [position, turn, castling, enPassant] = fen.split(' ');
    
    const rows = position.split('/');
    for (let i = 0; i < 8; i++) {
      let col = 0;
      for (const char of rows[i]) {
        if (char >= '1' && char <= '8') {
          col += parseInt(char);
        } else {
          const color = char === char.toUpperCase() ? 'white' : 'black';
          const pieceMap = {
            'p': 'pawn', 'n': 'knight', 'b': 'bishop',
            'r': 'rook', 'q': 'queen', 'k': 'king'
          };
          board[i][col] = {
            type: pieceMap[char.toLowerCase()],
            color: color
          };
          col++;
        }
      }
    }
    
    this.currentPlayer = turn === 'w' ? 'white' : 'black';
    return board;
  }

  generateFEN() {
    let fen = '';
    for (let i = 0; i < 8; i++) {
      let emptyCount = 0;
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const pieceChar = {
            'pawn': 'p', 'knight': 'n', 'bishop': 'b',
            'rook': 'r', 'queen': 'q', 'king': 'k'
          }[piece.type];
          fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (i < 7) fen += '/';
    }
    
    fen += ' ' + (this.currentPlayer === 'white' ? 'w' : 'b');
    return fen;
  }

  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  setPiece(row, col, piece) {
    this.board[row][col] = piece;
  }

  isValidPosition(row, col) {
    return row >= 0 && row <= 7 && col >= 0 && col <= 7;
  }

  getLegalMoves(fromRow, fromCol) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece || piece.color !== this.currentPlayer) return [];

    const moves = this.getPseudoLegalMoves(fromRow, fromCol);
    return moves.filter(move => {
      return this.isMoveLegal(fromRow, fromCol, move.row, move.col);
    });
  }

  getPseudoLegalMoves(fromRow, fromCol) {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn': return this.getPawnMoves(fromRow, fromCol);
      case 'knight': return this.getKnightMoves(fromRow, fromCol);
      case 'bishop': return this.getBishopMoves(fromRow, fromCol);
      case 'rook': return this.getRookMoves(fromRow, fromCol);
      case 'queen': return this.getQueenMoves(fromRow, fromCol);
      case 'king': return this.getKingMoves(fromRow, fromCol);
      default: return [];
    }
  }

  getPawnMoves(row, col) {
    const piece = this.getPiece(row, col);
    const moves = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Forward move
    const newRow = row + direction;
    if (this.isValidPosition(newRow, col) && !this.getPiece(newRow, col)) {
      moves.push({ row: newRow, col });
      
      // Double move from start
      if (row === startRow) {
        const doubleRow = row + 2 * direction;
        if (!this.getPiece(doubleRow, col)) {
          moves.push({ row: doubleRow, col });
        }
      }
    }

    // Captures
    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset;
      if (this.isValidPosition(newRow, newCol)) {
        const target = this.getPiece(newRow, newCol);
        if (target && target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
        // En passant
        if (this.enPassantTarget && this.enPassantTarget.row === newRow && this.enPassantTarget.col === newCol) {
          moves.push({ row: newRow, col: newCol, enPassant: true });
        }
      }
    }

    return moves;
  }

  getKnightMoves(row, col) {
    const moves = [];
    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    const piece = this.getPiece(row, col);

    for (const [rowOffset, colOffset] of offsets) {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      if (this.isValidPosition(newRow, newCol)) {
        const target = this.getPiece(newRow, newCol);
        if (!target || target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  getBishopMoves(row, col) {
    return this.getSlidingMoves(row, col, [[-1,-1],[-1,1],[1,-1],[1,1]]);
  }

  getRookMoves(row, col) {
    return this.getSlidingMoves(row, col, [[-1,0],[1,0],[0,-1],[0,1]]);
  }

  getQueenMoves(row, col) {
    return this.getSlidingMoves(row, col, [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
  }

  getSlidingMoves(row, col, directions) {
    const moves = [];
    const piece = this.getPiece(row, col);

    for (const [rowDir, colDir] of directions) {
      let newRow = row + rowDir;
      let newCol = col + colDir;
      
      while (this.isValidPosition(newRow, newCol)) {
        const target = this.getPiece(newRow, newCol);
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
        newRow += rowDir;
        newCol += colDir;
      }
    }

    return moves;
  }

  getKingMoves(row, col) {
    const moves = [];
    const piece = this.getPiece(row, col);

    // Normal king moves
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue;
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (this.isValidPosition(newRow, newCol)) {
          const target = this.getPiece(newRow, newCol);
          if (!target || target.color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
    }

    // Castling logic
    // IMPORTANT: We must ensure we don't create infinite recursion here.
    // Castling checks if squares are attacked. isSquareAttacked should NOT call getPseudoLegalMoves for the king.
    
    if (piece.color === 'white' && row === 7 && col === 4) {
      // Kingside
      if (this.castlingRights.whiteKing && !this.getPiece(7, 5) && !this.getPiece(7, 6)) {
        if (!this.isSquareAttacked(7, 4, 'black') && !this.isSquareAttacked(7, 5, 'black')) {
           // Note: We don't check destination square attack here to avoid recursion in move generation.
           // The legality check (isMoveLegal) will handle the final destination safety.
           // However, standard chess rules say you can't castle OUT of check, THROUGH check, or INTO check.
           // isSquareAttacked handles "out of" (7,4) and "through" (7,5). "Into" (7,6) is handled by isMoveLegal usually,
           // but for castling specifically, we often check it here.
           // To be safe against recursion, we rely on isSquareAttacked NOT calling getKingMoves.
           if (!this.isSquareAttacked(7, 6, 'black')) {
             moves.push({ row: 7, col: 6, castling: 'kingside' });
           }
        }
      }
      // Queenside
      if (this.castlingRights.whiteQueen && !this.getPiece(7, 3) && !this.getPiece(7, 2) && !this.getPiece(7, 1)) {
        if (!this.isSquareAttacked(7, 4, 'black') && !this.isSquareAttacked(7, 3, 'black')) {
           if (!this.isSquareAttacked(7, 2, 'black')) {
             moves.push({ row: 7, col: 2, castling: 'queenside' });
           }
        }
      }
    } else if (piece.color === 'black' && row === 0 && col === 4) {
      // Kingside
      if (this.castlingRights.blackKing && !this.getPiece(0, 5) && !this.getPiece(0, 6)) {
        if (!this.isSquareAttacked(0, 4, 'white') && !this.isSquareAttacked(0, 5, 'white')) {
           if (!this.isSquareAttacked(0, 6, 'white')) {
             moves.push({ row: 0, col: 6, castling: 'kingside' });
           }
        }
      }
      // Queenside
      if (this.castlingRights.blackQueen && !this.getPiece(0, 3) && !this.getPiece(0, 2) && !this.getPiece(0, 1)) {
        if (!this.isSquareAttacked(0, 4, 'white') && !this.isSquareAttacked(0, 3, 'white')) {
           if (!this.isSquareAttacked(0, 2, 'white')) {
             moves.push({ row: 0, col: 2, castling: 'queenside' });
           }
        }
      }
    }

    return moves;
  }

  // Refactored to avoid infinite recursion by NOT calling getPseudoLegalMoves
  isSquareAttacked(row, col, byColor) {
    // Check for pawn attacks
    const pawnDirection = byColor === 'white' ? -1 : 1; // White pawns attack "up" (lower row index), Black "down"
    // If we are checking if [row, col] is attacked by a WHITE pawn, the pawn must be at [row+1, col±1]
    // If we are checking if [row, col] is attacked by a BLACK pawn, the pawn must be at [row-1, col±1]
    // Wait, direction is movement. White moves -1. So white pawn at row+1 attacks row.
    // Correct logic:
    // Attacking pawn must be at: row - (pawnDirection)
    const attackingPawnRow = row - pawnDirection;
    if (this.isValidPosition(attackingPawnRow, col - 1)) {
      const p = this.getPiece(attackingPawnRow, col - 1);
      if (p && p.type === 'pawn' && p.color === byColor) return true;
    }
    if (this.isValidPosition(attackingPawnRow, col + 1)) {
      const p = this.getPiece(attackingPawnRow, col + 1);
      if (p && p.type === 'pawn' && p.color === byColor) return true;
    }

    // Check for knight attacks
    const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [rOff, cOff] of knightOffsets) {
      const r = row + rOff;
      const c = col + cOff;
      if (this.isValidPosition(r, c)) {
        const p = this.getPiece(r, c);
        if (p && p.type === 'knight' && p.color === byColor) return true;
      }
    }

    // Check for king attacks (adjacent squares)
    for (let rOff = -1; rOff <= 1; rOff++) {
      for (let cOff = -1; cOff <= 1; cOff++) {
        if (rOff === 0 && cOff === 0) continue;
        const r = row + rOff;
        const c = col + cOff;
        if (this.isValidPosition(r, c)) {
          const p = this.getPiece(r, c);
          if (p && p.type === 'king' && p.color === byColor) return true;
        }
      }
    }

    // Check for sliding pieces (Rook/Queen) - Orthogonal
    const orthoDirs = [[-1,0], [1,0], [0,-1], [0,1]];
    for (const [dr, dc] of orthoDirs) {
      let r = row + dr;
      let c = col + dc;
      while (this.isValidPosition(r, c)) {
        const p = this.getPiece(r, c);
        if (p) {
          if (p.color === byColor && (p.type === 'rook' || p.type === 'queen')) return true;
          break; // Blocked by any piece
        }
        r += dr;
        c += dc;
      }
    }

    // Check for sliding pieces (Bishop/Queen) - Diagonal
    const diagDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    for (const [dr, dc] of diagDirs) {
      let r = row + dr;
      let c = col + dc;
      while (this.isValidPosition(r, c)) {
        const p = this.getPiece(r, c);
        if (p) {
          if (p.color === byColor && (p.type === 'bishop' || p.type === 'queen')) return true;
          break; // Blocked by any piece
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  isMoveLegal(fromRow, fromCol, toRow, toCol) {
    const piece = this.getPiece(fromRow, fromCol);
    const target = this.getPiece(toRow, toCol);
    
    // Make move temporarily
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);
    
    // Find king position
    let kingRow, kingCol;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = this.getPiece(i, j);
        if (p && p.type === 'king' && p.color === piece.color) {
          kingRow = i;
          kingCol = j;
        }
      }
    }
    
    // If king is missing (shouldn't happen in normal play but possible in editor/tests), assume illegal
    if (kingRow === undefined) {
       this.setPiece(fromRow, fromCol, piece);
       this.setPiece(toRow, toCol, target);
       return false;
    }

    const isLegal = !this.isSquareAttacked(kingRow, kingCol, piece.color === 'white' ? 'black' : 'white');
    
    // Undo move
    this.setPiece(fromRow, fromCol, piece);
    this.setPiece(toRow, toCol, target);
    
    return isLegal;
  }

  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = 'queen') {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece || piece.color !== this.currentPlayer) return false;

    const legalMoves = this.getLegalMoves(fromRow, fromCol);
    const move = legalMoves.find(m => m.row === toRow && m.col === toCol);
    if (!move) return false;

    const target = this.getPiece(toRow, toCol);
    if (target) {
      this.capturedPieces[this.currentPlayer].push(target);
    }

    // Handle en passant
    if (move.enPassant) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      const capturedPawn = this.getPiece(capturedRow, toCol);
      if (capturedPawn) {
        this.capturedPieces[this.currentPlayer].push(capturedPawn);
        this.setPiece(capturedRow, toCol, null);
      }
    }

    // Handle castling
    if (move.castling) {
      if (move.castling === 'kingside') {
        const rook = this.getPiece(fromRow, 7);
        this.setPiece(fromRow, 5, rook);
        this.setPiece(fromRow, 7, null);
      } else {
        const rook = this.getPiece(fromRow, 0);
        this.setPiece(fromRow, 3, rook);
        this.setPiece(fromRow, 0, null);
      }
    }

    // Move piece
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);

    // Handle pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      this.setPiece(toRow, toCol, { type: promotionPiece, color: piece.color });
    }

    // Update en passant target
    if (piece.type === 'pawn' && Math.abs(fromRow - toRow) === 2) {
      this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
    } else {
      this.enPassantTarget = null;
    }

    // Update castling rights
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKing = false;
        this.castlingRights.whiteQueen = false;
      } else {
        this.castlingRights.blackKing = false;
        this.castlingRights.blackQueen = false;
      }
    }
    if (piece.type === 'rook') {
      if (fromRow === 7 && fromCol === 0) this.castlingRights.whiteQueen = false;
      if (fromRow === 7 && fromCol === 7) this.castlingRights.whiteKing = false;
      if (fromRow === 0 && fromCol === 0) this.castlingRights.blackQueen = false;
      if (fromRow === 0 && fromCol === 7) this.castlingRights.blackKing = false;
    }

    // Add to move history
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece.type,
      captured: target,
      notation: this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, target)
    });

    // Switch player
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    // Update game status
    this.updateGameStatus();

    return true;
  }

  getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured) {
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    let notation = '';
    if (piece.type !== 'pawn') {
      notation += piece.type[0].toUpperCase();
    }
    
    notation += files[fromCol] + ranks[fromRow];
    notation += captured ? 'x' : '-';
    notation += files[toCol] + ranks[toRow];
    
    return notation;
  }

  updateGameStatus() {
    const hasLegalMoves = this.hasAnyLegalMoves();
    const inCheck = this.isInCheck(this.currentPlayer);

    if (!hasLegalMoves) {
      if (inCheck) {
        this.gameStatus = 'checkmate';
      } else {
        this.gameStatus = 'stalemate';
      }
    } else if (inCheck) {
      this.gameStatus = 'check';
    } else {
      this.gameStatus = 'active';
    }
  }

  hasAnyLegalMoves() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.getPiece(i, j);
        if (piece && piece.color === this.currentPlayer) {
          const moves = this.getLegalMoves(i, j);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  isInCheck(color) {
    let kingRow, kingCol;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.getPiece(i, j);
        if (piece && piece.type === 'king' && piece.color === color) {
          kingRow = i;
          kingCol = j;
          break;
        }
      }
    }
    // If king is not found (e.g. in setup mode or tests), assume not in check
    if (kingRow === undefined) return false;
    
    return this.isSquareAttacked(kingRow, kingCol, color === 'white' ? 'black' : 'white');
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;
    
    // For simplicity, recreate the game from initial position
    const moves = [...this.moveHistory];
    moves.pop();
    
    this.board = this.parseFEN(INITIAL_FEN);
    this.currentPlayer = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true };
    this.enPassantTarget = null;
    
    for (const move of moves) {
      this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
    }
    
    return true;
  }

  evaluatePosition() {
    let score = 0;
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.getPiece(i, j);
        if (piece) {
          const value = PIECE_VALUES[piece.type];
          score += piece.color === 'white' ? value : -value;
        }
      }
    }
    
    return score;
  }

  getBestMove(depth = 3, aiColor = 'black') {
    let bestMove = null;
    let bestScore = aiColor === 'white' ? -Infinity : Infinity;
    
    const allMoves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.getPiece(i, j);
        if (piece && piece.color === this.currentPlayer) {
          const moves = this.getLegalMoves(i, j);
          for (const move of moves) {
            allMoves.push({ from: { row: i, col: j }, to: move });
          }
        }
      }
    }
    
    for (const move of allMoves) {
      const gameCopy = this.clone();
      gameCopy.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
      
      const score = gameCopy.minimax(depth - 1, -Infinity, Infinity, aiColor === 'black');
      
      if (aiColor === 'white') {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
    
    return bestMove;
  }

  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0 || this.gameStatus === 'checkmate' || this.gameStatus === 'stalemate') {
      return this.evaluatePosition();
    }
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = this.getPiece(i, j);
          if (piece && piece.color === 'white') {
            const moves = this.getLegalMoves(i, j);
            for (const move of moves) {
              const gameCopy = this.clone();
              gameCopy.makeMove(i, j, move.row, move.col);
              const score = gameCopy.minimax(depth - 1, alpha, beta, false);
              maxScore = Math.max(maxScore, score);
              alpha = Math.max(alpha, score);
              if (beta <= alpha) break;
            }
          }
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = this.getPiece(i, j);
          if (piece && piece.color === 'black') {
            const moves = this.getLegalMoves(i, j);
            for (const move of moves) {
              const gameCopy = this.clone();
              gameCopy.makeMove(i, j, move.row, move.col);
              const score = gameCopy.minimax(depth - 1, alpha, beta, true);
              minScore = Math.min(minScore, score);
              beta = Math.min(beta, score);
              if (beta <= alpha) break;
            }
          }
        }
      }
      return minScore;
    }
  }

  clone() {
    const cloned = new ChessEngine();
    cloned.board = this.board.map(row => row.map(piece => piece ? {...piece} : null));
    cloned.currentPlayer = this.currentPlayer;
    cloned.moveHistory = [...this.moveHistory];
    cloned.capturedPieces = {
      white: [...this.capturedPieces.white],
      black: [...this.capturedPieces.black]
    };
    cloned.castlingRights = {...this.castlingRights};
    cloned.enPassantTarget = this.enPassantTarget ? {...this.enPassantTarget} : null;
    cloned.gameStatus = this.gameStatus;
    return cloned;
  }

  getAIMove(difficulty = 800) {
    // Adjust depth based on difficulty
    const depth = difficulty < 700 ? 1 : difficulty < 900 ? 2 : 3;
    
    // Add some randomness for lower difficulties
    const randomFactor = difficulty < 800 ? 0.3 : difficulty < 1000 ? 0.15 : 0.05;
    
    if (Math.random() < randomFactor) {
      // Make a random legal move
      const allMoves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = this.getPiece(i, j);
          if (piece && piece.color === this.currentPlayer) {
            const moves = this.getLegalMoves(i, j);
            for (const move of moves) {
              allMoves.push({ from: { row: i, col: j }, to: move });
            }
          }
        }
      }
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    return this.getBestMove(depth, this.currentPlayer);
  }
}