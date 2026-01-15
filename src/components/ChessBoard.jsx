import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

const ChessBoard = ({ game, onMove, playerColor = 'white', showMoveHistory = true, canUndo = false, onUndo }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  const handleSquareClick = (row, col) => {
    // If a square is already selected
    if (selectedSquare) {
      const { row: fromRow, col: fromCol } = selectedSquare;
      
      // Try to make the move
      const moveSuccess = game.makeMove(fromRow, fromCol, row, col);
      
      if (moveSuccess) {
        onMove && onMove();
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (row === fromRow && col === fromCol) {
        // Deselect if clicking the same square
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        // Try to select a new piece
        const piece = game.getPiece(row, col);
        if (piece && piece.color === game.currentPlayer) {
          setSelectedSquare({ row, col });
          setLegalMoves(game.getLegalMoves(row, col));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } else {
      // Select a piece
      const piece = game.getPiece(row, col);
      if (piece && piece.color === game.currentPlayer) {
        setSelectedSquare({ row, col });
        setLegalMoves(game.getLegalMoves(row, col));
      }
    }
  };

  const renderSquare = (row, col) => {
    const piece = game.getPiece(row, col);
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
    const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
    
    return (
      <motion.button
        key={`${row}-${col}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleSquareClick(row, col)}
        className={cn(
          'aspect-square flex items-center justify-center text-4xl sm:text-5xl font-bold relative transition-all',
          isLight ? 'bg-amber-100' : 'bg-amber-600',
          isSelected && 'ring-4 ring-yellow-400',
          isLegalMove && 'after:absolute after:inset-0 after:m-auto after:w-4 after:h-4 after:bg-green-400 after:rounded-full after:opacity-60'
        )}
      >
        {piece && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'select-none',
              piece.color === 'white' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900'
            )}
          >
            {PIECE_SYMBOLS[piece.color][piece.type]}
          </motion.span>
        )}
      </motion.button>
    );
  };

  const files = 'abcdefgh';
  const ranks = '87654321';

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex flex-col">
        <div className="grid grid-cols-8 gap-0 border-4 border-slate-700 rounded-lg overflow-hidden w-full max-w-[600px] aspect-square">
          {Array.from({ length: 8 }, (_, row) => 
            Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
          )}
        </div>
        
        {canUndo && onUndo && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUndo}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Undo Move
          </motion.button>
        )}
      </div>

      {showMoveHistory && (
        <div className="flex-1 w-full lg:max-w-xs">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Move History</h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {game.moveHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No moves yet</p>
              ) : (
                game.moveHistory.map((move, idx) => (
                  <div key={idx} className="text-sm text-white flex items-center gap-2">
                    <span className="text-slate-400 w-8">{Math.floor(idx / 2) + 1}.</span>
                    <span>{move.notation}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">Game Status</h3>
            <p className="text-sm text-white">
              Turn: <span className="font-bold capitalize">{game.currentPlayer}</span>
            </p>
            {game.gameStatus === 'check' && (
              <p className="text-red-400 font-bold mt-2">Check!</p>
            )}
            {game.gameStatus === 'checkmate' && (
              <p className="text-red-400 font-bold mt-2">Checkmate!</p>
            )}
            {game.gameStatus === 'stalemate' && (
              <p className="text-yellow-400 font-bold mt-2">Stalemate!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;