import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Swords, Target, User, LogOut, Cpu } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Play Online',
      description: 'Find an opponent and play chess online',
      icon: Swords,
      path: '/play',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Play vs AI',
      description: 'Challenge the computer at various difficulty levels',
      icon: Cpu,
      path: '/play-ai',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Challenge Friend',
      description: 'Challenge a friend using their user ID',
      icon: Target,
      path: '/challenge',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Daily Puzzles',
      description: 'Solve chess puzzles and improve your rating',
      icon: Crown,
      path: '/puzzles',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Profile',
      description: 'View your stats and game history',
      icon: User,
      path: '/profile',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Chess Master - Play Chess Online</title>
        <meta name="description" content="Play chess online, challenge friends, solve daily puzzles, and compete against AI opponents. Improve your chess skills with Chess Master." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center items-center gap-3 mb-4">
              <Crown className="h-12 w-12 text-yellow-400" />
              <h1 className="text-5xl font-bold text-white">Chess Master</h1>
            </div>
            <p className="text-xl text-slate-300">Welcome back, {user?.username}!</p>
            <p className="text-lg text-purple-300 mt-2">Rating: {user?.rating}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden group"
                    onClick={() => navigate(item.path)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center"
          >
            <Button
              onClick={logout}
              variant="outline"
              className="gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default HomePage;