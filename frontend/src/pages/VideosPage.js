import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { Play, Video, Eye, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const loadVideos = async () => {
    try {
      const params = domainFilter && domainFilter !== 'all' ? `?domain=${domainFilter}` : '';
      const data = await api.get(`/api/videos${params}`);
      setVideos(data?.videos || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainFilter]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Video className="w-10 h-10 text-[hsl(18,92%,52%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading videos...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(18,92%,52%,0.1)] flex items-center justify-center">
                <Video className="w-5 h-5 text-[hsl(18,92%,52%)]" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Video Library</h1>
                <p className="text-sm text-[hsl(22,12%,40%)]">Watch, learn, grow</p>
              </div>
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-44">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="Money/Career">Money / Career</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
                <SelectItem value="Spiritual/Emotional">Spiritual / Emotional</SelectItem>
                <SelectItem value="Skills/Hobbies">Skills / Hobbies</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Video Player */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
              <CardContent className="p-4">
                <h2 className="font-display font-semibold text-lg mb-1">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-sm text-[hsl(22,12%,40%)] mb-2">{selectedVideo.description}</p>
                )}
                <div className="flex items-center gap-2">
                  {selectedVideo.domain && selectedVideo.domain !== 'general' && (
                    <Badge variant="outline" className="rounded-full text-xs">{selectedVideo.domain}</Badge>
                  )}
                  {selectedVideo.stage > 0 && (
                    <Badge variant="outline" className="rounded-full text-xs">Stage {selectedVideo.stage}</Badge>
                  )}
                  <span className="text-xs text-[hsl(22,12%,40%)] flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {selectedVideo.views || 0} views
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                  className="mt-2"
                >
                  Close Player
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No videos yet</h2>
            <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
              Videos will appear here as the admin adds content. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-[var(--shadow-soft)] transition-shadow overflow-hidden"
                  onClick={async () => {
                    setSelectedVideo(video);
                    try { await api.get(`/api/videos/${video.id}`); } catch {}
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[hsl(36,45%,94%)] relative flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-12 h-12 text-[hsl(18,92%,52%,0.3)]" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-[hsl(18,92%,52%)] ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center gap-2">
                      {video.domain && video.domain !== 'general' && (
                        <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">{video.domain}</Badge>
                      )}
                      <span className="text-[10px] text-[hsl(22,12%,40%)] flex items-center gap-0.5">
                        <Eye className="w-3 h-3" /> {video.views || 0}
                      </span>
                    </div>
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
