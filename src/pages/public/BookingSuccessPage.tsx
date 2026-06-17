import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { format, parseISO, parse } from 'date-fns';

export default function BookingSuccessPage() {
  const location = useLocation();
  const state = location.state as { 
    service: any, 
    date: string, 
    time: string 
  } | null;

  if (!state) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-serif text-spa-charcoal mb-4">Request Received</h1>
        <p className="text-gray-500 mb-8 max-w-md">Your appointment request has been submitted successfully.</p>
        <Link to="/" className="text-spa-olive border-b border-spa-olive hover:text-spa-charcoal hover:border-spa-charcoal transition-colors">Return home</Link>
      </div>
    );
  }

  const { service, date, time } = state;
  const aptDate = parseISO(date);
  const aptTime = parse(time, 'HH:mm:ss', aptDate);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-6 bg-spa-bg">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-spa-cream shadow-sm p-10 md:p-14 text-center animate-fade-in relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-spa-cream rounded-bl-full -mr-16 -mt-16 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-spa-sand/50 rounded-tr-full -ml-12 -mb-12 z-0 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-serif text-spa-charcoal mb-3">Request Received</h1>
          <p className="text-spa-text-light mb-10 max-w-sm mx-auto leading-relaxed">
            Thank you for choosing us. Your appointment request has been submitted and is pending confirmation.
          </p>

          <div className="bg-spa-bg rounded-xl p-6 mb-10 text-left border border-spa-cream shadow-sm">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Treatment</p>
                <p className="font-medium text-spa-charcoal">{service.name}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Duration</p>
                <p className="font-medium text-spa-charcoal">{service.duration_minutes} minutes</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Date</p>
                <p className="font-medium text-spa-charcoal">{format(aptDate, 'MMM d, yyyy')}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wider text-spa-text-light mb-1">Time</p>
                <p className="font-medium text-spa-charcoal">{format(aptTime, 'h:mm a')}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-8">We will send you an email confirmation shortly.</p>
          
          <Link 
            to="/" 
            className="inline-block bg-spa-charcoal text-white px-8 py-3 rounded hover:bg-spa-olive transition-colors text-sm tracking-wide"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
