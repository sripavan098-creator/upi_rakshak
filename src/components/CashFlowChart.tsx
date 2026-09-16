import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CashFlowEntry } from '../lib/agent';

interface CashFlowChartProps {
  data: CashFlowEntry[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const hasShortfall = data.some(d => d.balance < 0);
  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));

  const chartData = data.map(d => ({
    day: `Day ${d.day}`,
    balance: d.balance,
    label: d.label,
  }));

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        {hasShortfall ? (
          <TrendingDown className="w-5 h-5 text-red-400" />
        ) : (
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        )}
        Cash Flow Projection
      </h3>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hasShortfall ? '#ef4444' : '#10b981'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={hasShortfall ? '#ef4444' : '#10b981'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Balance']}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Zero', fill: '#ef4444', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={hasShortfall ? '#ef4444' : '#10b981'}
              fill="url(#balanceGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/30 rounded-lg p-3">
          <p className="text-xs text-slate-500">Starting Balance</p>
          <p className="text-lg font-bold text-white">₹{data[0]?.balance.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 ${hasShortfall ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
          <p className="text-xs text-slate-500">Final Balance</p>
          <p className={`text-lg font-bold ${hasShortfall ? 'text-red-400' : 'text-emerald-400'}`}>
            ₹{data[data.length - 1]?.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {hasShortfall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-xs text-red-400">
            ⚠️ Shortfall of ₹{Math.abs(minBalance).toLocaleString()} detected. 
            Expenses exceed available balance by Day {data.find(d => d.balance < 0)?.day}.
          </p>
        </motion.div>
      )}
    </div>
  );
}
