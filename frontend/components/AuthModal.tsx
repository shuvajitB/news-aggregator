'use client';

import React, { useState } from 'react';
import { useUserContext } from './UserContext';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';

interface AuthModalProps {
  type: 'login' | 'register';
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Payload {
  email_phone: string;
  password: string;
  name?: string;
  dob?: string;
}

export default function AuthModal({ type, onClose }: AuthModalProps) {
  const { setLoggedIn } = useUserContext();
  const router = useRouter();

  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    let payload: Payload = {
      email_phone: emailPhone,
      password: password
    };

    if (type === 'register') {
      payload.name = name;
      payload.dob = new Date(dob).toISOString().split('T')[0];
    }

    const url = `${API_BASE_URL}/${type}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Error occurred');
        return;
      }

      setLoggedIn(true, '', emailPhone);
      onClose();
      router.push('/news');
    } catch (e) {
      setError('Server Error!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <Newspaper size={50} className="text-white drop-shadow" />
        </div>

        <div className="relative bg-white/20 backdrop-blur-md border border-white/30 shadow-xl text-white rounded-2xl p-8 w-96 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6">{type === 'register' ? 'Join Now' : 'Welcome Back!'}</h2>

          {type === 'register' && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-style"
              />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="input-style"
              />
            </>
          )}

          <input
            type="text"
            placeholder="Email or Phone"
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            className="input-style"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-style pr-16"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-sm text-gray-200 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p className="text-red-400 mb-3">{error}</p>}

          <button
            onClick={handleAuth}
            className="w-full py-2 mb-3 rounded-full bg-black/80 text-white hover:bg-black transition-all shadow hover:shadow-lg hover:scale-[1.02]"
          >
            {type === 'register' ? 'Register' : 'Login'}
          </button>

          <button
            onClick={onClose}
            className="absolute top-3 right-5 text-white text-2xl hover:scale-125 transition"
          >
            &times;
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-style {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1rem;
          width: 100%;
          margin-bottom: 1rem;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-style:focus {
          border-color: white;
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
