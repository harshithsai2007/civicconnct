import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, Map as MapIcon, ArrowUpRight, Building2 } from 'lucide-react';

import { HeatMap } from './MapComponents';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/analytics').then(res => res.json()).then(setStats);
    fetch('/api/issues').then(res => res.json()).then(setIssues);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-red-500 font-bold animate-pulse">Initializing Analytics...</div>;

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl"
        >
          <p className="text-white font-bold mb-2">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill || '#ef4444' }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-8 rounded-[2rem] relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-2xl -mr-8 -mt-8 transition-all group-hover:opacity-10`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-4xl font-bold text-white mt-2 tracking-tight">{value}</h3>
          <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold mt-2">
            <TrendingUp className="w-3 h-3" /> +12% from last week
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all duration-500`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total} icon={TrendingUp} color="bg-red-500" delay={0.1} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="bg-emerald-500" delay={0.2} />
        <StatCard title="In Progress" value={stats.pending} icon={Clock} color="bg-red-500" delay={0.3} />
        <StatCard title="Critical" value={stats.highPriority} icon={AlertTriangle} color="bg-red-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="glass-card p-8 rounded-[2.5rem] relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between relative z-10">
            Category Distribution
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
          </h3>
          <div className="h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar
                  dataKey="count"
                  name="Reports"
                  fill="url(#colorCategory)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="glass-card p-8 rounded-[2.5rem] relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between relative z-10">
            Resolution Status
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </h3>
          <div className="h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {stats.byStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-300 text-xs font-medium capitalize">{value.replace('_', ' ')}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Improved Corporation Workload Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="glass-card p-8 rounded-[2.5rem] lg:col-span-2 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              Departmental Workload
              <span className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 font-bold tracking-wider uppercase">Live</span>
            </div>
            <Building2 className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
          </h3>
          <div className="h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCorporation} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWorkload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                  dataKey="count"
                  name="Assigned Issues"
                  fill="url(#colorWorkload)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  label={{ position: 'top', fill: '#f87171', fontSize: 12, fontWeight: 'bold', formatter: (val: any) => val > 0 ? val : '' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-[2.5rem]"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <MapIcon className="w-5 h-5 text-teal-400" />
            </div>
            Geographic Pulse
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border border-white/5">
          <HeatMap issues={issues} />
        </div>
      </motion.div>
    </div>
  );
};
