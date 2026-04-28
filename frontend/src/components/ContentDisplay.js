import React, { useState } from 'react';
import { Play, FileText, X, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

/**
 * ContentDisplay - Reusable component for displaying teaching content (videos & articles)
 * Used across: Onboarding, Challenges, Reflections, Patterns, Library
 */
export default function ContentDisplay({ content, context = 'library', onView }) {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const handleView = () => {
    setExpanded(true);
    if (onView) onView(content.id);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {content.content_type === 'video' ? (
                <Play className="w-4 h-4 text-[hsl(18,92%,52%)]" />
              ) : (
                <FileText className="w-4 h-4 text-[hsl(173,55%,34%)]" />
              )}
              <CardTitle className="text-lg font-display">{content.title}</CardTitle>
            </div>
            {content.description && (
              <p className="text-sm text-[hsl(22,12%,40%)] mt-1">{content.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {content.theme?.replace('_', ' ')}
              </Badge>
              {content.duration_minutes > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {content.duration_minutes} min
                </Badge>
              )}
            </div>
          </div>
          {!expanded && (
            <Button
              onClick={handleView}
              className="bg-[hsl(18,92%,52%)] hover:bg-[hsl(18,92%,48%)] text-white"
              size="sm"
            >
              {content.content_type === 'video' ? 'Watch' : 'Read'}
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
              onClick={() => setExpanded(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            {content.content_type === 'video' ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(content.body)}
                  title={content.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none p-4 bg-[hsl(36,45%,94%)] rounded-lg"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * ContentList - Display multiple content pieces
 */
export function ContentList({ content, context, onView, emptyMessage }) {
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8 text-[hsl(22,12%,40%)]">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage || 'No content available yet.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.map(item => (
        <ContentDisplay 
          key={item.id} 
          content={item} 
          context={context}
          onView={onView}
        />
      ))}
    </div>
  );
}

/**
 * MindsetMoment - Display a short reminder before challenges
 */
export function MindsetMoment({ moment }) {
  if (!moment) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-[hsl(18,92%,52%,0.1)] to-[hsl(173,55%,34%,0.1)] rounded-lg border-l-4 border-[hsl(18,92%,52%)]">
      <div className="flex items-start gap-3">
        <Target className="w-5 h-5 text-[hsl(18,92%,52%)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[hsl(22,12%,20%)] mb-1">Before you begin:</p>
          <p className="text-base font-display text-[hsl(22,12%,20%)]">{moment.text}</p>
        </div>
      </div>
    </div>
  );
}
