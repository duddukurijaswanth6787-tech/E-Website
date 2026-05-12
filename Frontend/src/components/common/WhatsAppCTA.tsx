import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const WhatsAppCTA: React.FC<{
  phoneNumber?: string;
  message?: string;
}> = ({ 
  phoneNumber = '+919876543210', 
  message = 'Hello! I am interested in your premium boutique services. I would like to book a consultation.' 
}) => {
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick}
        className="w-16 h-16 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center justify-center pointer-events-auto relative group overflow-hidden"
        title="Chat on WhatsApp"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle size={28} />
      </motion.button>
    </div>
  );
};
