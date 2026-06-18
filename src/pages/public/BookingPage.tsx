import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';
import { addDays, format, isAfter, isBefore, isSameDay, parse, parseISO, startOfDay, addMinutes } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

type Service = Database['public']['Tables']['services']['Row'];
type BusinessHour = Database['public']['Tables']['business_hours']['Row'];
type BlockedDate = Database['public']['Tables']['blocked_dates']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type SpaSettings = Database['public']['Tables']['spa_settings']['Row'];

interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<SpaSettings | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [
        { data: srvs },
        { data: hrs },
        { data: bd },
        { data: stngs }
      ] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true),
        supabase.from('business_hours').select('*'),
        supabase.from('blocked_dates').select('*'),
        supabase.from('spa_settings').select('*').maybeSingle()
      ]);

      if (srvs) setServices(srvs);
      if (hrs) setHours(hrs);
      if (bd) setBlockedDates(bd);
      if (stngs) setSettings(stngs);
      
      // Load future appointments
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const { data: apts } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', todayString)
        .neq('status', 'cancelled');
        
      if (apts) setAppointments(apts);

      setLoading(false);
    }
    loadData();
  }, []);

  const generateDates = () => {
    const dates = [];
    const noticeHours = settings?.booking_notice_hours || 24;
    let current = addMinutes(new Date(), noticeHours * 60);
    current = startOfDay(current);

    let daysAdded = 0;
    while (daysAdded < 14) {
      const weekday = current.getDay();
      const isBlocked = blockedDates.some(b => b.blocked_date === format(current, 'yyyy-MM-dd'));
      const hourRule = hours.find(h => h.weekday === weekday);
      
      if (!isBlocked && hourRule?.is_open) {
        dates.push(current);
        daysAdded++;
      }
      current = addDays(current, 1);
    }
    return dates;
  };

  const availableDates = generateDates();

  const getAvailableTimeSlots = (date: Date): TimeSlot[] => {
    if (!selectedService) return [];

    const weekday = date.getDay();
    const hourRule = hours.find(h => h.weekday === weekday);
    
    if (!hourRule || !hourRule.is_open) return [];

    const slots: TimeSlot[] = [];
    
    const startHourStr = hourRule.start_time;
    const endHourStr = hourRule.end_time;
    
    let currentSlotStart = parse(startHourStr, 'HH:mm:ss', date);
    const dayEnd = parse(endHourStr, 'HH:mm:ss', date);
    
    const interval = settings?.slot_interval_minutes || 30;
    const duration = selectedService.duration_minutes;
    
    const nowWithNotice = addMinutes(new Date(), (settings?.booking_notice_hours || 24) * 60);

    while (true) {
      const currentSlotEnd = addMinutes(currentSlotStart, duration);
      
      if (isAfter(currentSlotEnd, dayEnd)) break;

      // Check if slot is in the past + notice period
      if (isBefore(currentSlotStart, nowWithNotice)) {
         currentSlotStart = addMinutes(currentSlotStart, interval);
         continue;
      }
      
      // Check existing appointments overlap
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasOverlap = appointments.some(apt => {
        if (apt.appointment_date !== dateStr) return false;
        
        const aptStart = parse(apt.start_time, 'HH:mm:ss', date);
        const aptEnd = parse(apt.end_time, 'HH:mm:ss', date);
        
        // Overlap: new_start < existing_end AND new_end > existing_start
        return isBefore(currentSlotStart, aptEnd) && isAfter(currentSlotEnd, aptStart);
      });

      if (!hasOverlap) {
        slots.push({
          start: currentSlotStart,
          end: currentSlotEnd,
          label: format(currentSlotStart, 'h:mm a')
        });
      }

      currentSlotStart = addMinutes(currentSlotStart, interval);
    }

    return slots;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    setSubmitting(true);
    
    const bookingData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      service_id: selectedService.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: format(selectedTimeSlot.start, 'HH:mm:ss'),
      end_time: format(selectedTimeSlot.end, 'HH:mm:ss'),
      status: 'pending'
    };

    const { error } = await supabase.from('appointments').insert(bookingData as any);
    
    setSubmitting(false);

    if (error) {
      alert('There was an error saving your appointment. Please try again.');
      console.error(error);
    } else {
      navigate('/book/success', { 
        state: { 
          service: selectedService, 
          date: bookingData.appointment_date, 
          time: bookingData.start_time 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-spa-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spa-olive"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spa-bg py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-spa-charcoal text-center mb-12">Reserve Your Session</h1>

        {/* Steps Tracker */}
        <div className="flex items-center justify-center mb-12 gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-spa-charcoal' : 'text-spa-stone'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium ${step === 1 ? 'bg-spa-charcoal text-white border-spa-charcoal' : step > 1 ? 'border-spa-charcoal bg-spa-cream' : 'border-spa-stone'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : 1}
            </div>
            <span className="hidden sm:inline font-medium text-sm tracking-wide uppercase">Treatment</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-spa-charcoal' : 'text-spa-stone'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium ${step === 2 ? 'bg-spa-charcoal text-white border-spa-charcoal' : step > 2 ? 'border-spa-charcoal bg-spa-cream' : 'border-spa-stone'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : 2}
            </div>
            <span className="hidden sm:inline font-medium text-sm tracking-wide uppercase">Date & Time</span>
          </div>
          <div className="w-8 sm:w-16 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-spa-charcoal' : 'text-spa-stone'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium ${step === 3 ? 'bg-spa-charcoal text-white border-spa-charcoal' : 'border-spa-stone'}`}>
              3
            </div>
            <span className="hidden sm:inline font-medium text-sm tracking-wide uppercase">Details</span>
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
            <h2 className="text-xl text-spa-charcoal mb-6 font-medium text-center">Select a Treatment</h2>
            {services.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                Our service menu is currently empty. Please check back later or contact us directly.
              </div>
            ) : (
              services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-spa-olive shadow-sm bg-spa-cream' : 'border-gray-200 bg-white hover:border-spa-sage'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-spa-charcoal">{service.name}</h3>
                    <span className="text-lg font-serif text-spa-olive">${service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{service.duration_minutes} minutes</p>
                  {service.description && <p className="text-spa-text-light text-sm">{service.description}</p>}
                </div>
              ))
            )}
            
            <div className="mt-8 flex justify-end">
              <button 
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 bg-spa-charcoal text-white px-8 py-3 rounded hover:bg-spa-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-xl text-spa-charcoal mb-6 font-medium text-center">Select Date and Time</h2>
            
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-spa-text-light mb-4">Available Days</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {availableDates.length === 0 ? (
                  <div className="w-full text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
                    No available dates found. The spa may not have configured operating hours yet.
                  </div>
                ) : (
                  availableDates.map((date, idx) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(date); setSelectedTimeSlot(null); }}
                        className={`min-w-[100px] p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${isSelected ? 'border-spa-olive bg-spa-olive text-white shadow-sm' : 'border-gray-200 bg-white text-spa-charcoal hover:border-spa-sage'}`}
                      >
                        <span className="text-xs uppercase tracking-wider mb-1 opacity-80">{format(date, 'EEE')}</span>
                        <span className="text-2xl font-serif">{format(date, 'd')}</span>
                        <span className="text-xs mt-1 opacity-80">{format(date, 'MMM')}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {selectedDate && (
              <div className="animate-fade-in">
                <h3 className="text-sm uppercase tracking-wider text-spa-text-light mb-4">Available Times</h3>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {getAvailableTimeSlots(selectedDate).map((slot, idx) => {
                    const isSelected = selectedTimeSlot?.start.getTime() === slot.start.getTime();
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-3 px-2 rounded-lg border text-sm text-center transition-all ${isSelected ? 'border-spa-olive bg-spa-cream text-spa-olive font-medium shadow-sm' : 'border-gray-200 bg-white hover:border-spa-sage'}`}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
                  {getAvailableTimeSlots(selectedDate).length === 0 && (
                    <div className="col-span-full py-6 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                      Fully booked on this date. Please select another day.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-spa-text-light hover:text-spa-charcoal transition-colors underline underline-offset-4"
              >
                Back to Treatments
              </button>
              <button 
                disabled={!selectedDate || !selectedTimeSlot}
                onClick={() => setStep(3)}
                className="flex items-center justify-center gap-2 bg-spa-charcoal text-white px-8 py-3 rounded hover:bg-spa-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="animate-fade-in grid md:grid-cols-5 gap-12">
            
            <div className="md:col-span-3">
              <h2 className="text-xl text-spa-charcoal mb-6 font-medium">Your Details</h2>
              <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    required 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:border-spa-olive focus:ring-1 focus:ring-spa-olive" 
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      required 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:border-spa-olive focus:ring-1 focus:ring-spa-olive" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      required 
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:border-spa-olive focus:ring-1 focus:ring-spa-olive" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests or Notes (Optional)</label>
                  <textarea 
                    rows={4}
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:border-spa-olive focus:ring-1 focus:ring-spa-olive" 
                  />
                </div>
              </form>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl border border-spa-cream shadow-sm sticky top-32">
                <h3 className="text-lg font-medium text-spa-charcoal mb-6 border-b border-gray-100 pb-4">Appointment Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Treatment</p>
                    <p className="font-medium text-spa-charcoal">{selectedService?.name}</p>
                    <p className="text-sm text-gray-500">{selectedService?.duration_minutes} minutes • ${selectedService?.price}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Date</p>
                    <p className="font-medium text-spa-charcoal">{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Time</p>
                    <p className="font-medium text-spa-charcoal">{selectedTimeSlot?.label}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  form="booking-form"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-spa-charcoal text-white px-8 py-4 rounded hover:bg-spa-olive transition-colors disabled:opacity-50 tracking-wide"
                >
                  {submitting ? 'Confirming...' : 'Confirm Request'}
                </button>
                <div className="mt-4 text-center">
                   <button 
                    onClick={() => setStep(2)}
                    className="text-sm text-spa-text-light hover:text-spa-charcoal underline"
                  >
                    Edit date and time
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
