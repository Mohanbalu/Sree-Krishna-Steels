import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const phoneNumber = "919848082209"; // Updated
  const message = "Hi Sree Krishna Steels & Furniture, I'm interested in your furniture products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
    >
      <FaWhatsapp size={28} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-semibold">
        Chat with us
      </span>
    </motion.a>
  );
}
