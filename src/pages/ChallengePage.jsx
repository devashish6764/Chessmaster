import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, Send, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ChallengePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opponentId, setOpponentId] = useState('');
  const [timeControl, setTimeControl] = useState(5);

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast({
      title: 'User ID copied!',
      description: 'Share this ID with your friend'
    });
  };

  const handleSendChallenge = () => {
    if (!opponentId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter opponent\'s user ID',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: '🚧 Feature Coming Soon',
      description: 'Challenge system will be available soon! This requires real-time multiplayer infrastructure.'
    });
  };

  return (
    <>
      <Helmet>
        <title>Challenge Friend - Chess Master</title>
        <meta name="description" content="Challenge your friends to a chess game using their user ID." />
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
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your User ID</CardTitle>
                <CardDescription>Share this ID with friends to receive challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={user?.id}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyUserId} className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-400" />
                  Challenge a Friend
                </CardTitle>
                <CardDescription>Enter your friend's user ID to send a challenge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="opponentId">Opponent's User ID</Label>
                  <Input
                    id="opponentId"
                    value={opponentId}
                    onChange={(e) => setOpponentId(e.target.value)}
                    placeholder="Enter user ID"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeControl">Time Control</Label>
                  <select
                    id="timeControl"
                    value={timeControl}
                    onChange={(e) => setTimeControl(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-white text-gray-900 border border-slate-300"
                  >
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                  </select>
                </div>

                <Button
                  onClick={handleSendChallenge}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Challenge
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Challenges</CardTitle>
                <CardDescription>Challenges you've sent or received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  No pending challenges
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ChallengePage;