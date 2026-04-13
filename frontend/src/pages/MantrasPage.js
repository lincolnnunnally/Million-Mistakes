import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Flame, Heart, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MantrasPage() {
  const [mantras, setMantras] = useState([]);
  const [savedMantras, setSavedMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('discover');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allData, savedData] = await Promise.all([
        api.get('/api/mantras'),
        api.get('/api/mantras/saved')
      ]);
      setMantras(allData?.mantras || []);
      setSavedMantras(savedData?.mantras || []);
    } catch (err) {
      console.error('Failed to load mantras:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (mantraId) => {
    try {
      const data = await api.post(`/api/mantras/${mantraId}/save`);
      if (data.action === 'saved') {
        toast.success('Mantra saved to your collection!');
      } else {
        toast.info('Mantra removed from your collection.');
      }
      loadData();
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const MantraCard = ({ mantra, idx }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Card className="bg-white hover:shadow-[var(--shadow-soft)] transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Flame className="w-4 h-4 text-[hsl(18,92%,52%)]" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-base leading-relaxed mb-2">
                "{mantra.text}"
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full text-xs px-2 py-0.5 border-[hsl(28,25%,86%)] text-[hsl(22,12%,40%)]">
                  {mantra.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSave(mantra.id)}
                  className={`rounded-full ${mantra.saved ? 'text-red-500' : 'text-[hsl(22,12%,40%)]'}`}
                >
                  <Heart className={`w-4 h-4 ${mantra.saved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BookOpen className="w-10 h-10 text-[hsl(43,92%,55%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading mantras...</p>
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
            <div className="w-10 h-10 rounded-lg bg-[hsl(43,92%,55%,0.15)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[hsl(43,92%,45%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Mistake Mantras</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Daily fuel for your journey</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedMantras.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="space-y-4">
              {mantras.map((m, idx) => (
                <MantraCard key={m.id} mantra={m} idx={idx} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            {savedMantras.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
                <h2 className="text-xl font-display font-semibold mb-2">No saved mantras yet</h2>
                <p className="text-[hsl(22,12%,40%)]">Tap the heart on mantras you love to save them here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedMantras.map((m, idx) => (
                  <MantraCard key={m.id} mantra={m} idx={idx} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
