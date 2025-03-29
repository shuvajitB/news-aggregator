'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../../components/UserContext';
import { User, Mail, Calendar, Lock } from 'lucide-react';

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

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/profile?email_phone=${email}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to fetch profile:', err))
      .finally(() => setLoading(false));
  }, [email]);

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

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    fetch(`${API_BASE_URL}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_phone: email,
        old_password: oldPassword,
        new_password: newPassword,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.detail) {
          setMessage(data.detail);
        } else {
          setMessage('Password updated successfully!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      })
      .catch(() => setMessage('Something went wrong.'));
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-12 bg-gradient-to-br from-gray-100 via-white to-gray-50 rounded-xl shadow-xl backdrop-blur-xl">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">👤 My Profile</h2>
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {message && <p className="text-center text-sm text-blue-600">{message}</p>}

      {/* Profile Info */}
      {profile && (
        <section className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-700">
            <User size={20} /> Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Email</label>
              <div className="mt-1 px-4 py-2 border bg-gray-100 rounded-lg text-gray-700">
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
        </section>
      )}

      {/* Preferences */}
      <section className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-green-700">
          <Calendar size={20} /> News Preferences
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
      </section>

      {/* Password Change */}
      <section className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-700">
          <Lock size={20} /> Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <input
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handlePasswordChange}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Update Password
          </button>
        </div>
      </section>
    </div>
  );
}
