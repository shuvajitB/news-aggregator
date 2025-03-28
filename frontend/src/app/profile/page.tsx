'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../../components/UserContext';
import { User, Mail, Calendar } from 'lucide-react';

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
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <h2 className="text-4xl font-bold text-center text-gray-800">Your Profile</h2>

      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {message && <p className="text-center text-blue-600 text-sm">{message}</p>}

      {profile && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={20} /> Personal Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 text-gray-700">
                {profile.email_phone}
              </div>
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
          >
            Save Profile
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="text-green-600" size={20} /> Your Preferences
        </h3>

        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm border font-medium transition ${
                selected.includes(cat)
                  ? 'bg-black text-white border-black shadow'
                  : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={savePreferences}
          className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg shadow transition"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
