import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';
import { format, parseISO } from 'date-fns';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: { name: string } | null;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        services ( name )
      `)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (data) setAppointments(data as Appointment[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    // @ts-ignore
    await supabase.from('appointments').update({ status } as any).eq('id', id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const filteredAppointments = appointments.filter(a => filter === 'all' || a.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your upcoming bookings</p>
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-spa-sage"
        >
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apt.full_name}</div>
                      <div className="text-gray-500 text-xs mt-1">{apt.email}</div>
                      <div className="text-gray-500 text-xs">{apt.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{format(parseISO(apt.appointment_date), 'MMM d, yyyy')}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{apt.services?.name || 'Unknown Service'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium capitalize
                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value as any)}
                        className="text-xs border border-gray-300 rounded pt-1 pb-1 pl-2 pr-6 bg-white focus:outline-none focus:ring-1 focus:ring-spa-sage"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="completed">Complete</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
