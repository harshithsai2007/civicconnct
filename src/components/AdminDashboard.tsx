import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
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

  const COLORS = ['#eab308', '#ca8a04', '#f59e0b', '#ef4444', '#8b5cf6'];

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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-[2.5rem]"
        >
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between">
            Category Distribution
            <ArrowUpRight className="w-5 h-5 text-slate-500" />
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#eab308' }}
                />
                <Bar dataKey="count" fill="#eab308" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-[2.5rem]"
        >
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between">
            Resolution Status
            <ArrowUpRight className="w-5 h-5 text-slate-500" />
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.byStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* New Corporation Workload Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2.5rem] lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-white mb-8 flex items-center justify-between">
            Departmental Workload (GVMC, VMRDA, etc.)
            <Building2 className="w-5 h-5 text-red-500" />
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCorporation}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: '#ef4444', fontSize: 10 }} />
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
