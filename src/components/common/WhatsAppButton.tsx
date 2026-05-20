import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber = '524421234567', 
  message = 'Hola! Me gustaría recibir información sobre sus cortes.' 
}) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      aria-label="Contactar por WhatsApp"
    >
      {/* Tooltip/Label */}
      <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 px-4 py-2 rounded-full shadow-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
        <span className="text-emerald-700 font-bold text-sm whitespace-nowrap">¿Necesitas ayuda?</span>
      </div>

      {/* Button */}
      <div className="relative">
        {/* Pulse effect */}
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        
        <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 rounded-full shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center border-2 border-white/20">
          {/* Custom WhatsApp SVG instead of MessageCircle for better branding */}
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          
          {/* Alternative SVG if we want the real logo path */}
          {/* <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M12.031 6.172c-2.32 0-4.591 1.255-4.591 4.394 0 1.054.344 2.054.992 2.842l-.664 2.422 2.484-.656c.727.422 1.555.648 2.414.648h.008c2.32 0 4.591-1.255 4.591-4.394 0-3.141-2.273-5.256-5.234-5.256zm3.32 7.156c-.141.398-.711.758-1.07.797-.336.031-.773.055-1.227-.141-1.898-.82-3.125-2.75-3.219-2.875-.094-.125-.766-.945-.766-1.805 0-.859.453-1.281.617-1.461.164-.18.359-.227.477-.227h.344c.109 0 .258.008.375.281.125.297.43 1.047.469 1.133.039.086.063.188.008.305-.055.117-.086.188-.172.289-.086.102-.18.227-.258.305-.086.086-.18.18-.078.352.102.172.453.742.977 1.211.672.602 1.234.789 1.406.875.172.086.273.07.375-.047.102-.117.43-.5.547-.672.117-.172.234-.141.398-.078.164.063 1.047.492 1.227.586.18.094.305.141.352.219.047.078.047.453-.094.852z" />
          </svg> */}
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
