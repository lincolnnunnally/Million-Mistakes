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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Flame, Users, BookOpen, MessageSquare, BarChart3, Plus, Trash2, Edit,
  TrendingUp, Zap, Eye, LogOut, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, logout } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [mantras, setMantras] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mantra form
  const [mantraText, setMantraText] = useState('');
  const [mantraCategory, setMantraCategory] = useState('general');
  const [editingMantra, setEditingMantra] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'mantras') loadMantras();
    else if (tab === 'reflections') loadReflections();
  }, [tab]);

  const loadStats = async () => {
    try {
      const data = await api.get('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get('/api/admin/users');
      setUsers(data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadMantras = async () => {
    try {
      const data = await api.get('/api/admin/mantras');
      setMantras(data?.mantras || []);
    } catch (err) {
      console.error('Failed to load mantras:', err);
    }
  };

  const loadReflections = async () => {
    try {
      const data = await api.get('/api/admin/reflections');
      setReflections(data?.reflections || []);
    } catch (err) {
      console.error('Failed to load reflections:', err);
    }
  };

  const handleCreateMantra = async () => {
    if (!mantraText.trim()) return;
    try {
      await api.post('/api/admin/mantras', { text: mantraText, category: mantraCategory });
      toast.success('Mantra created!');
      setMantraText('');
      setMantraCategory('general');
      loadMantras();
    } catch (err) {
      toast.error('Failed to create mantra');
    }
  };

  const handleUpdateMantra = async () => {
    if (!editingMantra || !mantraText.trim()) return;
    try {
      await api.put(`/api/admin/mantras/${editingMantra.id}`, { text: mantraText, category: mantraCategory });
      toast.success('Mantra updated!');
      setEditingMantra(null);
      setMantraText('');
      setMantraCategory('general');
      loadMantras();
    } catch (err) {
      toast.error('Failed to update mantra');
    }
  };

  const handleDeleteMantra = async (id) => {
    try {
      await api.delete(`/api/admin/mantras/${id}`);
      toast.success('Mantra deleted');
      loadMantras();
    } catch (err) {
      toast.error('Failed to delete mantra');
    }
  };

  const viewUserDetail = async (userId) => {
    try {
      const data = await api.get(`/api/admin/users/${userId}`);
      setSelectedUser(data);
    } catch (err) {
      console.error('Failed to load user detail:', err);
    }
  };

  const stageNames = {
    1: 'Beaten Down', 2: 'Analysis Paralysis',
    3: "Stuck in Others' Dreams", 4: 'Courageous Dreamer'
  };

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
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" /> Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="mantras"><BookOpen className="w-4 h-4 mr-1" /> Mantras</TabsTrigger>
            <TabsTrigger value="reflections"><MessageSquare className="w-4 h-4 mr-1" /> Reflections</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
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

                {/* Users by Stage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-display">Users by Stage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(stats.users_by_stage || {}).map(([stage, count]) => (
                        <div key={stage} className="text-center p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                          <p className="text-xl font-display font-bold">{count}</p>
                          <p className="text-xs text-[hsl(22,12%,40%)]">
                            {stage === 'unassigned' ? 'Not Onboarded' : `Stage ${stage}: ${stageNames[parseInt(stage)] || ''}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Mistakes</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-[hsl(22,12%,40%)]">{u.email}</TableCell>
                        <TableCell>
                          {u.stage ? (
                            <Badge variant="outline" className="rounded-full text-xs">
                              Stage {u.stage}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full text-xs text-[hsl(22,12%,40%)]">Not onboarded</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono-accent">{u.total_mistakes || 0}</TableCell>
                        <TableCell className="text-xs text-[hsl(22,12%,40%)]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => viewUserDetail(u.id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="font-display">{selectedUser?.user?.name || 'User Detail'}</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                                      <p className="text-xs text-[hsl(22,12%,40%)]">Stage</p>
                                      <p className="font-semibold">{selectedUser.user?.stage ? `${selectedUser.user.stage}: ${stageNames[selectedUser.user.stage]}` : 'Not set'}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                                      <p className="text-xs text-[hsl(22,12%,40%)]">Total Mistakes</p>
                                      <p className="font-semibold">{selectedUser.user?.total_mistakes || 0}</p>
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
                                    <h4 className="font-display font-semibold mb-2">Recent Reflections ({selectedUser.reflections?.length || 0})</h4>
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

          {/* MANTRAS */}
          <TabsContent value="mantras">
            <div className="space-y-6">
              {/* Create/Edit Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">
                    {editingMantra ? 'Edit Mantra' : 'Add New Mantra'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Textarea
                      data-testid="admin-mantra-input"
                      placeholder="Enter mantra text..."
                      value={mantraText}
                      onChange={(e) => setMantraText(e.target.value)}
                      className="flex-1 min-h-[60px]"
                    />
                    <div className="flex flex-col gap-2">
                      <Select value={mantraCategory} onValueChange={setMantraCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="persistence">Persistence</SelectItem>
                          <SelectItem value="courage">Courage</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="identity">Identity</SelectItem>
                          <SelectItem value="perfectionism">Perfectionism</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        {editingMantra ? (
                          <>
                            <Button onClick={handleUpdateMantra} className="bg-[hsl(18,92%,52%)] text-white">
                              Update
                            </Button>
                            <Button variant="outline" onClick={() => { setEditingMantra(null); setMantraText(''); }}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button data-testid="admin-add-mantra-button" onClick={handleCreateMantra} className="bg-[hsl(18,92%,52%)] text-white">
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mantras List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">All Mantras ({mantras.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Text</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mantras.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="max-w-md">
                            <p className="text-sm line-clamp-2">{m.text}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full text-xs">{m.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-full text-xs ${m.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {m.active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMantra(m);
                                  setMantraText(m.text);
                                  setMantraCategory(m.category || 'general');
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMantra(m.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

          {/* REFLECTIONS */}
          <TabsContent value="reflections">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Recent Reflections ({reflections.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Obstacle</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Lesson</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reflections.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">{r.date}</TableCell>
                        <TableCell className="text-xs font-mono-accent">{r.user_id?.substring(0, 8)}...</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{r.obstacle}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-xs">
                            {r.response === 'pushed_through' ? 'Pushed Through' :
                             r.response === 'tried_and_failed' ? 'Tried & Failed' :
                             r.response === 'ran' ? 'Ran' : r.response}
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
        </Tabs>
      </div>
    </div>
  );
}
