import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Copy, Trophy, Target, TrendingUp, User, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || '');
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    loadGameHistory();
  }, [user]);

  const loadGameHistory = () => {
    const games = JSON.parse(localStorage.getItem('chessGames') || '[]');
    const userGames = games.filter(g => g.userId === user?.id).slice(0, 10);
    setGameHistory(userGames);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile({ username, profilePictureUrl: profilePicture });
    if (result.success) {
      setIsEditing(false);
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast({
      title: 'User ID copied!',
      description: 'Your user ID has been copied to clipboard'
    });
  };

  const winRate = user?.stats.totalGames > 0 
    ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(1)
    : 0;

  return (
    <>
      <Helmet>
        <title>Profile - Chess Master</title>
        <meta name="description" content="View your chess profile, stats, and game history." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto py-8">
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

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user?.profilePictureUrl} />
                      <AvatarFallback className="text-3xl">
                        {user?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                        <p className="text-slate-400 text-sm">{user?.email}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>User ID</Label>
                        <div className="flex gap-2">
                          <Input
                            value={user?.id}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={copyUserId}
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300">Rating</span>
                          <span className="text-2xl font-bold text-purple-400">
                            {user?.rating}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                      >
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Profile Picture URL</Label>
                          <Input
                            value={profilePicture}
                            onChange={(e) => setProfilePicture(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            Save
                          </Button>
                          <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      <div className="text-2xl font-bold text-white">
                        {user?.stats.totalGames}
                      </div>
                      <div className="text-sm text-slate-400">Total Games</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                      <div className="text-2xl font-bold text-white">
                        {user?.stats.wins}
                      </div>
                      <div className="text-sm text-slate-400">Wins</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {user?.stats.losses}
                      </div>
                      <div className="text-sm text-slate-400">Losses</div>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {user?.stats.draws}
                      </div>
                      <div className="text-sm text-slate-400">Draws</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center p-4 bg-purple-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400">
                      {winRate}%
                    </div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Games
                  </CardTitle>
                  <CardDescription>Your last 10 games</CardDescription>
                </CardHeader>
                <CardContent>
                  {gameHistory.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">
                      No games played yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {gameHistory.map((game, idx) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                vs {game.opponent}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                game.result === 'win' ? 'bg-green-900 text-green-300' :
                                game.result === 'loss' ? 'bg-red-900 text-red-300' :
                                'bg-gray-700 text-gray-300'
                              }`}>
                                {game.result.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(game.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`text-sm font-bold ${
                            game.ratingChange > 0 ? 'text-green-400' :
                            game.ratingChange < 0 ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;