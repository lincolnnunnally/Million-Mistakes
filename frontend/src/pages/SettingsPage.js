import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from '../components/ui/dialog';
import {
  Settings, User, Lock, RefreshCw, Trash2, LogOut, Shield, ChevronRight,
  Flame, Calendar, Trophy, MessageSquare, Users, Eye, EyeOff, Check, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const DOMAIN_OPTIONS = [
  { id: 'money_career', name: 'Money / Career' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'spiritual_emotional', name: 'Spiritual / Emotional' },
  { id: 'skills_hobbies', name: 'Skills / Hobbies' }
];

const STAGE_NAMES = {
  1: 'Beaten Down', 2: 'Analysis Paralysis',
  3: "Stuck in Others' Dreams", 4: 'Courageous Dreamer'
};

export default function SettingsPage() {
  const { user, logout, refreshUser } = useApp();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [selectedDomains, setSelectedDomains] = useState(user?.domains || []);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get('/api/profile/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDomain = (domainId) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(d => d !== domainId)
        : [...prev, domainId]
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      await api.put('/api/profile', { name: name.trim(), domains: selectedDomains });
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast.error('Fill all password fields'); return; }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await api.post('/api/profile/change-password', {
        current_password: currentPw,
        new_password: newPw
      });
      toast.success('Password changed!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      await api.post('/api/profile/retake-quiz');
      await refreshUser();
      toast.success('Quiz reset! Redirecting to onboarding...');
      setTimeout(() => navigate('/onboarding'), 1000);
    } catch (err) {
      toast.error('Failed to reset quiz');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeleting(true);
    try {
      await api.delete('/api/profile/account');
      toast.success('Account deleted. Goodbye.');
      logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="main-content">
      <div className="mx-auto w-full max-w-3xl px-[var(--space-page-x)] py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(22,12%,40%,0.1)] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[hsl(22,12%,40%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Settings</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Manage your account and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Account Info Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[hsl(18,92%,52%)] flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-white">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">{user?.name}</h2>
                    <p className="text-sm text-[hsl(22,12%,40%)]">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user?.stage && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          Stage {user.stage}: {STAGE_NAMES[user.stage]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                {stats && (
                  <div className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-[hsl(36,45%,94%)]">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-[hsl(18,92%,52%)]">{stats.total_mistakes}</p>
                      <p className="text-[10px] text-[hsl(22,12%,40%)]">Mistakes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-[hsl(173,55%,34%)]">{stats.total_reflections}</p>
                      <p className="text-[10px] text-[hsl(22,12%,40%)]">Reflections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-[hsl(43,92%,55%)]">{stats.total_stories}</p>
                      <p className="text-[10px] text-[hsl(22,12%,40%)]">Stories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-[hsl(200,70%,40%)]">{stats.connections}</p>
                      <p className="text-[10px] text-[hsl(22,12%,40%)]">Connections</p>
                    </div>
                  </div>
                )}

                {stats?.member_since && (
                  <p className="text-xs text-[hsl(22,12%,40%)] mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Member since {new Date(stats.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Profile */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <User className="w-4 h-4" /> Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Display Name</label>
                  <Input
                    data-testid="settings-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Growth Domains</label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAIN_OPTIONS.map(d => (
                      <button
                        key={d.id}
                        onClick={() => toggleDomain(d.id)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                          selectedDomains.includes(d.id)
                            ? 'border-[hsl(173,55%,34%)] bg-[hsl(173,55%,34%,0.06)] text-[hsl(173,55%,34%)] font-medium'
                            : 'border-[hsl(28,25%,86%)] text-[hsl(22,12%,40%)]'
                        }`}
                      >
                        {selectedDomains.includes(d.id) && <Check className="w-3 h-3 inline mr-1" />}
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  data-testid="settings-save-profile-button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] font-display"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current Password</label>
                  <div className="relative">
                    <Input
                      data-testid="settings-current-pw"
                      type={showPw ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(22,12%,40%)]"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">New Password</label>
                  <Input
                    data-testid="settings-new-pw"
                    type={showPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="h-11"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                  <Input
                    data-testid="settings-confirm-pw"
                    type={showPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button
                  data-testid="settings-change-pw-button"
                  onClick={handleChangePassword}
                  disabled={changingPw}
                  variant="outline"
                  className="rounded-xl"
                >
                  {changingPw ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Retake Quiz */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(36,45%,94%)] transition-colors">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-[hsl(18,92%,52%)]" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Retake Onboarding Quiz</p>
                          <p className="text-xs text-[hsl(22,12%,40%)]">Get re-assessed for your current stage</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[hsl(22,12%,40%)]" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Retake Quiz?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-[hsl(22,12%,40%)]">
                      This will reset your stage and domain selections. Your reflections, victories, and progress will be preserved. You'll be redirected to the onboarding quiz.
                    </p>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleRetakeQuiz} className="bg-[hsl(18,92%,52%)] text-white">
                        <RefreshCw className="w-4 h-4 mr-1" /> Retake Quiz
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Logout */}
                <button
                  data-testid="settings-logout-button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(36,45%,94%)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-[hsl(22,12%,40%)]" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Sign Out</p>
                      <p className="text-xs text-[hsl(22,12%,40%)]">Log out of your account</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[hsl(22,12%,40%)]" />
                </button>

                {/* Delete Account */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-red-500">Delete Account</p>
                          <p className="text-xs text-[hsl(22,12%,40%)]">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-red-300" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Delete Account
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <p className="text-sm text-[hsl(22,12%,40%)]">
                        This action is <strong>irreversible</strong>. All your data will be permanently deleted including:
                      </p>
                      <ul className="text-sm text-[hsl(22,12%,40%)] list-disc pl-5 space-y-1">
                        <li>All reflections and lessons</li>
                        <li>Challenge history</li>
                        <li>Stories and connections</li>
                        <li>Your entire progress</li>
                      </ul>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Type DELETE to confirm</label>
                        <Input
                          data-testid="delete-confirm-input"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder="DELETE"
                          className="border-red-200"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirm !== 'DELETE' || deleting}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        {deleting ? 'Deleting...' : 'Delete My Account'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>

          {/* App Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-[hsl(36,45%,97%)]">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-[hsl(18,92%,52%)]" />
                  <span className="font-display font-semibold text-sm">10 Million Mistakes</span>
                </div>
                <p className="text-xs text-[hsl(22,12%,40%)]">Version 2.0 &bull; Every failure is fuel</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
