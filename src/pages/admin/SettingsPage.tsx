import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';

type SpaSettings = Database['public']['Tables']['spa_settings']['Row'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SpaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('spa_settings').select('*').maybeSingle();
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      spa_name: formData.get('spa_name') as string,
      spa_email: formData.get('spa_email') as string,
      spa_phone: formData.get('spa_phone') as string,
      spa_address: formData.get('spa_address') as string,
      slot_interval_minutes: parseInt(formData.get('slot_interval_minutes') as string, 10),
      booking_notice_hours: parseInt(formData.get('booking_notice_hours') as string, 10),
    };

    if (settings.id) {
      // @ts-ignore
      await supabase.from('spa_settings').update(updatedData as any).eq('id', settings.id);
    } else {
      await supabase.from('spa_settings').insert(updatedData as any);
    }
    
    alert('Settings saved successfully.');
    fetchSettings();
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">Spa Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage public details and booking preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Public Spa Profile</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spa Name</label>
                <input name="spa_name" defaultValue={settings?.spa_name || ''} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input name="spa_email" type="email" defaultValue={settings?.spa_email || ''} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input name="spa_phone" defaultValue={settings?.spa_phone || ''} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea name="spa_address" defaultValue={settings?.spa_address || ''} rows={2} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Booking Logic</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Interval (minutes)</label>
                <p className="text-xs text-gray-500 mb-2">How often time slots appear (e.g., every 30 mins)</p>
                <input name="slot_interval_minutes" type="number" defaultValue={settings?.slot_interval_minutes || 30} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Notice (hours)</label>
                <p className="text-xs text-gray-500 mb-2">Minimum advance notice required for bookings</p>
                <input name="booking_notice_hours" type="number" defaultValue={settings?.booking_notice_hours || 24} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-spa-charcoal text-white px-8 py-3 rounded-lg font-medium hover:bg-spa-olive transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
