"use client";

export default function FloatingActions() {
  const whatsapp = "https://wa.me/8801534554311";
  const messenger = "https://m.me/skincarekoreanshop";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="w-12 h-12 rounded-full shadow-lg hover:opacity-90 transition-opacity"
      >
        <img src="/whatsapp-svgrepo-com.svg" alt="WhatsApp" className="w-12 h-12" />
      </a>

      <a
        href={messenger}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Messenger"
        className="w-12 h-12 rounded-full shadow-lg hover:opacity-90 transition-opacity"
      >
        <img src="/messenger.svg" alt="Messenger" className="w-12 h-12" />
      </a>
    </div>
  );
}
