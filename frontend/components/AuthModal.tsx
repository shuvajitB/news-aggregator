'use client';

import React, { useState } from 'react';
import { useUserContext } from './UserContext';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';

interface AuthModalProps {
  type: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ type, onClose }: AuthModalProps) {
  const { setLoggedIn } = useUserContext();
  const router = useRouter();

  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    const url = type === 'register'
      ? 'http://localhost:8000/register'
      : 'http://localhost:8000/login';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_phone: emailPhone,
          password: password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Error occurred');
        return;
      }

      // Since backend doesn't return token/email yet, use emailPhone
      setLoggedIn(true, '', emailPhone);
      onClose();
      router.push('/news');
    } catch (err) {
      setError('Server Error!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <Newspaper size={50} className="text-white" />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center relative">
          <h2 className="text-2xl font-bold mb-4 text-black">{type === 'register' ? 'Join Now' : 'Welcome Back!'}</h2>

          <input
            type="text"
            placeholder="Email or Phone"
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            className="border p-3 rounded-lg mb-4 w-full text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-sm text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleAuth}
            className="bg-black text-white px-4 py-2 rounded-full w-full mb-2 hover:bg-gray-800 transition"
          >
            {type === 'register' ? 'Register' : 'Login'}
          </button>

          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
