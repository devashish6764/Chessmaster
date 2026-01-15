import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ChessEngine } from '@/lib/chess';
import ChessBoard from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Cpu } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PlayAIPage = () => {
  const [game, setGame] = useState(null);
  const [aiLevel, setAiLevel] = useState(800);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const { user, updateRating, updateStats } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setGame(new ChessEngine());
    setShowResult(false);
    setGameResult(null);
  };

  const handleMove = () => {
    if (!game) return;

    // Check game status
    if (game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') {
      const result = determineResult();
      setGameResult(result);
      setShowResult(true);
      saveGame(result);
      return;
    }

    // AI's turn
    if (game.currentPlayer === 'black') {
      setIsAiThinking(true);
      setTimeout(() => {
        const aiMove = game.getAIMove(aiLevel);
        if (aiMove) {
          game.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
          setGame(game.clone());
          
          if (game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate') {
            const result = determineResult();
            setGameResult(result);
            setShowResult(true);
            saveGame(result);
          }
        }
        setIsAiThinking(false);
      }, 500);
    }

    setGame(game.clone());
  };

  const determineResult = () => {
    if (game.gameStatus === 'checkmate') {
      const winner = game.currentPlayer === 'white' ? 'black' : 'white';
      const userWon = winner === 'white';
      const ratingChange = userWon ? 8 : -9;
      return {
        outcome: userWon ? 'win' : 'loss',
        ratingChange,
        message: userWon ? 'You won!' : 'AI won!'
      };
    } else {
      return {
        outcome: 'draw',
        ratingChange: 0,
        message: 'Draw by stalemate'
      };
    }
  };

  const saveGame = (result) => {
    // Save to localStorage
    const games = JSON.parse(localStorage.getItem('chessGames') || '[]');
    const newGame = {
      id: Date.now().toString(),
      userId: user.id,
      opponent: `AI (${aiLevel})`,
      gameType: 'ai',
      aiLevel,
      moves: game.moveHistory,
      result: result.outcome,
      ratingChange: result.ratingChange,
      createdAt: new Date().toISOString()
    };
    games.unshift(newGame);
    localStorage.setItem('chessGames', JSON.stringify(games));

    // Update user stats and rating
    updateStats(result.outcome);
    updateRating(result.ratingChange);
  };

  const handleUndo = () => {
    if (!game) return;
    
    // Undo player's move
    game.undoMove();
    // Undo AI's move
    if (game.moveHistory.length > 0) {
      game.undoMove();
    }
    setGame(game.clone());
    
    toast({
      title: 'Move undone',
      description: 'Last two moves have been undone'
    });
  };

  if (!game) return null;

  return (
    <>
      <Helmet>
        <title>Play vs AI - Chess Master</title>
        <meta name="description" content="Play chess against AI opponents at various difficulty levels. Improve your skills and rating." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[auto,1fr] gap-6"
          >
            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  AI Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Select AI Rating</label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-slate-700 text-white border border-slate-600"
                    disabled={game.moveHistory.length > 0}
                  >
                    <option value={500}>500 - Beginner</option>
                    <option value={600}>600 - Easy</option>
                    <option value={700}>700 - Novice</option>
                    <option value={800}>800 - Intermediate</option>
                    <option value={900}>900 - Advanced</option>
                    <option value={1000}>1000 - Expert</option>
                    <option value={1100}>1100 - Master</option>
                    <option value={1200}>1200 - Grandmaster</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Your Rating:</span>
                    <span className="text-white font-bold">{user?.rating}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">AI Rating:</span>
                    <span className="text-white font-bold">{aiLevel}</span>
                  </div>
                </div>

                {isAiThinking && (
                  <div className="text-center text-purple-400 animate-pulse">
                    AI is thinking...
                  </div>
                )}

                <Button
                  onClick={startNewGame}
                  className="w-full"
                  variant="outline"
                >
                  New Game
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ChessBoard
                game={game}
                onMove={handleMove}
                playerColor="white"
                showMoveHistory={true}
                canUndo={true}
                onUndo={handleUndo}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Game Over</DialogTitle>
            <DialogDescription>
              {gameResult?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Result:</span>
              <span className="text-xl font-bold capitalize text-white">{gameResult?.outcome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Rating Change:</span>
              <span className={`text-xl font-bold ${gameResult?.ratingChange > 0 ? 'text-green-400' : gameResult?.ratingChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {gameResult?.ratingChange > 0 ? '+' : ''}{gameResult?.ratingChange}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">New Rating:</span>
              <span className="text-xl font-bold text-white">{user?.rating}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startNewGame} className="w-full">
              Play Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Back to Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayAIPage;