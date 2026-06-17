import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Database } from '../../types';

type Service = Database['public']['Tables']['services']['Row'];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
      price: parseFloat(formData.get('price') as string),
      is_active: formData.get('is_active') === 'true',
    };

    if (isEditing) {
      // @ts-ignore
      await supabase.from('services').update(serviceData as any).eq('id', isEditing.id);
    } else {
      await supabase.from('services').insert(serviceData as any);
    }
    
    setIsEditing(null);
    setIsAdding(false);
    fetchServices();
  };

  const toggleStatus = async (service: Service) => {
    // @ts-ignore
    await supabase.from('services').update({ is_active: !service.is_active } as any).eq('id', service.id);
    setServices(services.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your spa treatment menu</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); }}
          className="bg-spa-charcoal text-white px-4 py-2 rounded-lg text-sm hover:bg-spa-olive transition-colors"
        >
          Add Service
        </button>
      </div>

      {(isEditing || isAdding) && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-medium mb-4">{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" defaultValue={isEditing?.name || ''} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input name="price" type="number" step="0.01" defaultValue={isEditing?.price || ''} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" defaultValue={isEditing?.description || ''} rows={3} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input name="duration_minutes" type="number" defaultValue={isEditing?.duration_minutes || ''} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="is_active" defaultValue={isEditing ? String(isEditing.is_active) : 'true'} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-spa-sage focus:border-spa-sage outline-none bg-white">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => { setIsEditing(null); setIsAdding(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-spa-charcoal text-white rounded-lg hover:bg-spa-olive transition-colors">Save Service</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No services found. Add your first service above.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-gray-500 truncate max-w-xs">{service.description}</div>
                  </td>
                  <td className="px-6 py-4">{service.duration_minutes} min</td>
                  <td className="px-6 py-4">${service.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => toggleStatus(service)} className="text-gray-500 hover:text-spa-olive mr-4 text-xs font-medium uppercase tracking-wider">
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setIsEditing(service)} className="text-spa-charcoal hover:text-spa-olive font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
