import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Building2, Landmark, ShieldCheck } from 'lucide-react';


export const IssueDetail: React.FC<{ issueId: number; onClose: () => void; isAdmin?: boolean }> = ({ issueId, onClose, isAdmin }) => {
  const [data, setData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    const res = await fetch(`/api/issues/${issueId}/details`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => { fetchData(); }, [issueId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await fetch(`/api/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment, role: isAdmin ? 'admin' : 'user' }),
    });
    setComment('');
    fetchData();
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const note = prompt('Add a progress note (optional):');
    await fetch(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    fetchData();
    setUpdating(false);
  };

  if (!data) return null;
  const { issue, timeline, comments } = data;

  const handleAssignCorporation = async (corp: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/issues/${issueId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corporation: corp }),
      });
      await fetchData();
    } finally {
      setUpdating(false);
    }
  };


  // Theme-aware accent colors
  const accent = isAdmin ? 'red' : 'yellow';
  const accentText = isAdmin ? 'text-red-400' : 'text-yellow-400';
  const accentText2 = isAdmin ? 'text-red-500' : 'text-yellow-500';
  const topBar = isAdmin
    ? 'bg-gradient-to-r from-red-700 via-red-500 to-red-700'
    : 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600';
  const sendBtn = isAdmin
    ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-500/10'
    : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/10';
  const inputFocus = isAdmin ? 'focus:border-red-500/50' : 'focus:border-yellow-500/50';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#0c0c0c] w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col relative"
      >
        {/* Accent top bar */}
        <div className={`absolute top-0 left-0 w-full h-0.5 ${topBar}`} />

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest status-${issue.status}`}>
                {issue.status.replace('_', ' ')}
              </span>
              {issue.is_high_priority && (
                <span className={`${isAdmin ? 'text-red-500' : 'text-yellow-500'} text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1.5`}>
                  <AlertCircle className="w-3.5 h-3.5" /> {isAdmin ? 'High Priority' : 'Community Alert'}
                </span>
              )}

            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{issue.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className={`w-4 h-4 ${accentText2}`} /> {issue.locality}, {issue.district}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${accentText2}`} /> {format(new Date(issue.created_at), 'PPP')}
              </span>
              {issue.assigned_corporation && (
                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                  <Building2 className={`w-4 h-4 ${accentText2}`} /> {issue.assigned_corporation}
                </span>
              )}

            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
            <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left column */}
            <div className="lg:col-span-3 space-y-10">
              {issue.photo_url && (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={issue.photo_url} className="w-full object-cover" alt="Issue" />
                </div>
              )}
              <div className="space-y-4">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${accentText2}`}>Problem Description</h4>
                <p className="text-slate-300 text-lg leading-relaxed">{issue.description}</p>
              </div>

              {isAdmin && (
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                  <h4 className="text-sm font-bold text-slate-400 flex items-center gap-3 uppercase tracking-widest">
                    <Landmark className="w-5 h-5 text-red-500" /> Corporation Management
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Agency <span className="text-red-500">*</span></p>
                      <select
                        disabled={updating}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 rounded-xl text-sm outline-none focus:border-red-500/50 transition-all text-white disabled:opacity-50"
                        value={issue.assigned_corporation || ''}
                        onChange={(e) => handleAssignCorporation(e.target.value)}
                      >
                        <option value="">Pending Assignment</option>
                        <option value="GVMC">GVMC (Municipal)</option>
                        <option value="VMRDA">VMRDA (Urban Dev)</option>
                        <option value="CP">City Police</option>
                        <option value="EPDCL">EPDCL (Electricity)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Handling</p>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                        <span className="text-red-400 font-bold text-sm">{issue.assigned_corporation || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-2">
                    {issue.status === 'not_started' && (
                      <button
                        disabled={updating}
                        onClick={() => updateStatus('in_progress')}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Start Work
                      </button>
                    )}
                    {issue.status !== 'resolved' && (
                      <button
                        disabled={updating}
                        onClick={() => updateStatus('resolved')}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Timeline */}
              <div className="space-y-6">
                <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${accentText}`}>
                  <Clock className="w-4 h-4" /> Progress Timeline
                </h4>
                <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  {timeline.map((item: any) => (
                    <div key={item.id} className="relative pl-10">
                      <div
                        className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-[#0c0c0c] shadow-lg ${item.status === 'resolved' ? 'bg-emerald-500' : item.status === 'in_progress' ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                      />
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{item.status.replace('_', ' ')}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{format(new Date(item.created_at), 'PPP p')}</p>
                      {item.note && (
                        <p className="text-sm text-slate-400 mt-2 bg-white/5 p-3 rounded-xl border border-white/5 italic">"{item.note}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion */}
              <div className="space-y-6">
                <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${accentText}`}>
                  <MessageSquare className="w-4 h-4" /> Community Discussion
                </h4>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {comments.map((c: any) => (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl text-sm ${c.user_role === 'admin' ? 'ml-6' : ''} border`}
                      style={
                        c.user_role === 'admin'
                          ? { background: isAdmin ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.05)', borderColor: isAdmin ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)' }
                          : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }
                      }
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${c.user_role === 'admin' ? (isAdmin ? 'text-red-400' : 'text-yellow-500') : 'text-yellow-500'}`}>
                          {c.user_role}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">{format(new Date(c.created_at), 'p')}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{c.text}</p>
                    </div>
                  ))}

                </div>
                <form onSubmit={handleAddComment} className="flex gap-3 pt-4">
                  <input
                    type="text"
                    placeholder="Contribute to discussion..."
                    className={`flex-1 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-sm outline-none transition-all text-white ${inputFocus}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button type="submit" className={`p-4 rounded-2xl transition-all shadow-lg ${sendBtn}`}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
