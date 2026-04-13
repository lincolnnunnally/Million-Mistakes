import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Flame, ArrowLeft, Send, PartyPopper, BookOpen, Home, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';

const RESPONSE_OPTIONS = [
  { value: 'pushed_through', label: 'Pushed through it', emoji: '\u{1F4AA}' },
  { value: 'tried_and_failed', label: 'Tried and failed', emoji: '\u{1F525}' },
  { value: 'ran', label: 'I ran from it', emoji: '\u{1F3C3}' }
];

export default function ReflectionPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state?.challenge;

  const [step, setStep] = useState(0);
  const [obstacle, setObstacle] = useState('');
  const [response, setResponse] = useState('');
  const [story, setStory] = useState('');
  const [lesson, setLesson] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[hsl(22,12%,40%)] mb-4">No challenge selected. Go to Home to get today's challenge!</p>
          <Button onClick={() => navigate('/home')} className="rounded-full bg-[hsl(18,92%,52%)] text-white">Go Home</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!obstacle || !response || !story || !lesson) return;
    setSubmitting(true);
    try {
      const data = await api.post('/api/reflections', {
        challenge_id: challenge.id,
        obstacle,
        response,
        story,
        lesson
      });
      setResult(data);
      setStep(4);

      // Fire confetti!
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B35', '#FFD166', '#0F766E', '#FF7A18', '#F7B267']
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#FF6B35', '#FFD166', '#0F766E']
          });
        }, 300);
      }
    } catch (err) {
      console.error('Failed to submit reflection:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const questions = [
    {
      label: 'What obstacle showed up today?',
      hint: 'What got in your way? Fear, doubt, procrastination, someone\'s opinion?',
      value: obstacle,
      onChange: setObstacle,
      type: 'text'
    },
    {
      label: 'What did you do?',
      hint: 'Be honest. Every answer here is progress.',
      value: response,
      onChange: setResponse,
      type: 'choice'
    },
    {
      label: 'What actually happened?',
      hint: 'Tell the story in 2-3 sentences. The messy truth.',
      value: story,
      onChange: setStory,
      type: 'text'
    },
    {
      label: 'What did you learn?',
      hint: 'One sentence that turns this mistake into progress.',
      value: lesson,
      onChange: setLesson,
      type: 'text'
    }
  ];

  return (
    <div className="main-content">
      <div className="mx-auto w-full max-w-2xl px-[var(--space-page-x)] py-6">
        {/* Back button */}
        {step < 4 && (
          <Button
            variant="ghost"
            onClick={() => step === 0 ? navigate('/home') : setStep(step - 1)}
            className="mb-4 rounded-xl"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> {step === 0 ? 'Back to Home' : 'Previous Question'}
          </Button>
        )}

        {/* Challenge context */}
        {step < 4 && (
          <Card className="mb-6 bg-[hsl(36,45%,97%)] border-[hsl(28,25%,86%)]">
            <CardContent className="p-4">
              <Badge className="mb-1 rounded-full px-2 py-0.5 bg-[hsl(18,92%,52%,0.1)] text-[hsl(18,92%,52%)] border-[hsl(18,92%,52%,0.2)]" variant="outline">
                <Zap className="w-3 h-3 mr-1" /> Today's Challenge
              </Badge>
              <p className="font-display font-semibold text-sm mt-1">{challenge.title}</p>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {/* Questions */}
          {step < 4 && (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <Card className="reflection-card shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono-accent text-[hsl(22,12%,40%)]">
                      Question {step + 1} of 4
                    </span>
                  </div>
                  <CardTitle className="text-lg font-display">{questions[step].label}</CardTitle>
                  <p className="text-sm text-[hsl(22,12%,40%)]">{questions[step].hint}</p>
                </CardHeader>
                <CardContent>
                  {questions[step].type === 'choice' ? (
                    <div className="space-y-3">
                      {RESPONSE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          data-testid={`response-${opt.value}`}
                          onClick={() => setResponse(opt.value)}
                          className={`quiz-option w-full text-left p-4 rounded-xl border-2 bg-white transition-all ${
                            response === opt.value
                              ? 'selected border-[hsl(18,92%,52%)] bg-[hsl(18,92%,52%,0.06)]'
                              : 'border-[hsl(28,25%,86%)] hover:border-[hsl(18,92%,52%,0.5)]'
                          }`}
                        >
                          <span className="text-lg mr-2">{opt.emoji}</span>
                          <span className="font-body">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      data-testid={`reflection-input-${step}`}
                      placeholder="Write here..."
                      value={questions[step].value}
                      onChange={(e) => questions[step].onChange(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  )}

                  <div className="flex justify-end mt-6">
                    {step < 3 ? (
                      <Button
                        data-testid="reflection-next-button"
                        onClick={() => setStep(step + 1)}
                        disabled={
                          questions[step].type === 'choice'
                            ? !response
                            : !questions[step].value.trim()
                        }
                        className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
                      >
                        Next <Zap className="ml-2 w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        data-testid="reflection-form-submit-button"
                        onClick={handleSubmit}
                        disabled={!lesson.trim() || submitting}
                        className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
                      >
                        {submitting ? 'Saving...' : 'Log This Mistake'}
                        <Send className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Celebration */}
          {step === 4 && result && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(18,92%,52%)] shadow-[var(--shadow-ember)] mb-6 animate-pulse-ember">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-display font-bold mb-2">Mistake Burned!</h1>

              <p data-testid="total-mistakes-display" className="text-5xl font-display font-bold text-[hsl(18,92%,52%)] my-4 animate-count-glow">
                #<CountUp end={result.total_mistakes} duration={2} />
              </p>

              <p className="text-lg text-[hsl(22,12%,40%)] mb-2">{result.encouragement}</p>

              <Card className="mt-6 mb-6 bg-[hsl(173,55%,34%,0.05)] border-[hsl(173,55%,34%,0.2)]">
                <CardContent className="p-4">
                  <p className="text-xs text-[hsl(173,55%,34%)] font-medium mb-1">Your Level</p>
                  <p className="font-display font-bold text-[hsl(173,55%,34%)]">
                    Level {result.current_level?.level}: {result.current_level?.name}
                  </p>
                  {result.next_level && (
                    <p className="text-xs text-[hsl(22,12%,40%)] mt-1">
                      {result.next_level.min_mistakes - result.total_mistakes} more mistakes to Level {result.next_level.level}
                    </p>
                  )}
                </CardContent>
              </Card>

              {challenge?.coaching_line && (
                <Card className="mb-6 bg-[hsl(36,45%,97%)]">
                  <CardContent className="p-4">
                    <Flame className="w-5 h-5 text-[hsl(18,92%,52%)] mb-2 mx-auto" />
                    <p className="font-display text-sm italic">"{challenge.coaching_line}"</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  data-testid="go-vault-button"
                  variant="outline"
                  onClick={() => navigate('/vault')}
                  className="rounded-full px-6 border-[hsl(173,55%,34%)] text-[hsl(173,55%,34%)] hover:bg-[hsl(173,55%,34%,0.05)]"
                >
                  <BookOpen className="mr-2 w-4 h-4" /> View Victory Vault
                </Button>
                <Button
                  data-testid="go-home-after-reflection"
                  onClick={() => navigate('/home')}
                  className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
                >
                  <Home className="mr-2 w-4 h-4" /> Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
