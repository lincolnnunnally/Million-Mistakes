import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MessageSquare, Heart, Eye, EyeOff, Send, ThumbsUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StoriesPage() {
  const { user } = useApp();
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('feed');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedData, myData] = await Promise.all([
        api.get('/api/stories'),
        api.get('/api/stories/mine')
      ]);
      setStories(feedData?.stories || []);
      setMyStories(myData?.stories || []);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (storyId) => {
    try {
      const data = await api.post(`/api/stories/${storyId}/like`);
      setStories(prev => prev.map(s =>
        s.id === storyId
          ? { ...s, liked: data.action === 'liked', likes: data.likes }
          : s
      ));
    } catch (err) {
      console.error('Failed to like story:', err);
    }
  };

  const responseLabels = {
    pushed_through: { text: 'Pushed Through', color: 'bg-[hsl(173,55%,34%,0.1)] text-[hsl(173,55%,34%)]' },
    tried_and_failed: { text: 'Tried & Failed', color: 'bg-[hsl(18,92%,52%,0.1)] text-[hsl(18,92%,52%)]' },
    ran: { text: 'Ran From It', color: 'bg-[hsl(22,12%,40%,0.1)] text-[hsl(22,12%,40%)]' }
  };

  const statusLabels = {
    pending: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
    approved: { text: 'Published', color: 'bg-green-100 text-green-700' },
    rejected: { text: 'Not Approved', color: 'bg-red-100 text-red-700' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <MessageSquare className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading stories...</p>
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
            <div className="w-10 h-10 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[hsl(18,92%,52%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Mistake Stories</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Real stories from people failing forward</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="mine">My Stories ({myStories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            {stories.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
                <h2 className="text-xl font-display font-semibold mb-2">No stories yet</h2>
                <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
                  Be the first to share your story! After logging a reflection, you can share it with the community.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story, idx) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white hover:shadow-[var(--shadow-soft)] transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
                              <span className="text-sm font-display font-bold text-[hsl(18,92%,52%)]">
                                {story.anonymous ? '?' : (story.user_name || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-display font-semibold text-sm">
                                {story.anonymous ? 'Anonymous Brave Soul' : story.user_name}
                              </p>
                              <p className="text-[10px] text-[hsl(22,12%,40%)]">
                                Stage {story.stage} {story.domain ? `\u2022 ${story.domain}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-[hsl(22,12%,40%)] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {story.created_at ? new Date(story.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>

                        <h3 className="font-display font-semibold mb-2">{story.title}</h3>

                        {story.obstacle && (
                          <p className="text-sm text-[hsl(22,12%,40%)] mb-2">
                            <span className="font-medium">The wall:</span> {story.obstacle}
                          </p>
                        )}

                        <p className="text-sm mb-3">{story.story}</p>

                        <div className="bg-[hsl(173,55%,34%,0.04)] rounded-lg p-3 border border-[hsl(173,55%,34%,0.1)] mb-3">
                          <p className="text-sm font-display font-semibold text-[hsl(173,55%,34%)]">
                            Lesson: "{story.lesson}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {story.response && responseLabels[story.response] && (
                              <Badge variant="outline" className={`rounded-full text-xs ${responseLabels[story.response].color}`}>
                                {responseLabels[story.response].text}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(story.id)}
                            className={`rounded-full ${story.liked ? 'text-[hsl(18,92%,52%)]' : 'text-[hsl(22,12%,40%)]'}`}
                          >
                            <ThumbsUp className={`w-4 h-4 mr-1 ${story.liked ? 'fill-current' : ''}`} />
                            {story.likes || 0}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {myStories.length === 0 ? (
              <div className="text-center py-16">
                <Send className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
                <h2 className="text-xl font-display font-semibold mb-2">You haven't shared any stories</h2>
                <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
                  After logging a reflection, visit your Victory Vault and share a story with the community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myStories.map((story, idx) => (
                  <Card key={story.id} className="bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-semibold text-sm">{story.title}</h3>
                        <Badge className={`rounded-full text-xs ${statusLabels[story.status]?.color || ''}`}>
                          {statusLabels[story.status]?.text || story.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[hsl(22,12%,40%)] line-clamp-2">{story.story}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[hsl(22,12%,40%)]">
                        <span>{story.anonymous ? 'Posted anonymously' : 'Posted as ' + story.user_name}</span>
                        <span>\u2022 {story.likes || 0} likes</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
