import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Flame, ArrowRight, ArrowLeft, Sprout, Brain, Compass, Rocket, Briefcase, Heart, Sun, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentList } from '../components/ContentDisplay';

const STAGE_ICONS = {
  seedling: Sprout,
  brain: Brain,
  compass: Compass,
  rocket: Rocket
};

const DOMAIN_ICONS = {
  briefcase: Briefcase,
  heart: Heart,
  sun: Sun,
  palette: Palette
};

export default function OnboardingPage() {
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=welcome, 1-8=quiz, 9=domains, 10=result
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [result, setResult] = useState(null);
  const [onboardingContent, setOnboardingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const data = await api.get('/api/onboarding/quiz');
      setQuizData(data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = quizData ? quizData.questions.length + 2 : 10; // welcome + quiz + domains
  const progress = (step / totalSteps) * 100;

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleDomain = (domainId) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(d => d !== domainId)
        : prev.length < 4 ? [...prev, domainId] : prev
    );
  };

  const handleSubmit = async () => {
    if (selectedDomains.length === 0) return;
    setSubmitting(true);
    try {
      const quizAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
        question_id: parseInt(qId),
        selected_option_index: optIdx
      }));
      const data = await api.post('/api/onboarding/complete', {
        quiz_answers: quizAnswers,
        domains: selectedDomains
      });
      setResult(data);
      setStep(totalSteps);
      await refreshUser();
      
      // Load onboarding content for this stage
      try {
        const contentData = await api.get(`/api/content/for-me?context=onboarding`);
        setOnboardingContent(contentData?.content || []);
      } catch (err) {
        console.error('Failed to load onboarding content:', err);
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ember-gradient">
        <div className="animate-pulse text-center">
          <Flame className="w-12 h-12 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const questions = quizData?.questions || [];
  const domains = quizData?.domains || [];
  const stages = quizData?.stages || {};

  return (
    <div className="min-h-screen ember-gradient">
      {/* Progress bar */}
      {step > 0 && step < totalSteps && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-[hsl(22,12%,40%)] mt-1 text-center">Step {step} of {totalSteps - 1}</p>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen px-4 py-16">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center max-w-lg"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(18,92%,52%)] shadow-[var(--shadow-ember)] mb-6">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">Let's Find Your Starting Point</h1>
              <p className="text-[hsl(22,12%,40%)] mb-2 text-lg">We'll ask a few quick questions to understand where you are right now.</p>
              <p className="text-[hsl(22,12%,40%)] mb-8">There are no wrong answers — just honest ones. This takes about 3 minutes.</p>
              <Button
                data-testid="onboarding-start-button"
                onClick={() => setStep(1)}
                className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-8 py-6 text-lg font-display font-semibold"
              >
                Let's Go <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Quiz Questions */}
          {step >= 1 && step <= questions.length && (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-lg"
            >
              <h2 className="text-xl sm:text-2xl font-display font-semibold mb-6 text-center">
                {questions[step - 1]?.question}
              </h2>
              <div className="space-y-3">
                {questions[step - 1]?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    data-testid={`quiz-option-${step}-${idx}`}
                    onClick={() => handleAnswer(questions[step - 1].id, idx)}
                    className={`quiz-option w-full text-left p-4 rounded-xl border-2 bg-white transition-all ${
                      answers[questions[step - 1].id] === idx
                        ? 'selected border-[hsl(18,92%,52%)] bg-[hsl(18,92%,52%,0.06)]'
                        : 'border-[hsl(28,25%,86%)] hover:border-[hsl(18,92%,52%,0.5)]'
                    }`}
                  >
                    <span className="font-body text-sm sm:text-base">{opt.text}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                  data-testid="onboarding-step-next-button"
                  onClick={() => setStep(step + 1)}
                  disabled={answers[questions[step - 1]?.id] === undefined}
                  className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
                >
                  {step === questions.length ? 'Choose Your Domains' : 'Next'} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Domain Selection */}
          {step === questions.length + 1 && (
            <motion.div
              key="domains"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-lg"
            >
              <h2 className="text-2xl font-display font-semibold mb-2 text-center">Where Do You Want to Grow?</h2>
              <p className="text-[hsl(22,12%,40%)] text-center mb-6">Pick 1–4 areas where you want to start making brave mistakes.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {domains.map((domain) => {
                  const Icon = DOMAIN_ICONS[domain.icon] || Briefcase;
                  const isSelected = selectedDomains.includes(domain.id);
                  return (
                    <button
                      key={domain.id}
                      data-testid={`domain-${domain.id}`}
                      onClick={() => toggleDomain(domain.id)}
                      className={`domain-card relative text-left p-5 rounded-[var(--radius-card)] border-2 bg-white ${
                        isSelected ? 'selected border-[hsl(173,55%,34%)]' : 'border-[hsl(28,25%,86%)]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[hsl(173,55%,34%)] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: domain.color + '15' }}>
                        <Icon className="w-5 h-5" style={{ color: domain.color }} />
                      </div>
                      <h3 className="font-display font-semibold text-sm mb-1">{domain.name}</h3>
                      <p className="text-xs text-[hsl(22,12%,40%)]">{domain.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(questions.length)} className="rounded-xl">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                  data-testid="onboarding-complete-button"
                  onClick={handleSubmit}
                  disabled={selectedDomains.length === 0 || submitting}
                  className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-6 font-display"
                >
                  {submitting ? 'Processing...' : 'Discover My Stage'} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {step === totalSteps && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-lg"
            >
              {(() => {
                const stageInfo = result.stage_info || stages[result.stage] || {};
                const IconComp = STAGE_ICONS[stageInfo.icon] || Flame;
                return (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(18,92%,52%)] shadow-[var(--shadow-ember)] mb-6 animate-float">
                      <IconComp className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Stage {result.stage}: {stageInfo.name}</h1>
                    <p className="text-lg text-[hsl(18,92%,52%)] font-display font-semibold mb-4">{stageInfo.tagline}</p>
                    <p className="text-[hsl(22,12%,40%)] mb-6 leading-relaxed">{stageInfo.description}</p>
                    <Card className="mb-6 bg-[hsl(173,55%,34%,0.05)] border-[hsl(173,55%,34%,0.2)]">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-[hsl(173,55%,34%)]">
                          Your focus: {stageInfo.focus}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Onboarding Content (videos/articles) */}
                    {onboardingContent.length > 0 && (
                      <div className="mb-6 text-left">
                        <h2 className="text-xl font-display font-bold mb-3 text-center">Here's what you need to know:</h2>
                        <ContentList 
                          content={onboardingContent}
                          context="onboarding"
                          onView={(id) => api.post(`/api/content/${id}/view`).catch(() => {})}
                        />
                      </div>
                    )}
                    
                    <Button
                      data-testid="onboarding-go-home-button"
                      onClick={() => navigate('/home')}
                      className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-8 py-6 text-lg font-display font-semibold"
                    >
                      Start Making Mistakes <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
