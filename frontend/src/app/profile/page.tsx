'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../../components/UserContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const categories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

export default function ProfilePage() {
  const { user } = useUserContext();
  const email = user?.email || '';

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!email) return;

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/preferences?email_phone=${email}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/bookmark/list?email_phone=${email}`).then(res => res.json()),
      fetch(`${API_BASE_URL}/history/list?email_phone=${email}`).then(res => res.json())
    ])
      .then(([prefsData, bookmarksData, historyData]) => {
        setSelected(prefsData.preferences?.categories || []);
        setBookmarks(bookmarksData || []);
        setHistory(historyData || []);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setMessage('Something went wrong while loading data.');
      })
      .finally(() => setLoading(false));
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">👤 Your Profile</h2>

      {loading && <p className="text-gray-600 mb-2">Loading...</p>}
      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">🧩 Preferred Categories</h3>
        <div className="flex flex-wrap gap-3">
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
          className="mt-4 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
        >
          Save Preferences
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">🔖 Bookmarked Articles</h3>
        {bookmarks.length === 0 ? (
          <p className="text-gray-600">No bookmarks yet.</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((b, i) => (
              <li key={i}>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {b.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">📜 Read History</h3>
        {history.length === 0 ? (
          <p className="text-gray-600">No history yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i}>
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {h.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
