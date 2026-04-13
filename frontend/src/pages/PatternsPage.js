import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Flame, TrendingUp, Brain, Target, ArrowRight, Sparkles, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const THEME_COLORS = {
  fear_of_judgment: '#FF6B35',
  perfectionism: '#FFD166',
  avoidance: '#0B7285',
  fear_of_rejection: '#E63946',
  self_doubt: '#457B9D',
  people_pleasing: '#F7B267',
  comfort_zone: '#0F766E',
  overthinking: '#7C3AED'
};

export default function PatternsPage() {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      const data = await api.get('/api/patterns');
      setPatterns(data);
    } catch (err) {
      console.error('Failed to load patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Brain className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  if (!patterns || !patterns.has_data) {
    return (
      <div className="main-content">
        <div className="mx-auto w-full max-w-3xl px-[var(--space-page-x)] py-6">
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">Patterns Need Data</h2>
            <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
              {patterns?.message || 'Keep logging reflections to unlock pattern insights! You need at least 3 entries.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { top_patterns, response_breakdown, ai_summary, trend, pattern_breaker_suggestion } = patterns;
  const courageRate = response_breakdown?.courage_rate || 0;

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
              <Brain className="w-5 h-5 text-[hsl(18,92%,52%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Pattern Discovery</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Your hidden walls, revealed</p>
            </div>
          </div>
        </motion.div>

        {/* AI Weekly Summary */}
        {ai_summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 bg-[hsl(36,45%,97%)] border-[hsl(28,25%,86%)]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-[hsl(18,92%,52%)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(22,12%,40%)] mb-1 font-medium">Weekly Insight</p>
                    <p className="font-body text-sm leading-relaxed">{ai_summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Courage Rate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <ShieldCheck className="w-6 h-6 text-[hsl(173,55%,34%)] mx-auto mb-2" />
              <p className="text-3xl font-display font-bold text-[hsl(173,55%,34%)]">{courageRate}%</p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">Courage Rate</p>
              <p className="text-[10px] text-[hsl(22,12%,40%)] mt-1">Pushed through or tried</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-[hsl(18,92%,52%)] mx-auto mb-2" />
              <p className="text-lg font-display font-bold capitalize">
                {trend === 'improving' ? 'Improving!' : trend === 'steady' ? 'Holding Steady' : 'Just Starting'}
              </p>
              <p className="text-xs text-[hsl(22,12%,40%)] font-mono-accent">Your Trend</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">How You Responded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Pushed Through', value: response_breakdown?.pushed_through || 0, color: 'hsl(173,55%,34%)', emoji: '\u{1F4AA}' },
                  { label: 'Tried & Failed', value: response_breakdown?.tried_and_failed || 0, color: 'hsl(18,92%,52%)', emoji: '\u{1F525}' },
                  { label: 'Ran From It', value: response_breakdown?.ran || 0, color: 'hsl(22,12%,60%)', emoji: '\u{1F3C3}' }
                ].map((item) => {
                  const total = (response_breakdown?.pushed_through || 0) + (response_breakdown?.tried_and_failed || 0) + (response_breakdown?.ran || 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.emoji} {item.label}</span>
                        <span className="font-mono-accent">{item.value} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Patterns */}
        {top_patterns && top_patterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Your Recurring Walls</CardTitle>
                <p className="text-sm text-[hsl(22,12%,40%)]">Obstacles that keep showing up in your reflections</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top_patterns.map((pattern, idx) => (
                    <div key={pattern.theme} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(36,45%,97%)]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: THEME_COLORS[pattern.theme] || '#FF6B35' }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-semibold text-sm">{pattern.label}</p>
                        <p className="text-xs text-[hsl(22,12%,40%)]">
                          Appeared in {pattern.count} reflection{pattern.count !== 1 ? 's' : ''} ({pattern.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pattern Breaker */}
        {pattern_breaker_suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="challenge-card shadow-[var(--shadow-soft)]">
              <CardHeader className="pb-2">
                <Badge className="mb-2 rounded-full px-3 py-1 bg-[hsl(173,55%,34%,0.1)] text-[hsl(173,55%,34%)] border-[hsl(173,55%,34%,0.2)] w-fit" variant="outline">
                  <Target className="w-3 h-3 mr-1" /> Pattern Breaker
                </Badge>
                <CardTitle className="text-lg font-display">{pattern_breaker_suggestion.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[hsl(22,12%,40%)] mb-3 leading-relaxed text-sm">{pattern_breaker_suggestion.suggestion}</p>
                <div className="bg-[hsl(173,55%,34%,0.05)] rounded-lg p-3 border border-[hsl(173,55%,34%,0.1)]">
                  <p className="text-sm font-medium text-[hsl(173,55%,34%)]">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Micro-action: {pattern_breaker_suggestion.micro_action}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
