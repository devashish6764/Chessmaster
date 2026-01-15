import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PlayPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFindOpponent = (timeControl) => {
    toast({
      title: '🚧 Feature Coming Soon',
      description: 'Online matchmaking will be available soon! This requires real-time multiplayer infrastructure.'
    });
  };

  const timeControls = [
    { minutes: 3, label: '3 minutes - Blitz' },
    { minutes: 5, label: '5 minutes - Rapid' },
    { minutes: 10, label: '10 minutes - Classical' }
  ];

  return (
    <>
      <Helmet>
        <title>Play Online - Chess Master</title>
        <meta name="description" content="Play chess online with random opponents. Choose your time control and start playing!" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto py-8">
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
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Clock className="h-8 w-8 text-blue-400" />
                  Play Online
                </CardTitle>
                <CardDescription>
                  Choose your time control and we'll find you an opponent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeControls.map((control) => (
                  <motion.div
                    key={control.minutes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleFindOpponent(control.minutes)}
                      className="w-full h-auto py-6 text-lg justify-start gap-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Clock className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-bold">{control.label}</div>
                        <div className="text-sm opacity-90">{control.minutes} minutes per side</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>How it works:</strong> Select a time control and we'll match you with an opponent of similar rating. Games are played in real-time with live updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PlayPage;