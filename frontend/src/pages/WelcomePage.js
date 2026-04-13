import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../lib/context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Flame, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const { user } = useApp();
  const navigate = useNavigate();

  if (user) {
    if (!user.onboarded) {
      navigate('/onboarding');
    } else {
      navigate('/home');
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 ember-gradient" />
      <div className="absolute inset-0 ember-corner" />
      <div className="absolute inset-0 teal-corner" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(18,92%,52%)] shadow-[var(--shadow-ember)] mb-4">
              <Flame className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[#241A14] mb-4"
          >
            10 Million Mistakes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg sm:text-xl text-[hsl(22,12%,40%)] mb-2 font-body max-w-lg mx-auto"
          >
            You have 10 million mistakes to make in this lifetime.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg sm:text-xl text-[hsl(18,92%,52%)] font-semibold font-display mb-10"
          >
            The sooner you burn through them, the faster you become who you're meant to be.
          </motion.p>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          >
            {[
              { icon: '\u{1F525}', title: 'Daily Challenges', desc: 'Face the things you usually avoid' },
              { icon: '\u{1F4D3}', title: 'Reflect & Grow', desc: 'Turn every mistake into a lesson' },
              { icon: '\u{1F3C6}', title: 'Track Progress', desc: 'Watch your courage grow daily' }
            ].map((item, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-[hsl(28,25%,86%)]">
                <CardContent className="pt-5 pb-4 px-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[hsl(22,12%,40%)]">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              data-testid="welcome-start-button"
              onClick={() => navigate('/register')}
              className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] px-8 py-6 text-lg font-display font-semibold"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              data-testid="welcome-login-button"
              onClick={() => navigate('/login')}
              className="rounded-full px-8 py-6 text-lg font-display font-semibold bg-white border-2 border-[hsl(18,92%,52%)] text-[hsl(18,92%,52%)] hover:bg-[hsl(18,92%,52%)] hover:text-white shadow-md transition-all duration-200"
            >
              Login
            </Button>
          </motion.div>
          
          {/* Additional login link for clarity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-6"
          >
            <p className="text-sm text-[hsl(22,12%,40%)]">
              Already a member?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[hsl(18,92%,52%)] font-semibold hover:underline"
              >
                Sign in here
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-6 text-sm text-[hsl(22,12%,40%)] font-body"
        >
          Every failure is fuel.
        </motion.p>
      </div>
    </div>
  );
}
