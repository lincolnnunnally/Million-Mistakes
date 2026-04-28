import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Flame, Play, FileText, Lightbulb, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentList } from '../components/ContentDisplay';

export default function LibraryPage() {
  const [allContent, setAllContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const data = await api.get('/api/content/for-me?context=library');
      setAllContent(data?.content || []);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = filter === 'all' 
    ? allContent 
    : allContent.filter(c => c.content_type === filter);

  const videoCount = allContent.filter(c => c.content_type === 'video').length;
  const articleCount = allContent.filter(c => c.content_type === 'article').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Flame className="w-8 h-8 text-[hsl(18,92%,52%)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(28,45%,98%)] via-white to-[hsl(173,55%,98%)]">
      {/* Header */}
      <div className="bg-white border-b border-[hsl(28,25%,86%)]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-12 h-12 rounded-xl bg-[hsl(18,92%,52%)] flex items-center justify-center shadow-[var(--shadow-ember)]">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Content Library</h1>
              <p className="text-[hsl(22,12%,40%)]">Teaching, guidance, and wisdom for your journey</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-5 h-5 text-[hsl(18,92%,52%)] mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{allContent.length}</p>
              <p className="text-xs text-[hsl(22,12%,40%)]">Total Resources</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Play className="w-5 h-5 text-[hsl(173,55%,34%)] mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{videoCount}</p>
              <p className="text-xs text-[hsl(22,12%,40%)]">Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-5 h-5 text-[hsl(43,92%,55%)] mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{articleCount}</p>
              <p className="text-xs text-[hsl(22,12%,40%)]">Articles</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                <Lightbulb className="w-4 h-4 mr-1" /> All ({allContent.length})
              </TabsTrigger>
              <TabsTrigger value="video">
                <Play className="w-4 h-4 mr-1" /> Videos ({videoCount})
              </TabsTrigger>
              <TabsTrigger value="article">
                <FileText className="w-4 h-4 mr-1" /> Articles ({articleCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ContentList 
                content={filteredContent}
                context="library"
                onView={(id) => api.post(`/api/content/${id}/view`).catch(() => {})}
                emptyMessage="No content available yet. Check back soon!"
              />
            </TabsContent>

            <TabsContent value="video">
              <ContentList 
                content={filteredContent}
                context="library"
                onView={(id) => api.post(`/api/content/${id}/view`).catch(() => {})}
                emptyMessage="No videos available yet."
              />
            </TabsContent>

            <TabsContent value="article">
              <ContentList 
                content={filteredContent}
                context="library"
                onView={(id) => api.post(`/api/content/${id}/view`).catch(() => {})}
                emptyMessage="No articles available yet."
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
