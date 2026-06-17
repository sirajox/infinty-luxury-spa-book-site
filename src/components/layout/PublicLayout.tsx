import { Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types';
import { Leaf, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type SpaSettings = Database['public']['Tables']['spa_settings']['Row'];

export default function PublicLayout() {
  const [settings, setSettings] = useState<SpaSettings | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase
      .from('spa_settings')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
      
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const spaName = settings?.spa_name || 'Serene Spa';

  return (
    <div className="min-h-screen flex flex-col font-sans text-spa-text bg-spa-bg selection:bg-spa-sage/30">
      <nav 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf className="w-6 h-6 text-spa-sage group-hover:text-spa-olive transition-colors" />
            <span className="font-serif text-2xl tracking-tight text-spa-charcoal">{spaName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#services" className="text-sm tracking-wide hover:text-spa-olive transition-colors">Services</Link>
            <Link to="/#about" className="text-sm tracking-wide hover:text-spa-olive transition-colors">About</Link>
            <Link to="/book" className="bg-spa-charcoal text-white px-6 py-2.5 rounded hover:bg-spa-olive transition-colors text-sm tracking-wide">
              Reserve Session
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-spa-charcoal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-spa-cream md:hidden animate-fade-in">
            <div className="flex flex-col p-6 gap-6">
              <Link to="/#services" onClick={() => setIsMenuOpen(false)} className="text-lg">Services</Link>
              <Link to="/#about" onClick={() => setIsMenuOpen(false)} className="text-lg">About</Link>
              <Link to="/book" onClick={() => setIsMenuOpen(false)} className="bg-spa-charcoal text-white text-center py-3 rounded">
                Reserve Session
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-24 md:pt-0">
        <Outlet context={{ settings }} />
      </main>

      <footer className="bg-spa-charcoal text-spa-bg py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-sm text-white/80">
          <div>
            <div className="flex items-center gap-2 mb-6 text-white">
              <Leaf className="w-5 h-5 text-spa-sage" />
              <span className="font-serif text-xl">{spaName}</span>
            </div>
            <p className="max-w-xs text-white/60 leading-relaxed">
              Discover a sanctuary of wellness where peace and rejuvenation unite. Allow us to take care of you.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-white text-lg mb-6 tracking-wide">Contact</h4>
            <div className="flex flex-col gap-3">
              {settings?.spa_address && <p>{settings.spa_address}</p>}
              {settings?.spa_phone && <p>{settings.spa_phone}</p>}
              {settings?.spa_email && <p>{settings.spa_email}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-white text-lg mb-6 tracking-wide">Hours</h4>
            <div className="flex flex-col gap-2">
              <p>Please check the booking page</p>
              <p>for accurate daily availability.</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-xs text-white/40 flex justify-between">
          <p>&copy; {new Date().getFullYear()} {spaName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
