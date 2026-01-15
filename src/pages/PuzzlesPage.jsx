import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ChessEngine } from '@/lib/chess';
import ChessBoard from '@/components/ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Target, Star, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Sample puzzles with different difficulty levels
const PUZZLE_DATABASE = [
  {
    id: 1,
    difficulty: 600,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: [{ from: { row: 7, col: 5 }, to: { row: 5, col: 6 } }], // Nxe5 (knight takes pawn)
    description: 'Find the winning move',
    moveCount: 1
  },
  {
    id: 2,
    difficulty: 800,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solution: [{ from: { row: 7, col: 5 }, to: { row: 4, col: 5 } }], // Bc4 developing bishop
    description: 'Develop with tempo',
    moveCount: 1
  },
  {
    id: 3,
    difficulty: 1000,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5',
    solution: [{ from: { row: 7, col: 3 }, to: { row: 5, col: 5 } }], // Qh5+ forking king
    description: 'Find the fork',
    moveCount: 1
  },
  {
    id: 4,
    difficulty: 400,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: [{ from: { row: 7, col: 6 }, to: { row: 5, col: 5 } }], // Nf3 developing
    description: 'Develop a piece',
    moveCount: 1
  },
  {
    id: 5,
    difficulty: 1200,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
    solution: [{ from: { row: 1, col: 3 }, to: { row: 4, col: 3 } }], // Nxe4 capturing
    description: 'Win material',
    moveCount: 1
  }
];

const PuzzlesPage = () => {
  const { user, updateRating } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState(null);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [todayProgress, setTodayProgress] = useState([]);

  useEffect(() => {
    loadProgress();
    startPuzzle(0);
  }, []);

  const loadProgress = () => {
    const today = new Date().toDateString();
    const progress = JSON.parse(localStorage.getItem('dailyPuzzleProgress') || '{}');
    
    if (progress.date !== today) {
      // Reset for new day
      progress.date = today;
      progress.completed = [];
      localStorage.setItem('dailyPuzzleProgress', JSON.stringify(progress));
    }
    
    setTodayProgress(progress.completed || []);
    setPuzzlesCompleted(progress.completed?.length || 0);
  };

  const startPuzzle = (index) => {
    if (index >= PUZZLE_DATABASE.length) {
      toast({
        title: 'All puzzles completed!',
        description: 'Come back tomorrow for new puzzles',
        variant: 'default'
      });
      return;
    }

    const puzzle = PUZZLE_DATABASE[index];
    const newGame = new ChessEngine(puzzle.fen);
    setGame(newGame);
    setCurrentPuzzleIndex(index);
  };

  const handleMove = () => {
    if (!game) return;

    const puzzle = PUZZLE_DATABASE[currentPuzzleIndex];
    const lastMove = game.moveHistory[game.moveHistory.length - 1];
    
    // Check if the move matches the solution
    const solutionMove = puzzle.solution[0];
    const isCorrectMove = 
      lastMove.from.row === solutionMove.from.row &&
      lastMove.from.col === solutionMove.from.col &&
      lastMove.to.row === solutionMove.to.row &&
      lastMove.to.col === solutionMove.to.col;

    if (isCorrectMove) {
      // Puzzle solved!
      const today = new Date().toDateString();
      const progress = JSON.parse(localStorage.getItem('dailyPuzzleProgress') || '{}');
      
      if (progress.date !== today) {
        progress.date = today;
        progress.completed = [];
      }
      
      if (!progress.completed.includes(puzzle.id)) {
        progress.completed.push(puzzle.id);
        localStorage.setItem('dailyPuzzleProgress', JSON.stringify(progress));
        
        // Award rating points
        updateRating(2);
        
        setPuzzlesCompleted(progress.completed.length);
        
        toast({
          title: '✅ Puzzle solved!',
          description: '+2 rating points',
          variant: 'default'
        });
      }
    } else {
      toast({
        title: '❌ Incorrect move',
        description: 'Try again!',
        variant: 'destructive'
      });
      
      // Reset puzzle
      startPuzzle(currentPuzzleIndex);
    }
  };

  const handleNextPuzzle = () => {
    startPuzzle(currentPuzzleIndex + 1);
  };

  if (!game) return null;

  const currentPuzzle = PUZZLE_DATABASE[currentPuzzleIndex];
  const isCompleted = todayProgress.includes(currentPuzzle.id);

  return (
    <>
      <Helmet>
        <title>Daily Puzzles - Chess Master</title>
        <meta name="description" content="Solve daily chess puzzles to improve your skills and earn rating points." />
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
                  <Target className="h-5 w-5 text-yellow-400" />
                  Daily Puzzles
                </CardTitle>
                <CardDescription>Solve 5 puzzles daily</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">Progress</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {puzzlesCompleted}/5
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < puzzlesCompleted ? 'bg-yellow-400' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Puzzle {currentPuzzleIndex + 1}</span>
                    <span className="text-white font-bold">Rating: {currentPuzzle.difficulty}</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    {currentPuzzle.description}
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Star className="h-4 w-4" fill="currentColor" />
                      Completed
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Rewards:</div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    +2 rating per puzzle (max +10/day)
                  </div>
                </div>

                {isCompleted && currentPuzzleIndex < PUZZLE_DATABASE.length - 1 && (
                  <Button onClick={handleNextPuzzle} className="w-full">
                    Next Puzzle
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ChessBoard
                game={game}
                onMove={handleMove}
                playerColor="white"
                showMoveHistory={false}
                canUndo={false}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PuzzlesPage;