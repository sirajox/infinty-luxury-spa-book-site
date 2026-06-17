import { Link, useOutletContext } from 'react-router-dom';
import { Database } from '../../types';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Sparkles } from 'lucide-react';

type SpaSettings = Database['public']['Tables']['spa_settings']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

export default function HomePage() {
  const { settings } = useOutletContext<{ settings: SpaSettings | null }>();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
      .then(({ data }) => {
        if (data) setServices(data);
      });
  }, []);

  const spaName = settings?.spa_name || 'Serene Spa';

  const defaultServiceImages = [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248593842-8d76d4db7a9e?auto=format&fit=crop&q=80',
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80" 
            alt="Relaxing spa treatment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-spa-charcoal/80 to-spa-charcoal/40" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
          <span className="text-spa-sand font-medium tracking-[0.2em] uppercase text-sm mb-6 block animate-fade-in">
            A Sanctuary of Wellness
          </span>
          <h1 className="text-5xl md:text-7xl text-white font-serif mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Restore your mind,<br className="hidden md:block" /> body, and spirit
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Experience unparalleled relaxation and rejuvenation at {spaName}. 
            Our expert therapists are dedicated to your complete wellbeing.
          </p>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/book" 
              className="inline-flex items-center gap-3 bg-spa-sand text-spa-charcoal px-8 py-4 rounded hover:bg-white transition-colors text-lg tracking-wide group"
            >
              Reserve Your Treatment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro/About Section */}
      <section id="about" className="py-24 bg-spa-cream">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-spa-sage/20 rounded-2xl transform -rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80" 
              alt="Premium spa interior" 
              className="relative rounded-2xl shadow-xl w-full h-[600px] object-cover"
            />
          </div>
          <div className="max-w-lg">
            <Sparkles className="w-8 h-8 text-spa-sage mb-6" />
            <h2 className="text-4xl text-spa-charcoal mb-6 leading-snug">The essence of true relaxation</h2>
            <p className="text-spa-text-light mb-8 text-lg leading-relaxed">
              We believe that wellness is not a luxury, but a necessity. Our treatments are carefully crafted to provide deep relaxation, stress relief, and holistic healing.
            </p>
            <p className="text-spa-text-light mb-10 text-lg leading-relaxed">
              Step into our serene environment, leave the outside world behind, and allow our expert practitioners to curate a personalized wellness journey just for you.
            </p>
            <Link to="/book" className="text-spa-olive font-medium border-b border-spa-olive pb-1 hover:text-spa-charcoal hover:border-spa-charcoal transition-colors tracking-wide">
              Discover Our Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-spa-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl text-spa-charcoal mb-6">Our Services</h2>
            <p className="text-spa-text-light text-lg">
              Explore our curated selection of treatments designed to rejuvenate your senses and restore balance to your life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={service.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-6 shadow-sm">
                  <img 
                    src={defaultServiceImages[index % defaultServiceImages.length]} 
                    alt={service.name}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl text-spa-charcoal group-hover:text-spa-olive transition-colors">{service.name}</h3>
                  <span className="font-serif text-lg text-spa-sage">${service.price}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-spa-stone mb-3">
                  <span>{service.duration_minutes} minutes</span>
                </div>
                {service.description && (
                  <p className="text-spa-text-light leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
            
            {services.length === 0 && (
              <div className="col-span-full text-center py-12 text-spa-text-light">
                Our service menu is currently being updated. Please check back soon.
              </div>
            )}
          </div>
          
          <div className="mt-20 text-center">
            <Link 
              to="/book" 
              className="inline-block border border-spa-charcoal text-spa-charcoal px-10 py-4.5 rounded hover:bg-spa-charcoal hover:text-white transition-colors tracking-wide uppercase text-sm"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
