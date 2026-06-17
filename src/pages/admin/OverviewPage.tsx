import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';
import { Users, Calendar as CalendarIcon, Scissors, CheckCircle, Clock } from 'lucide-react';

export default function OverviewPage() {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: upcoming },
        { count: pending },
        { count: completed },
        { count: services }
      ] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }).in('status', ['confirmed']).gte('appointment_date', today),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        upcomingAppointments: upcoming || 0,
        pendingAppointments: pending || 0,
        completedAppointments: completed || 0,
        activeServices: services || 0
      });
      setLoading(false);
    }
    
    loadStats();
  }, []);

  const statCards = [
    { name: 'Pending Approvals', value: stats.pendingAppointments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Upcoming Confirmed', value: stats.upcomingAppointments, icon: CalendarIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Completed Sessions', value: stats.completedAppointments, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Services', value: stats.activeServices, icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here is what is happening at the spa today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-xl mr-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{stat.name}</p>
                  <p className="text-3xl font-serif text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Quick Action Ideas or Chart could go here */}
      <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <p className="text-gray-500 mb-6">Manage your daily operations using the sidebar navigation. Check pending appointments regularly.</p>
      </div>
    </div>
  );
}
