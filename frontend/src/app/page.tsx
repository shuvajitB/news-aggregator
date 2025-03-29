'use client';

import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import AuthModal from '../../components/AuthModal';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'register'>('login');

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
      {/* Overlay for dimming */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px] z-0"></div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg bg-white/30 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl p-10">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center bg-white/40 backdrop-blur-md rounded-full p-4 shadow-md hover:scale-105 transition">
            <Newspaper size={64} className="text-black drop-shadow" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900">Personalised News Aggregator</h1>
        <p className="text-gray-800 mb-8 text-sm font-medium">
          Reliable daily news tailored just for you.
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => openModal('login')}
            className="bg-black text-white px-6 py-2 text-lg rounded-full shadow hover:bg-gray-800 transition-all"
          >
            Welcome Back
          </button>
          <button
            onClick={() => openModal('register')}
            className="bg-white text-black px-6 py-2 text-lg rounded-full border border-black hover:bg-gray-100 transition-all"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && <AuthModal type={modalType} onClose={() => setShowModal(false)} />}
    </main>
  );
}
