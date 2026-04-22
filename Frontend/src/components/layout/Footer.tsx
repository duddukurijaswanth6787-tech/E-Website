import { Link } from 'react-router-dom';
import { Globe, Camera, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-950 text-neutral-cream pt-16 pb-8 border-t-[6px] border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Intro */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex flex-col items-start text-white">
                <span className="font-serif text-3xl font-bold tracking-wider">
                  VASANTHI
                </span>
                <span className="text-xs tracking-[0.3em] text-accent font-medium uppercase mt-1">
                  Creations
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-100 leading-relaxed max-w-xs">
              Celebrating the timeless elegance of Indian heritage with premium traditional wear tailored for the modern silhouette.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-primary-950 transition-all duration-300">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-primary-950 transition-all duration-300">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-primary-950 transition-all duration-300">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-lg font-serif font-semibold text-white tracking-wide border-b border-primary-800 pb-2 inline-block max-w-[80%]">Customer Care</h4>
            <ul className="space-y-3 text-sm text-primary-100 font-medium">
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link to="/policy/shipping" className="hover:text-accent transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/policy/returns" className="hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQs</Link></li>
              <li><Link to="/track-order" className="hover:text-accent transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-lg font-serif font-semibold text-white tracking-wide border-b border-primary-800 pb-2 inline-block max-w-[80%]">Explore Collections</h4>
            <ul className="space-y-3 text-sm text-primary-100 font-medium">
              <li><Link to="/category/sarees" className="hover:text-accent transition-colors">Premium Sarees</Link></li>
              <li><Link to="/category/bridal" className="hover:text-accent transition-colors">Bridal Collection</Link></li>
              <li><Link to="/custom-blouse" className="hover:text-accent transition-colors">Custom Designer Blouses</Link></li>
              <li><Link to="/category/festive" className="hover:text-accent transition-colors">Festive Wear</Link></li>
              <li><Link to="/blogs" className="hover:text-accent transition-colors">Journal & Styling</Link></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-lg font-serif font-semibold text-white tracking-wide border-b border-primary-800 pb-2 inline-block max-w-[100%]">Join The Boutique</h4>
            <p className="text-sm text-primary-100">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex relative items-center max-w-sm">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-primary-900 border border-primary-800 text-white text-sm rounded-md px-4 py-3 pr-24 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent placeholder-primary-400"
                  required
                />
                <button type="submit" className="absolute right-1 top-1 bottom-1 bg-accent text-primary-950 text-xs font-bold uppercase tracking-wider px-4 rounded hover:bg-accent-light transition-colors">
                  Subscribe
                </button>
              </div>
            </form>
            
            <div className="pt-4 space-y-3 text-sm text-primary-100">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <span>123 Silk Street, Couture Avenue<br/>Chennai, TN 600001, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <span>hello@vasanthicreations.com</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-primary-300">
          <p>&copy; {new Date().getFullYear()} Vasanthi Creations. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <Link to="/policy/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/policy/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
