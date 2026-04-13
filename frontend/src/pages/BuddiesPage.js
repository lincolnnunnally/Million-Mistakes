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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { Users, UserPlus, Heart, Handshake, Search, Send, X, MessageCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BuddiesPage() {
  const { user } = useApp();
  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [buddyRequest, setBuddyRequest] = useState(null);
  const [mentorOffers, setMentorOffers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buddy request form
  const [requestDomain, setRequestDomain] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Mentorship form
  const [offerDomain, setOfferDomain] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerRole, setOfferRole] = useState('mentee');
  const [offering, setOffering] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [conns, reqStatus, offers, mine] = await Promise.all([
        api.get('/api/buddies/connections'),
        api.get('/api/buddies/request/status'),
        api.get('/api/mentorship/offers'),
        api.get('/api/mentorship/mine')
      ]);
      setConnections(conns?.connections || []);
      setBuddyRequest(reqStatus?.request);
      setMentorOffers(offers?.offers || []);
      setMyOffers(mine?.offers || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuddyRequest = async () => {
    setRequesting(true);
    try {
      const data = await api.post('/api/buddies/request', {
        domain: requestDomain,
        message: requestMessage
      });
      if (data.matched) {
        toast.success(`You were matched with ${data.buddy_name}!`);
      } else {
        toast.success('Request submitted! We\'ll match you soon.');
      }
      setRequestMessage('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await api.delete('/api/buddies/request');
      toast.info('Request cancelled');
      setBuddyRequest(null);
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleMentorOffer = async () => {
    if (!offerDomain) { toast.error('Please select a domain'); return; }
    setOffering(true);
    try {
      await api.post('/api/mentorship/offer', {
        domain: offerDomain,
        description: offerDesc,
        role: offerRole
      });
      toast.success(`${offerRole === 'mentor' ? 'Mentor' : 'Mentee'} offer posted!`);
      setOfferDesc('');
      loadData();
    } catch (err) {
      toast.error('Failed to create offer');
    } finally {
      setOffering(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    try {
      await api.delete(`/api/mentorship/offer/${offerId}`);
      toast.info('Offer withdrawn');
      loadData();
    } catch (err) {
      toast.error('Failed to withdraw');
    }
  };

  const domainOptions = [
    { id: 'money_career', name: 'Money / Career' },
    { id: 'relationships', name: 'Relationships' },
    { id: 'spiritual_emotional', name: 'Spiritual / Emotional' },
    { id: 'skills_hobbies', name: 'Skills / Hobbies' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Users className="w-10 h-10 text-[hsl(173,55%,34%)] mx-auto mb-3" />
          <p className="text-[hsl(22,12%,40%)]">Loading connections...</p>
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
              <Users className="w-5 h-5 text-[hsl(173,55%,34%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Community Hub</h1>
              <p className="text-sm text-[hsl(22,12%,40%)]">Connect with fellow mistake-makers</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="buddies">Find a Buddy</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          </TabsList>

          {/* CONNECTIONS */}
          <TabsContent value="connections">
            {connections.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-[hsl(28,25%,86%)] mx-auto mb-4" />
                <h2 className="text-xl font-display font-semibold mb-2">No connections yet</h2>
                <p className="text-[hsl(22,12%,40%)] max-w-sm mx-auto">
                  Request a Mistake Buddy or find a mentor to start building real connections with people who value growth over perfection.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((conn, idx) => (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[hsl(173,55%,34%,0.1)] flex items-center justify-center">
                              <span className="font-display font-bold text-[hsl(173,55%,34%)]">
                                {(conn.partner_name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-display font-semibold">{conn.partner_name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-full text-xs">
                                  {conn.type === 'buddy' ? 'Mistake Buddy' : 'Mentorship'}
                                </Badge>
                                {conn.domain && (
                                  <Badge variant="outline" className="rounded-full text-xs border-[hsl(28,25%,86%)]">
                                    {conn.domain}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className="rounded-full text-xs bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FIND A BUDDY */}
          <TabsContent value="buddies">
            {buddyRequest ? (
              <Card className="bg-[hsl(36,45%,97%)]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">Buddy Request Active</p>
                      <p className="text-sm text-[hsl(22,12%,40%)]">
                        Looking for a match in {buddyRequest.domain}...
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCancelRequest} className="rounded-xl">
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">Find a Mistake Buddy</CardTitle>
                  <p className="text-sm text-[hsl(22,12%,40%)]">
                    Get matched with someone at a similar stage who's also logging daily mistakes. Support each other's growth.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Domain Focus</label>
                    <Select value={requestDomain} onValueChange={setRequestDomain}>
                      <SelectTrigger><SelectValue placeholder="Select a domain" /></SelectTrigger>
                      <SelectContent>
                        {domainOptions.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message (optional)</label>
                    <Textarea
                      placeholder="Tell potential buddies a bit about yourself and what you're working on..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button
                    data-testid="buddy-request-button"
                    onClick={handleBuddyRequest}
                    disabled={requesting}
                    className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] font-display"
                  >
                    {requesting ? 'Finding...' : 'Find Me a Buddy'}
                    <UserPlus className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MENTORSHIP */}
          <TabsContent value="mentorship">
            <div className="space-y-6">
              {/* Create offer */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display">Offer or Request Mentorship</CardTitle>
                  <p className="text-sm text-[hsl(22,12%,40%)]">
                    No perfection required. Share what you know or learn from someone who's been there.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOfferRole('mentee')}
                      className={`p-3 rounded-xl border-2 text-center transition-colors ${
                        offerRole === 'mentee'
                          ? 'border-[hsl(18,92%,52%)] bg-[hsl(18,92%,52%,0.06)]'
                          : 'border-[hsl(28,25%,86%)]'
                      }`}
                    >
                      <Search className="w-5 h-5 mx-auto mb-1 text-[hsl(18,92%,52%)]" />
                      <p className="text-sm font-display font-semibold">I need a mentor</p>
                    </button>
                    <button
                      onClick={() => setOfferRole('mentor')}
                      className={`p-3 rounded-xl border-2 text-center transition-colors ${
                        offerRole === 'mentor'
                          ? 'border-[hsl(173,55%,34%)] bg-[hsl(173,55%,34%,0.06)]'
                          : 'border-[hsl(28,25%,86%)]'
                      }`}
                    >
                      <Award className="w-5 h-5 mx-auto mb-1 text-[hsl(173,55%,34%)]" />
                      <p className="text-sm font-display font-semibold">I can mentor</p>
                    </button>
                  </div>
                  <Select value={offerDomain} onValueChange={setOfferDomain}>
                    <SelectTrigger><SelectValue placeholder="In which domain?" /></SelectTrigger>
                    <SelectContent>
                      {domainOptions.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder={offerRole === 'mentor' ? 'What can you help with?' : 'What do you need help with?'}
                    value={offerDesc}
                    onChange={(e) => setOfferDesc(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    onClick={handleMentorOffer}
                    disabled={offering || !offerDomain}
                    className="rounded-full bg-[hsl(18,92%,52%)] text-white shadow-[var(--shadow-ember)] hover:bg-[hsl(18,92%,48%)] font-display"
                  >
                    Post {offerRole === 'mentor' ? 'Mentor' : 'Mentee'} Offer
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* My offers */}
              {myOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-display">My Offers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {myOffers.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(36,45%,97%)]">
                        <div>
                          <Badge variant="outline" className="rounded-full text-xs mr-2">
                            {o.role === 'mentor' ? 'Offering Mentorship' : 'Seeking Mentor'}
                          </Badge>
                          <span className="text-sm">{o.domain}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleWithdrawOffer(o.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Browse offers */}
              {mentorOffers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-display">Available Offers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mentorOffers.map((o, idx) => (
                      <div key={o.id} className="p-4 rounded-lg bg-white border border-[hsl(28,25%,86%)]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[hsl(173,55%,34%,0.1)] flex items-center justify-center">
                              <span className="text-sm font-display font-bold text-[hsl(173,55%,34%)]">
                                {(o.user_name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-display font-semibold text-sm">{o.user_name}</p>
                              <p className="text-xs text-[hsl(22,12%,40%)]">Stage {o.stage}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`rounded-full text-xs ${
                            o.role === 'mentor'
                              ? 'border-[hsl(173,55%,34%,0.3)] text-[hsl(173,55%,34%)]'
                              : 'border-[hsl(18,92%,52%,0.3)] text-[hsl(18,92%,52%)]'
                          }`}>
                            {o.role === 'mentor' ? 'Can Mentor' : 'Needs Mentor'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="rounded-full text-xs mb-2">{o.domain}</Badge>
                        {o.description && <p className="text-sm text-[hsl(22,12%,40%)]">{o.description}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
