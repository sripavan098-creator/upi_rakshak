import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useProfile } from '../../auth/hooks';
import { supabase } from '../../lib/supabase';
import { AppLayout } from '../../layouts/AppLayout';

interface Scan {
  id: string;
  source: string;
  threat_level: string;
  original_text: string;
  created_at: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      if (!user) return;
      
      // Fetch recent scans
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (scans) {
        setRecentScans(scans);
      }

      // Fetch stats
      const { count: totalScans } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: threatsBlocked } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('threat_level', 'HIGH');

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: thisWeek } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalScans: totalScans || 0,
        threatsBlocked: threatsBlocked || 0,
        thisWeek: thisWeek || 0,
      });
    }

    fetchData();
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-400">
            Here's your protection overview
          </p>
        </div>

        {/* Protection Status */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Protection Active</h2>
              <p className="text-emerald-400">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.thisWeek}</div>
            <div className="text-sm text-slate-400">Scans this week</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.threatsBlocked}</div>
            <div className="text-sm text-slate-400">Threats blocked</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalScans}</div>
            <div className="text-sm text-slate-400">Total scans</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/console"
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Analyze a message</h3>
              <p className="text-sm text-slate-400">Check if a message is fraudulent</p>
            </Link>

            <Link
              to="/cash-flow"
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Check cash flow</h3>
              <p className="text-sm text-slate-400">Forecast your financial runway</p>
            </Link>

            <Link
              to="/loans"
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Compare loans</h3>
              <p className="text-sm text-slate-400">Find the best loan options</p>
            </Link>
          </div>
        </div>

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Scans</h2>
            <Link to="/history" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 mb-4">No scans yet</p>
              <Link
                to="/console"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                Analyze your first message
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.threat_level === 'HIGH'
                              ? 'bg-red-500/20 text-red-400'
                              : scan.threat_level === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {scan.threat_level}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 truncate">
                        {scan.original_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
