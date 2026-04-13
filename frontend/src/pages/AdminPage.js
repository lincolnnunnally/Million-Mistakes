import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Flame, Users, BookOpen, MessageSquare, BarChart3, Plus, Trash2, Edit,
  TrendingUp, Zap, Eye, LogOut, Shield, Video, UserPlus, Check, X, Handshake
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, logout } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [extStats, setExtStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [mantras, setMantras] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [stories, setStories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [mentorOffers, setMentorOffers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mantra form
  const [mantraText, setMantraText] = useState('');
  const [mantraCategory, setMantraCategory] = useState('general');
  const [editingMantra, setEditingMantra] = useState(null);

  // Video form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDomain, setVideoDomain] = useState('general');
  const [videoStage, setVideoStage] = useState('0');
  const [videoThumb, setVideoThumb] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);

  // Match form
  const [matchMentorId, setMatchMentorId] = useState('');
  const [matchMenteeId, setMatchMenteeId] = useState('');
  const [matchDomain, setMatchDomain] = useState('');
  const [matchNote, setMatchNote] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'mantras') loadMantras();
    else if (tab === 'reflections') loadReflections();
    else if (tab === 'stories') loadStories();
    else if (tab === 'videos') loadVideos();
    else if (tab === 'community') loadCommunity();
  }, [tab]);

  const loadStats = async () => {
    try {
      const [statsData, extData] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/stats/extended')
      ]);
      setStats(statsData);
      setExtStats(extData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try { const data = await api.get('/api/admin/users'); setUsers(data?.users || []); }
    catch (err) { console.error(err); }
  };
  const loadMantras = async () => {
    try { const data = await api.get('/api/admin/mantras'); setMantras(data?.mantras || []); }
    catch (err) { console.error(err); }
  };
  const loadReflections = async () => {
    try { const data = await api.get('/api/admin/reflections'); setReflections(data?.reflections || []); }
    catch (err) { console.error(err); }
  };
  const loadStories = async () => {
    try { const data = await api.get('/api/admin/stories'); setStories(data?.stories || []); }
    catch (err) { console.error(err); }
  };
  const loadVideos = async () => {
    try { const data = await api.get('/api/admin/videos'); setVideos(data?.videos || []); }
    catch (err) { console.error(err); }
  };
  const loadCommunity = async () => {
    try {
      const [buddyData, connData, mentorData] = await Promise.all([
        api.get('/api/admin/buddy-requests'),
        api.get('/api/admin/connections'),
        api.get('/api/admin/mentor-offers')
      ]);
      setBuddyRequests(buddyData?.requests || []);
      setConnections(connData?.connections || []);
      setMentorOffers(mentorData?.offers || []);
    } catch (err) { console.error(err); }
  };

  // Mantra CRUD
  const handleCreateMantra = async () => {
    if (!mantraText.trim()) return;
    try {
      await api.post('/api/admin/mantras', { text: mantraText, category: mantraCategory });
      toast.success('Mantra created!');
      setMantraText(''); setMantraCategory('general'); loadMantras();
    } catch (err) { toast.error('Failed'); }
  };
  const handleUpdateMantra = async () => {
    if (!editingMantra || !mantraText.trim()) return;
    try {
      await api.put(`/api/admin/mantras/${editingMantra.id}`, { text: mantraText, category: mantraCategory });
      toast.success('Updated!');
      setEditingMantra(null); setMantraText(''); setMantraCategory('general'); loadMantras();
    } catch (err) { toast.error('Failed'); }
  };
  const handleDeleteMantra = async (id) => {
    try { await api.delete(`/api/admin/mantras/${id}`); toast.success('Deleted'); loadMantras(); }
    catch (err) { toast.error('Failed'); }
  };

  // Story moderation
  const handleModerateStory = async (storyId, status) => {
    try {
      await api.put(`/api/admin/stories/${storyId}/moderate`, { status, reason: '' });
      toast.success(`Story ${status}`);
      loadStories();
    } catch (err) { toast.error('Failed'); }
  };

  // Video CRUD
  const handleCreateVideo = async () => {
    if (!videoTitle.trim() || !videoUrl.trim()) return;
    try {
      await api.post('/api/admin/videos', {
        title: videoTitle, description: videoDesc, url: videoUrl,
        domain: videoDomain, stage: parseInt(videoStage), thumbnail_url: videoThumb
      });
      toast.success('Video added!');
      resetVideoForm(); loadVideos();
    } catch (err) { toast.error('Failed'); }
  };
  const handleUpdateVideo = async () => {
    if (!editingVideo) return;
    try {
      await api.put(`/api/admin/videos/${editingVideo.id}`, {
        title: videoTitle, description: videoDesc, url: videoUrl,
        domain: videoDomain, stage: parseInt(videoStage), thumbnail_url: videoThumb
      });
      toast.success('Updated!'); resetVideoForm(); loadVideos();
    } catch (err) { toast.error('Failed'); }
  };
  const handleDeleteVideo = async (id) => {
    try { await api.delete(`/api/admin/videos/${id}`); toast.success('Deleted'); loadVideos(); }
    catch (err) { toast.error('Failed'); }
  };
  const resetVideoForm = () => {
    setEditingVideo(null); setVideoTitle(''); setVideoDesc('');
    setVideoUrl(''); setVideoDomain('general'); setVideoStage('0'); setVideoThumb('');
  };

  // Mentor Match
  const handleCreateMatch = async () => {
    if (!matchMentorId || !matchMenteeId || !matchDomain) { toast.error('Fill all fields'); return; }
    try {
      await api.post('/api/admin/mentor-match', {
        mentor_id: matchMentorId, mentee_id: matchMenteeId,
        domain: matchDomain, note: matchNote
      });
      toast.success('Match created!');
      setMatchMentorId(''); setMatchMenteeId(''); setMatchDomain(''); setMatchNote('');
      loadCommunity();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const viewUserDetail = async (userId) => {
    try { const data = await api.get(`/api/admin/users/${userId}`); setSelectedUser(data); }
    catch (err) { console.error(err); }
  };

  const stageNames = { 1: 'Beaten Down', 2: 'Analysis Paralysis', 3: "Stuck in Others' Dreams", 4: 'Courageous Dreamer' };

  return (
    <div className="min-h-screen bg-[hsl(36,60%,98%)]">
      {/* Admin Header */}
      <div className="bg-white border-b border-[hsl(28,25%,86%)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(18,92%,52%)] flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm">10 Million Mistakes</h1>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[hsl(173,55%,34%)]" />
                <span className="text-xs text-[hsl(173,55%,34%)] font-medium">Admin Dashboard</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-[hsl(22,12%,40%)]">
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto mb-6">
            <TabsList className="inline-flex">
              <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" /> Overview</TabsTrigger>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
              <TabsTrigger value="mantras"><BookOpen className="w-4 h-4 mr-1" /> Mantras</TabsTrigger>
              <TabsTrigger value="reflections"><MessageSquare className="w-4 h-4 mr-1" /> Reflections</TabsTrigger>
              <TabsTrigger value="stories"><MessageSquare className="w-4 h-4 mr-1" /> Stories</TabsTrigger>
              <TabsTrigger value="videos"><Video className="w-4 h-4 mr-1" /> Videos</TabsTrigger>
              <TabsTrigger value="community"><Handshake className="w-4 h-4 mr-1" /> Community</TabsTrigger>
            </TabsList>
          </div>

          {/* ========== OVERVIEW ========== */}
          <TabsContent value="overview">
            {stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'hsl(18,92%,52%)' },
                    { label: 'Total Reflections', value: stats.total_reflections, icon: MessageSquare, color: 'hsl(173,55%,34%)' },
                    { label: 'Total Challenges', value: stats.total_challenges, icon: Zap, color: 'hsl(43,92%,55%)' },
                    { label: "Today's Activity", value: stats.todays_reflections, icon: TrendingUp, color: 'hsl(200,70%,40%)' }
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card>
                        <CardContent className="p-4">
                          <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                          <p className="text-2xl font-display font-bold">{stat.value}</p>
                          <p className="text-xs text-[hsl(22,12%,40%)]">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Extended Stats */}
                {extStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4">
                      <p className="text-xl font-display font-bold text-[hsl(18,92%,52%)]">{extStats.stories?.pending || 0}</p>
                      <p className="text-xs text-[hsl(22,12%,40%)]">Pending Stories</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-xl font-display font-bold text-[hsl(173,55%,34%)]">{extStats.connections?.total || 0}</p>
                      <p className="text-xs text-[hsl(22,12%,40%)]">Active Connections</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-xl font-display font-bold text-[hsl(43,92%,55%)]">{extStats.videos || 0}</p>
                      <p className="text-xs text-[hsl(22,12%,40%)]">Videos</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-xl font-display font-bold text-[hsl(200,70%,40%)]">{extStats.buddy_requests_pending || 0}</p>
                      <p className="text-xs text-[hsl(22,12%,40%)]">Pending Buddy Requests</p>
                    </CardContent></Card>
                  </div>
                )}

                {/* Users by Stage */}
                <Card>
                  <CardHeader><CardTitle className="text-lg font-display">Users by Stage</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(stats.users_by_stage || {}).map(([stage, count]) => (
                        <div key={stage} className="text-center p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                          <p className="text-xl font-display font-bold">{count}</p>
                          <p className="text-xs text-[hsl(22,12%,40%)]">
                            {stage === 'unassigned' ? 'Not Onboarded' : `Stage ${stage}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ========== USERS ========== */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="text-lg font-display">All Users ({users.length})</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Stage</TableHead>
                      <TableHead>Mistakes</TableHead><TableHead>Joined</TableHead><TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-[hsl(22,12%,40%)]">{u.email}</TableCell>
                        <TableCell>
                          {u.stage ? <Badge variant="outline" className="rounded-full text-xs">Stage {u.stage}</Badge>
                            : <Badge variant="outline" className="rounded-full text-xs text-[hsl(22,12%,40%)]">New</Badge>}
                        </TableCell>
                        <TableCell className="font-mono-accent">{u.total_mistakes || 0}</TableCell>
                        <TableCell className="text-xs text-[hsl(22,12%,40%)]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => viewUserDetail(u.id)}><Eye className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader><DialogTitle className="font-display">{selectedUser?.user?.name || 'User'}</DialogTitle></DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                                      <p className="text-xs text-[hsl(22,12%,40%)]">Stage</p>
                                      <p className="font-semibold">{selectedUser.user?.stage || '-'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                                      <p className="text-xs text-[hsl(22,12%,40%)]">Mistakes</p>
                                      <p className="font-semibold">{selectedUser.user?.total_mistakes || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                                      <p className="text-xs text-[hsl(22,12%,40%)]">Email</p>
                                      <p className="font-semibold text-xs">{selectedUser.user?.email}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[hsl(22,12%,40%)] mb-1">Domains</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {(selectedUser.user?.domains || []).map(d => (
                                        <Badge key={d} variant="outline" className="rounded-full">{d}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-display font-semibold mb-2">Reflections ({selectedUser.reflections?.length || 0})</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                      {(selectedUser.reflections || []).map((r, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-[hsl(36,45%,97%)] border border-[hsl(28,25%,86%)]">
                                          <p className="text-xs text-[hsl(22,12%,40%)] mb-1">{r.date}</p>
                                          <p className="text-sm"><strong>Obstacle:</strong> {r.obstacle}</p>
                                          <p className="text-sm"><strong>Response:</strong> {r.response}</p>
                                          <p className="text-sm"><strong>Story:</strong> {r.story}</p>
                                          <p className="text-sm font-medium text-[hsl(173,55%,34%)]"><strong>Lesson:</strong> {r.lesson}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== MANTRAS ========== */}
          <TabsContent value="mantras">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">{editingMantra ? 'Edit Mantra' : 'Add New Mantra'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Textarea data-testid="admin-mantra-input" placeholder="Enter mantra text..." value={mantraText}
                      onChange={(e) => setMantraText(e.target.value)} className="flex-1 min-h-[60px]" />
                    <div className="flex flex-col gap-2">
                      <Select value={mantraCategory} onValueChange={setMantraCategory}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['general','persistence','courage','growth','identity','perfectionism'].map(c => (
                            <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        {editingMantra ? (<>
                          <Button onClick={handleUpdateMantra} className="bg-[hsl(18,92%,52%)] text-white">Update</Button>
                          <Button variant="outline" onClick={() => { setEditingMantra(null); setMantraText(''); }}>Cancel</Button>
                        </>) : (
                          <Button data-testid="admin-add-mantra-button" onClick={handleCreateMantra} className="bg-[hsl(18,92%,52%)] text-white">
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">All Mantras ({mantras.length})</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Text</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {mantras.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="max-w-md"><p className="text-sm line-clamp-2">{m.text}</p></TableCell>
                          <TableCell><Badge variant="outline" className="rounded-full text-xs">{m.category}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingMantra(m); setMantraText(m.text); setMantraCategory(m.category || 'general'); }}>
                                <Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteMantra(m.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== REFLECTIONS ========== */}
          <TabsContent value="reflections">
            <Card>
              <CardHeader><CardTitle className="text-lg font-display">Recent Reflections ({reflections.length})</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead><TableHead>User</TableHead><TableHead>Obstacle</TableHead><TableHead>Response</TableHead><TableHead>Lesson</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {reflections.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">{r.date}</TableCell>
                        <TableCell className="text-xs font-mono-accent">{r.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{r.obstacle}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {r.response === 'pushed_through' ? 'Pushed Through' : r.response === 'tried_and_failed' ? 'Tried & Failed' : r.response === 'ran' ? 'Ran' : r.response}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[250px] truncate text-[hsl(173,55%,34%)]">{r.lesson}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== STORIES MODERATION ========== */}
          <TabsContent value="stories">
            <Card>
              <CardHeader><CardTitle className="text-lg font-display">Story Moderation ({stories.length})</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Author</TableHead><TableHead>Title</TableHead><TableHead>Lesson</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {stories.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{s.anonymous ? 'Anonymous' : s.user_name}</TableCell>
                        <TableCell className="text-sm font-medium max-w-[150px] truncate">{s.title}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate text-[hsl(173,55%,34%)]">{s.lesson}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-full text-xs ${
                            s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            s.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {s.status === 'pending' && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" onClick={() => handleModerateStory(s.id, 'approved')}
                                className="bg-green-500 text-white hover:bg-green-600 h-7 px-2 text-xs">
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleModerateStory(s.id, 'rejected')}
                                className="text-red-500 border-red-200 hover:bg-red-50 h-7 px-2 text-xs">
                                <X className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== VIDEOS ========== */}
          <TabsContent value="videos">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">{editingVideo ? 'Edit Video' : 'Add New Video'}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input placeholder="Video title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">YouTube/Vimeo URL</label>
                      <Input placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea placeholder="Brief description..." value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} className="min-h-[60px]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Select value={videoDomain} onValueChange={setVideoDomain}>
                      <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                      <SelectContent>
                        {['general','Money/Career','Relationships','Spiritual/Emotional','Skills/Hobbies'].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={videoStage} onValueChange={setVideoStage}>
                      <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Stages</SelectItem>
                        {[1,2,3,4].map(s => <SelectItem key={s} value={String(s)}>Stage {s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Thumbnail URL (optional)" value={videoThumb} onChange={(e) => setVideoThumb(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    {editingVideo ? (<>
                      <Button onClick={handleUpdateVideo} className="bg-[hsl(18,92%,52%)] text-white">Update Video</Button>
                      <Button variant="outline" onClick={resetVideoForm}>Cancel</Button>
                    </>) : (
                      <Button onClick={handleCreateVideo} className="bg-[hsl(18,92%,52%)] text-white">
                        <Plus className="w-4 h-4 mr-1" /> Add Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">All Videos ({videos.length})</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Title</TableHead><TableHead>Domain</TableHead><TableHead>Stage</TableHead><TableHead>Views</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {videos.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium text-sm max-w-[200px] truncate">{v.title}</TableCell>
                          <TableCell><Badge variant="outline" className="rounded-full text-xs">{v.domain}</Badge></TableCell>
                          <TableCell>{v.stage === 0 ? 'All' : `Stage ${v.stage}`}</TableCell>
                          <TableCell className="font-mono-accent">{v.views || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setEditingVideo(v); setVideoTitle(v.title); setVideoDesc(v.description || '');
                                setVideoUrl(v.url); setVideoDomain(v.domain || 'general'); setVideoStage(String(v.stage || 0)); setVideoThumb(v.thumbnail_url || '');
                              }}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteVideo(v.id)} className="text-red-500">
                                <Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== COMMUNITY ========== */}
          <TabsContent value="community">
            <div className="space-y-6">
              {/* Active Connections */}
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">Active Connections ({connections.length})</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>User 1</TableHead><TableHead>User 2</TableHead><TableHead>Type</TableHead><TableHead>Domain</TableHead><TableHead>Created</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {connections.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium text-sm">{c.user_1_name}</TableCell>
                          <TableCell className="font-medium text-sm">{c.user_2_name}</TableCell>
                          <TableCell><Badge variant="outline" className="rounded-full text-xs capitalize">{c.type}</Badge></TableCell>
                          <TableCell className="text-sm">{c.domain}</TableCell>
                          <TableCell className="text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Manual Mentor Match */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">Create Mentorship Match</CardTitle>
                  <p className="text-sm text-[hsl(22,12%,40%)]">Manually connect a mentor and mentee</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mentor User ID</label>
                      <Input placeholder="User ID of mentor" value={matchMentorId} onChange={(e) => setMatchMentorId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mentee User ID</label>
                      <Input placeholder="User ID of mentee" value={matchMenteeId} onChange={(e) => setMatchMenteeId(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={matchDomain} onValueChange={setMatchDomain}>
                      <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
                      <SelectContent>
                        {['money_career','relationships','spiritual_emotional','skills_hobbies'].map(d => (
                          <SelectItem key={d} value={d}>{d.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Note (optional)" value={matchNote} onChange={(e) => setMatchNote(e.target.value)} />
                  </div>
                  <Button onClick={handleCreateMatch} className="bg-[hsl(173,55%,34%)] text-white hover:bg-[hsl(173,55%,30%)]">
                    <Handshake className="w-4 h-4 mr-1" /> Create Match
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Buddy Requests */}
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">Buddy Requests ({buddyRequests.length})</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>User</TableHead><TableHead>Stage</TableHead><TableHead>Domain</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {buddyRequests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-sm">{r.user_name}</TableCell>
                          <TableCell>Stage {r.stage}</TableCell>
                          <TableCell className="text-sm">{r.domain}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-full text-xs ${
                              r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              r.status === 'matched' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>{r.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mentor Offers */}
              <Card>
                <CardHeader><CardTitle className="text-lg font-display">Mentor Offers ({mentorOffers.length})</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Domain</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {mentorOffers.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium text-sm">{o.user_name}</TableCell>
                          <TableCell><Badge variant="outline" className="rounded-full text-xs capitalize">{o.role}</Badge></TableCell>
                          <TableCell className="text-sm">{o.domain}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{o.description || '-'}</TableCell>
                          <TableCell><Badge className={`rounded-full text-xs ${o.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{o.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
