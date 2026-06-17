import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';
import { format, parseISO } from 'date-fns';

type BlockedDate = Database['public']['Tables']['blocked_dates']['Row'];

export default function BlockedDatesPage() {
  const [dates, setDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setLoading(true);
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true });
    if (data) setDates(data);
    setLoading(false);
  };

  const handleAddDate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const blocked_date = formData.get('blocked_date') as string;
    const reason = formData.get('reason') as string;

    await supabase.from('blocked_dates').insert({ blocked_date, reason } as any);
    e.currentTarget.reset();
    fetchDates();
  };

  const removeDate = async (id: string) => {
    await supabase.from('blocked_dates').delete().eq('id', id);
    setDates(dates.filter(d => d.id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">Blocked Dates</h1>
        <p className="text-gray-500 text-sm mt-1">Manage holidays or days off</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Add Blocked Date</h2>
            <form onSubmit={handleAddDate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  name="blocked_date" 
                  required 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input 
                  type="text" 
                  name="reason" 
                  placeholder="e.g. Public Holiday" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-spa-charcoal text-white py-2 rounded-lg hover:bg-spa-olive transition-colors"
              >
                Block Date
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading blocked dates...</div>
            ) : dates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No blocked dates. Your spa follows standard business hours.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dates.map((date) => (
                    <tr key={date.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {format(parseISO(date.blocked_date), 'MMMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{date.reason || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeDate(date.id)} 
                          className="text-red-500 hover:text-red-700 font-medium text-xs uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
