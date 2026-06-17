import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';

type BusinessHour = Database['public']['Tables']['business_hours']['Row'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HoursPage() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    setLoading(true);
    const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
    
    // Fill missing days if necessary (for new setups)
    const normalizedData = WEEKDAYS.map((_, i) => {
      const existing = (data as BusinessHour[])?.find(d => d.weekday === i);
      if (existing) return existing;
      return { id: `temp-${i}`, weekday: i, is_open: false, start_time: '09:00:00', end_time: '17:00:00' } as BusinessHour;
    });
    
    setHours(normalizedData);
    setLoading(false);
  };

  const handleUpdate = (index: number, field: keyof BusinessHour, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    
    for (const h of hours) {
      if (h.id.startsWith('temp-')) {
        const { id, ...insertData } = h;
        await supabase.from('business_hours').insert(insertData as any);
      } else {
        // @ts-ignore
        await supabase.from('business_hours').update(h as any).eq('id', h.id);
      }
    }
    
    await fetchHours();
    setSaving(false);
    alert('Business hours updated successfully.');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading business hours...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Business Hours</h1>
          <p className="text-gray-500 text-sm mt-1">Set your standard operating hours</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-spa-charcoal text-white px-6 py-2 rounded-lg text-sm hover:bg-spa-olive transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-6">
        <div className="space-y-6">
          {hours.map((hour, index) => (
            <div key={hour.weekday} className="flex items-center gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-32 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={hour.is_open}
                  onChange={(e) => handleUpdate(index, 'is_open', e.target.checked)}
                  className="w-4 h-4 text-spa-sage rounded border-gray-300 focus:ring-spa-sage"
                />
                <span className="font-medium text-gray-700">{WEEKDAYS[hour.weekday]}</span>
              </div>
              
              <div className="flex-1 flex gap-4 items-center">
                <input 
                  type="time" 
                  value={hour.start_time.slice(0, 5)}
                  onChange={(e) => handleUpdate(index, 'start_time', e.target.value + ':00')}
                  disabled={!hour.is_open}
                  className="border border-gray-300 rounded-lg p-2 text-sm disabled:opacity-50 disabled:bg-gray-50 focus:ring-spa-sage focus:border-spa-sage"
                />
                <span className="text-gray-400">to</span>
                <input 
                  type="time" 
                  value={hour.end_time.slice(0, 5)}
                  onChange={(e) => handleUpdate(index, 'end_time', e.target.value + ':00')}
                  disabled={!hour.is_open}
                  className="border border-gray-300 rounded-lg p-2 text-sm disabled:opacity-50 disabled:bg-gray-50 focus:ring-spa-sage focus:border-spa-sage"
                />
              </div>
              
              <div className="w-24 text-sm text-gray-500 text-right">
                {hour.is_open ? 'Open' : 'Closed'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
