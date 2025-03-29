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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-white to-pink-100 p-6">
      {/* Newspaper Icon */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-center bg-white/30 backdrop-blur-md p-4 rounded-full shadow-lg hover:scale-105 transition">
          <Newspaper size={80} className="text-black drop-shadow-xl" />
        </div>
      </div>

      {/* Glassy Welcome Box */}
      <div className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 text-center max-w-lg animate-slide-up">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 drop-shadow-md">
          Personalized News Aggregator
        </h1>
        <p className="text-gray-800 mb-8 font-medium">
          Your daily headlines, simplified and beautifully presented.
        </p>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => openModal('login')}
            className="bg-black text-white px-6 py-2 text-lg rounded-full shadow hover:bg-gray-800 transition-all"
          >
            Welcome Back!
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
      {showModal && (
        <AuthModal type={modalType} onClose={() => setShowModal(false)} />
      )}

      {/* Footer */}
      <footer className="mt-16 text-sm text-gray-600 animate-fade-in">
        © 2025 News Aggregator. All rights reserved.
      </footer>

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
