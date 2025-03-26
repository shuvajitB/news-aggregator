'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../../components/UserContext';

const categories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

export default function ProfilePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const { user } = useUserContext();
  const email = user?.email || '';

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:8000/preferences?email_phone=${email}`)
      .then(res => res.json())
      .then(data => setSelected(data.preferences.categories || []))
      .catch(err => console.error('Failed to fetch preferences:', err));
  }, [email]);

  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      setSelected(selected.filter(c => c !== category));
    } else {
      setSelected([...selected, category]);
    }
  };

  const savePreferences = () => {
    if (!email) return;
    fetch(`http://localhost:8000/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_phone: email,
        categories: selected
      }),
    })
      .then(() => alert('Preferences saved!'))
      .catch(() => alert('Failed to save preferences.'));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Select Preferred Categories</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-4 py-2 rounded-full border ${
              selected.includes(cat) ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>
      <button onClick={savePreferences} className="bg-black text-white px-6 py-2 rounded-full">
        Save
      </button>
    </div>
  );
}
