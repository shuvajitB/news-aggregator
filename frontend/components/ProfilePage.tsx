'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useRouter } from 'next/navigation';
const router = useRouter();

interface Bookmark {
  id: number;
  title: string;
  url: string;
  image: string;
}

interface HistoryItem {
  id: number;
  title: string;
  url: string;
  image: string;
}

interface NewsArticle {
  title: string;
  url: string;
  image: string;
}

const categories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  const [preferences, setPreferences] = useState<{ categories: string[] }>({ categories: [] });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preferredNews, setPreferredNews] = useState<NewsArticle[]>([]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Set theme on initial load
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // SSR-safe mount + user email
  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail') || '';
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted || !userEmail) return;

    // Preferences
    axios
      .get<{ preferences: { categories: string[] } }>(`http://localhost:8000/preferences?email_phone=${userEmail}`)
      .then((res) => {
        const prefs = res.data.preferences.categories || [];
        setPreferences({ categories: prefs });
        setSelectedCategories(prefs);
        localStorage.setItem('userPreferences', JSON.stringify({ categories: prefs }));

        // Fetch preferred news
        Promise.all(
          prefs.map((cat) =>
            fetch(`http://localhost:8000/news?page=1&page_size=6&category=${cat}`)
              .then((res) => res.json())
              .then((data) => {
                return data.articles?.map((article: any) => ({
                  ...article,
                  category: cat  // ✅ attach category from request
                })) || [];
              })
          )
        ).then((allArticles) => {
          const combined = allArticles.flat();
          const unique = Array.from(new Map(combined.map((a) => [a.url, a])).values());
          setPreferredNews(unique);
        });        
      })
      .catch((err) => console.error('Failed to fetch preferences:', err));

    // Bookmarks
    axios
      .get<Bookmark[]>(`http://localhost:8000/bookmark/list?email_phone=${userEmail}`)
      .then((res) => setBookmarks(res.data))
      .catch((err) => console.error('Failed to fetch bookmarks:', err));

    // History
    axios
      .get<HistoryItem[]>(`http://localhost:8000/history?email_phone=${userEmail}`)
      .then((res) => setHistory(res.data || []))
      .catch((err) => console.error('Failed to fetch history:', err));
  }, [hasMounted, userEmail]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const savePreferences = () => {
    if (!userEmail) return;
    axios
      .post(`http://localhost:8000/preferences`, {
        email_phone: userEmail,
        categories: selectedCategories,
      })
      .then(() => {
        // Optional: store preferences in localStorage (used by homepage)
        localStorage.setItem('userPreferences', JSON.stringify({ categories: selectedCategories }));
      
        // ✅ Redirect to homepage /news
        window.location.href = '/news';

      })      
      .catch(() => alert('Failed to save preferences.'));
  };

  const deleteBookmark = (id: number) => {
    axios
      .delete(`http://localhost:8000/bookmarks/${id}?email_phone=${userEmail}`)
      .then(() => setBookmarks(bookmarks.filter((b) => b.id !== id)))
      .catch((err) => console.error('Failed to delete bookmark:', err));
  };

  const deleteHistory = (id: number) => {
    axios
      .delete(`http://localhost:8000/history/${id}?email_phone=${userEmail}`)
      .then(() => setHistory(history.filter((h) => h.id !== id)))
      .catch((err) => console.error('Failed to delete history:', err));
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
    html.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  if (!hasMounted || !userEmail) {
    return <div className="text-center py-10">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 dark:bg-black dark:text-white min-h-screen transition duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-full text-sm bg-gray-200 text-black dark:bg-gray-800 dark:text-white shadow"
        >
          Toggle Theme
        </button>
      </div>

      {/* Preferences */}
      <div className="mb-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🧠 Select Your Preferences</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition duration-200 ${
                selectedCategories.includes(cat)
                  ? 'bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={savePreferences}
          className="mt-6 w-full bg-black text-white py-3 rounded-xl font-semibold shadow hover:bg-gray-800 transition duration-200 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Save Preferences
        </button>
        {showSuccess && (
          <div className="text-green-400 mt-4 text-sm text-center">
            Preferences saved successfully!
          </div>
        )}
      </div>

      {/* Preferred News */}
      {preferredNews.length > 0 && (
        <div className="mb-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📰 Preferred News Feed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {preferredNews.map((article, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow transition dark:border-gray-700">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {article.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      <div className="mb-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔖 Bookmarks</h2>
        {bookmarks.length > 0 ? (
          <ul className="space-y-3">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id} className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">
                  {bookmark.title}
                </a>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No bookmarks yet.</p>
        )}
      </div>

      {/* Reading History */}
      <div className="mb-10 p-6 bg-white dark:bg-gray-900 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📚 Reading History</h2>
        {history.length > 0 ? (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b pb-2 dark:border-gray-700">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline dark:text-gray-200">
                  {item.title}
                </a>
                <button
                  onClick={() => deleteHistory(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No reading history yet.</p>
        )}
      </div>
    </div>
  );
}
