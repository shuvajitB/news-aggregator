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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 via-white to-gray-100 p-8">
      <div className="flex justify-center mb-8">
        <Newspaper size={80} className="text-black" />
      </div>

      <div className="bg-white border border-gray-300 rounded-3xl shadow-xl p-10 text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-6 text-black">Personalized News Aggregator</h1>
        <p className="text-gray-700 mb-8">Your daily headlines, simplified and beautifully presented.</p>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => openModal('login')}
            className="bg-black text-white px-6 py-2 text-lg rounded-full shadow hover:bg-gray-800 transition"
          >
            Welcome Back!
          </button>
          <button
            onClick={() => openModal('register')}
            className="bg-white text-black px-6 py-2 text-lg rounded-full border border-black hover:bg-gray-100 transition"
          >
            Join Now
          </button>
        </div>
      </div>

      {showModal && (
        <AuthModal type={modalType} onClose={() => setShowModal(false)} />
      )}

      <footer className="mt-16 text-sm text-gray-500">
        © 2025 News Aggregator. All rights reserved.
      </footer>
    </main>
  );
}
