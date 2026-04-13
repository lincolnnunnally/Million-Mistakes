import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VaultPage() {
  const [vault, setVault] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    try {
      const data = await api.get('/api/vault');
      setVault(data?.vault || []);
      setTotal(data?.total || 0);
    } catch (err) {
      console.error('Failed to load vault:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Trophy className="w-10 h-10 text-[hsl(173,55%,34%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading your victories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="mx-auto w-full max-w-3xl px-[var(--space-page-x)] py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(173,55%,34%,0.1)] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[hsl(173,55%,34%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Victory Vault</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">{total} lessons earned through courage</p>
            </div>
          </div>
        </motion.div>

        {vault.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">Your first lesson is waiting</h2>
            <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
              Complete today's challenge and log your reflection. Every lesson you learn gets saved here as proof you're growing.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {vault.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white hover:shadow-[var(--shadow-soft)] transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {entry.challenge_title && (
                          <Badge variant="outline" className="rounded-full text-xs px-2 py-0.5 border-[hsl(18,92%,52%,0.3)] text-[hsl(18,92%,52%)]">
                            {entry.challenge_title}
                          </Badge>
                        )}
                        <Badge variant="outline" className="rounded-full text-xs px-2 py-0.5 border-[hsl(28,25%,86%)] text-[hsl(22,12%,40%)]">
                          #{idx + 1}
                        </Badge>
                      </div>
                      <span className="text-xs text-[hsl(22,12%,40%)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </span>
                    </div>

                    {/* The lesson - hero of the card */}
                    <div className="bg-[hsl(173,55%,34%,0.04)] rounded-lg p-4 border border-[hsl(173,55%,34%,0.1)] mb-3">
                      <p className="font-display font-semibold text-[hsl(173,55%,34%)]">
                        "{entry.lesson}"
                      </p>
                    </div>

                    {/* Story snippet */}
                    <p className="text-sm text-[hsl(22,12%,40%)] line-clamp-2">
                      {entry.story}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
