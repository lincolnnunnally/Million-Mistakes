import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Flame, Trophy, Zap, Calendar, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await api.get('/api/progress');
      setProgress(data);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <TrendingUp className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const { total_mistakes, current_level, next_level, streak, domain_breakdown, levels } = progress;
  const progressToNext = next_level
    ? ((total_mistakes - current_level.min_mistakes) / (next_level.min_mistakes - current_level.min_mistakes)) * 100
    : 100;

  return (
    <div className="main-content">
      <div className="mx-auto w-full max-w-3xl px-[var(--space-page-x)] py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(18,92%,52%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Your Progress</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Every mistake makes you stronger</p>
            </div>
          </div>
        </motion.div>

        {/* Big Counter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 bg-white overflow-hidden">
            <CardContent className="p-6 text-center">
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent mb-1">MISTAKES BURNED</p>
              <p className="text-5xl sm:text-6xl font-display font-bold text-[hsl(18,92%,52%)] animate-count-glow">
                <CountUp end={total_mistakes} duration={2} separator="," />
              </p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent mt-1">/ 10,000,000</p>
              <Progress
                value={Math.min((total_mistakes / 10000000) * 100, 100)}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-[hsl(173,55%,34%)] mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-[hsl(173,55%,34%)]">{streak}</p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-[hsl(43,92%,55%)] mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-[hsl(43,92%,45%)]">Lv.{current_level?.level}</p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">{current_level?.name}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-display font-semibold mb-3">Level Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {current_level?.level}: {current_level?.name}</span>
                {next_level && (
                  <span className="text-xs text-[hsl(22,12%,40%)]">
                    {next_level.min_mistakes - total_mistakes} more to Lv.{next_level.level}
                  </span>
                )}
              </div>
              <Progress value={progressToNext} className="h-3 mb-4" />

              {/* All Levels */}
              <div className="space-y-2 mt-4">
                {levels?.map((level) => {
                  const achieved = total_mistakes >= level.min_mistakes;
                  return (
                    <div
                      key={level.level}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        achieved ? 'bg-[hsl(18,92%,52%,0.05)]' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-full w-7 h-7 flex items-center justify-center p-0 text-xs ${
                            achieved
                              ? 'bg-[hsl(18,92%,52%)] text-white border-[hsl(18,92%,52%)]'
                              : 'border-[hsl(28,25%,86%)]'
                          }`}
                        >
                          {level.level}
                        </Badge>
                        <span className={`text-sm font-medium ${achieved ? '' : 'text-[hsl(22,12%,40%)]'}`}>
                          {level.name}
                        </span>
                      </div>
                      <span className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">
                        {level.min_mistakes}+ mistakes
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Domain Breakdown */}
        {Object.keys(domain_breakdown || {}).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-5">
                <h3 className="font-display font-semibold mb-3">Mistakes by Domain</h3>
                <div className="space-y-3">
                  {Object.entries(domain_breakdown).map(([domain, count]) => (
                    <div key={domain}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{domain}</span>
                        <span className="font-mono-accent text-[hsl(22,12%,40%)]">{count}</span>
                      </div>
                      <Progress
                        value={(count / total_mistakes) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
