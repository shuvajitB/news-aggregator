'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import AuthModal from '../../components/AuthModal';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'register'>('login');
  const [typedTitle, setTypedTitle] = useState('');
  const fullTitle = 'Personalised News Aggregator';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedTitle(fullTitle.slice(0, index + 1));
      index++;
      if (index === fullTitle.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const openModal = (type: 'login' | 'register') => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-cover bg-center"
      style={{
        backgroundImage: "url('/15cf3a8a59b156148aed7ba75182123b.jpg')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] z-0"></div>

      {/* Card */}
      <div className="relative z-10 text-center max-w-lg bg-white/30 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl p-10 animate-fade-in">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center bg-white/40 backdrop-blur-md rounded-full p-4 shadow-md hover:scale-105 transition">
            <Newspaper size={64} className="text-black drop-shadow" />
          </div>
        </div>

        {/* Typing Animation Title */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900 min-h-[48px]">
          {typedTitle}
          <span className="blinking-cursor">|</span>
        </h1>

        <p className="text-gray-800 mb-8 text-sm font-medium">
          Reliable daily news tailored just for you.
        </p>

        {/* Glowing Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => openModal('login')}
            className="relative overflow-hidden bg-black text-white px-6 py-2 text-lg rounded-full shadow-md hover:shadow-xl hover:ring-2 hover:ring-white/50 transition-all group"
          >
            <span className="z-10 relative">Welcome Back</span>
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></span>
          </button>

          <button
            onClick={() => openModal('register')}
            className="relative overflow-hidden bg-white text-black px-6 py-2 text-lg rounded-full border border-black hover:bg-gray-100 hover:shadow-lg transition-all group"
          >
            <span className="z-10 relative">Join Now</span>
            <span className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && <AuthModal type={modalType} onClose={() => setShowModal(false)} />)}

      {/* Extra styles */}
      <style jsx>{`
        .blinking-cursor {
          font-weight: 300;
          color: #555;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}
