import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Flame, RefreshCw, ArrowRight, Zap, Trophy, BookOpen, Sparkles, Brain, MessageSquare, Users, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export default function HomePage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [mantraIdx, setMantraIdx] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [challengeData, progressData, mantrasData] = await Promise.all([
        api.get('/api/challenge/today'),
        api.get('/api/progress'),
        api.get('/api/mantras')
      ]);
      setChallenge(challengeData?.challenge);
      setProgress(progressData);
      setMantras(mantrasData?.mantras || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rotate mantras
  useEffect(() => {
    if (mantras.length > 1) {
      const interval = setInterval(() => {
        setMantraIdx(prev => (prev + 1) % mantras.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [mantras]);

  const handleSwap = async () => {
    setSwapping(true);
    try {
      const data = await api.post('/api/challenge/swap');
      setChallenge(data?.challenge);
    } catch (err) {
      console.error('Swap failed:', err);
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Flame className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  const currentLevel = progress?.current_level || { level: 1, name: 'Mistake Newbie' };
  const totalMistakes = progress?.total_mistakes || 0;
  const streak = progress?.streak || 0;

  return (
    <div className="main-content">
      <div className="mx-auto w-full max-w-3xl px-[var(--space-page-x)] py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold">Hey {user?.name || 'Friend'}!</h1>
          <p className="text-[hsl(22,12%,40%)] text-sm">Ready to make today's brave mistake?</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <Card className="bg-white">
            <CardContent className="p-3 text-center">
              <p data-testid="mistakes-burned-counter" className="text-2xl font-display font-bold text-[hsl(18,92%,52%)] animate-count-glow">
                <CountUp end={totalMistakes} duration={1.5} />
              </p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">mistakes burned</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold text-[hsl(173,55%,34%)]">
                {streak}
              </p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">day streak</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-display font-bold text-[hsl(43,92%,55%)]">
                Lv.{currentLevel.level}
              </p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent truncate">{currentLevel.name}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="challenge-card shadow-[var(--shadow-soft)] mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2 rounded-full px-3 py-1 bg-[hsl(18,92%,52%,0.1)] text-[hsl(18,92%,52%)] border-[hsl(18,92%,52%,0.2)]" variant="outline">
                    <Zap className="w-3 h-3 mr-1" /> Today's Challenge
                  </Badge>
                  <CardTitle className="text-xl font-display">{challenge?.title || 'Loading...'}</CardTitle>
                </div>
                {challenge?.difficulty && (
                  <Badge variant="outline" className="rounded-full text-xs px-2 py-0.5 border-[hsl(28,25%,86%)]">
                    Difficulty {challenge.difficulty}/5
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[hsl(22,12%,40%)] mb-3 leading-relaxed">{challenge?.challenge}</p>
              {challenge?.why_this && (
                <p className="text-sm text-[hsl(173,55%,34%)] bg-[hsl(173,55%,34%,0.05)] rounded-lg p-3 mb-4 border border-[hsl(173,55%,34%,0.1)]">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  {challenge.why_this}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  data-testid="challenge-do-it-button"
                  onClick={() => navigate('/reflect', { state: { challenge } })}
                  className="flex-1 rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] font-display font-semibold"
                  disabled={challenge?.completed}
                >
                  {challenge?.completed ? 'Done for today!' : 'I did it! Log my reflection'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  data-testid="daily-challenge-swap-button"
                  variant="outline"
                  onClick={handleSwap}
                  disabled={swapping}
                  className="rounded-xl border-[hsl(28,25%,86%)] hover:bg-[hsl(36,45%,94%)]"
                  title="Get a different challenge"
                >
                  <RefreshCw className={`w-4 h-4 ${swapping ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mantra Carousel */}
        {mantras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[hsl(36,45%,97%)] border-[hsl(28,25%,86%)] mb-6">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Flame className="w-4 h-4 text-[hsl(18,92%,52%)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(22,12%,40%)] mb-1 font-medium">Daily Mantra</p>
                    <p className="font-display font-semibold text-base leading-relaxed">
                      "{mantras[mantraIdx]?.text}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/vault')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(173,55%,34%,0.1)] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[hsl(173,55%,34%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Victory Vault</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Your lessons</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/patterns')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
                <Brain className="w-5 h-5 text-[hsl(18,92%,52%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Patterns</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Your walls</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/stories')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(43,92%,55%,0.15)] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[hsl(43,92%,45%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Stories</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Community</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/buddies')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(200,70%,40%,0.1)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(200,70%,40%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Community</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Buddies & Mentors</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Extra Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mt-3"
        >
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/mantras')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(43,92%,55%,0.15)] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[hsl(43,92%,45%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Mantras</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Daily fuel</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow"
            onClick={() => navigate('/videos')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
                <Video className="w-5 h-5 text-[hsl(18,92%,52%)]" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm">Videos</p>
                <p className="text-xs text-[hsl(22,12%,40%)]">Watch & learn</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
