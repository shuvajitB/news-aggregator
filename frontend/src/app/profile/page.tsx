'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../../components/UserContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const categories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

interface UserProfile {
  name: string;
  dob: string;
  email_phone: string;
}

export default function ProfilePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user } = useUserContext();
  const email = user?.email || '';

  // Fetch user profile details
  useEffect(() => {
    if (!email) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/profile?email_phone=${email}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to fetch profile:', err))
      .finally(() => setLoading(false));
  }, [email]);

  // Fetch saved preferences
  useEffect(() => {
    if (!email) return;

    fetch(`${API_BASE_URL}/preferences?email_phone=${email}`)
      .then(res => res.json())
      .then(data => setSelected(data.preferences.categories || []))
      .catch(err => console.error('Failed to fetch preferences:', err));
  }, [email]);

  const toggleCategory = (category: string) => {
    setSelected(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const savePreferences = () => {
    if (!email) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_phone: email, categories: selected }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save');
        setMessage('Preferences saved successfully!');
      })
      .catch(() => setMessage('Failed to save preferences.'))
      .finally(() => setLoading(false));
  };

  const saveProfile = () => {
    if (!profile) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save');
        setMessage('Profile updated successfully!');
      })
      .catch(() => setMessage('Failed to update profile.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>

      {loading && <p className="text-gray-600 mb-2">Loading...</p>}
      {message && <p className="text-sm text-blue-600 mb-4 text-center">{message}</p>}

      {profile && (
        <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200">
          <label className="block mb-2 font-medium">Name:</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="border px-3 py-2 rounded-md w-full mb-4"
          />

          <label className="block mb-2 font-medium">Date of Birth:</label>
          <input
            type="date"
            value={profile.dob}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            className="border px-3 py-2 rounded-md w-full mb-4"
          />

          <p className="text-sm text-gray-500">Email: {profile.email_phone}</p>

          <button
            onClick={saveProfile}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-3">Select Preferred Categories</h3>

      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-4 py-2 rounded-full border transition ${
              selected.includes(cat)
                ? 'bg-black text-white border-black'
                : 'bg-gray-200 text-black border-gray-400'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <button
        onClick={savePreferences}
        className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
      >
        Save Preferences
      </button>
    </div>
  );
}
