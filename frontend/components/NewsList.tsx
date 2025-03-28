'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useUserContext } from './UserContext';
import { useRouter } from 'next/navigation';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaBookmark } from 'react-icons/fa';
import { Share2, Newspaper, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Article {
  title: string;
  url: string;
  image: string;
  category?: string;
}

export default function NewsList() {
  const { setLoggedIn } = useUserContext();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [preferredMode, setPreferredMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [viewBookmarks, setViewBookmarks] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  const allCategories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

  const articlesPerLoad = 6;

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail') || '';
      setUserEmail(storedEmail);

      const storedFilters = localStorage.getItem('filterCategories');
      if (storedFilters) {
        setFilterCategories(JSON.parse(storedFilters));
      }

      const prefs = localStorage.getItem('userPreferences');
      if (prefs) {
        const { categories } = JSON.parse(prefs);
        if (categories?.length > 0) {
          setSelectedCategory(categories[0]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetch(`${API_BASE_URL}/preferences?email_phone=${userEmail}`)
        .then(res => res.json())
        .then(data => setUserPreferences(data.preferences.categories || []))
        .catch(() => setUserPreferences([]));
    }
  }, [userEmail]);

  const fetchArticles = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);

    try {
      let newArticles: Article[] = [];

      if (preferredMode && userPreferences.length > 0) {
        const fetches = userPreferences.map(cat =>
          fetch(`${API_BASE_URL}/news?page=${pageNum}&page_size=${articlesPerLoad}&category=${cat}`)
            .then(res => res.json())
            .then(data =>
              (data.articles || []).map((a: Article) => ({
                ...a,
                category: cat,
              }))
            )
            .catch(() => [])
        );

        const results = await Promise.all(fetches);
        newArticles = results.flat();
      } else {
        let url = `${API_BASE_URL}/news?page=${pageNum}&page_size=${articlesPerLoad}`;
        const params = [];
        if (selectedCategory) params.push(`category=${selectedCategory}`);
        if (searchTerm) params.push(`query=${searchTerm}`);
        if (params.length > 0) url += `&${params.join('&')}`;

        const res = await fetch(url);
        const data = await res.json();
        newArticles = data.articles || [];
      }

      if (!preferredMode && selectedCategory === '' && filterCategories.length > 0) {
        newArticles = newArticles.filter(article =>
          filterCategories.includes(article.category?.toLowerCase() || '')
        );
      }

      if (append) {
        setArticles(prev => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }

      setHasMore(newArticles.length > 0);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }

    setLoading(false);
  }, [preferredMode, userPreferences, selectedCategory, searchTerm, filterCategories]);

  const handleCategoryChange = (category: string) => {
    setPreferredMode(false);
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferredMode(false);
    fetchArticles(1, false);
    setPage(1);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userToken');
    router.push('/');
  };

  const handleBookmark = (article: Article) => {
    if (!userEmail) return;
    const exists = bookmarks.find(b => b.url === article.url);
    if (exists) return;
    fetch(`${API_BASE_URL}/bookmark/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_phone: userEmail, title: article.title, url: article.url, image: article.image }),
    }).then(() => fetchBookmarks());
  };

  const handleReadHistory = (article: Article) => {
    if (!userEmail) return;
    fetch(`${API_BASE_URL}/history/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_phone: userEmail, title: article.title, url: article.url, image: article.image }),
    });
  };

  const fetchBookmarks = useCallback(() => {
    if (!userEmail) return;
    fetch(`${API_BASE_URL}/bookmark/list?email_phone=${userEmail}`)
      .then(res => res.json())
      .then(data => setBookmarks(data || []));
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) fetchBookmarks();
  }, [userEmail, fetchBookmarks]);

  useEffect(() => {
    if (userEmail) {
      fetchArticles(1, false);
      setPage(1);
    }
  }, [selectedCategory, searchTerm, userPreferences, userEmail, fetchArticles]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, articles, hasMore]);

  const loadMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, true);
  };

  const displayedArticles = viewBookmarks ? bookmarks : articles;

  if (!hasMounted || !userEmail) {
    return <div className="text-center py-10">Loading News...</div>;
  }

  return (
    <div className={`${darkMode ? 'bg-black' : 'bg-white'} text-black min-h-screen`}>
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 sticky top-0 bg-opacity-90 backdrop-blur-md z-50 border-b border-gray-300">
        <a href="/" className="hover:opacity-80 transition flex items-center space-x-2">
          <Newspaper size={30} className={`${darkMode ? 'text-white' : 'text-black'}`} />
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>News Aggregator</span>
        </a>

        <div className="flex items-center space-x-4">
          <a href="/profile" title="Profile">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-400 text-xl hover:shadow hover:scale-105 transition-all">
          🐱
          </div>
           </a>
          <button onClick={handleLogout} className="bg-white text-black px-3 py-1 rounded-full border border-gray-400 shadow-sm hover:bg-gray-200">Logout</button>
        </div>
      </div>

      {/* Search, Filter, Dark Mode */}
      <div className="flex justify-between items-center px-4 mt-6 mb-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input type="text" placeholder="Search news..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-56 p-1.5 border rounded-full text-sm ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} />
          <button type="submit" className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition">Search</button>
        </form>

        {/* Dark Mode Toggle */}
        <label className="flex items-center cursor-pointer ml-4">
          <div className="relative">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only" />
            <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${darkMode ? 'translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      {/* Category + Preferred + Bookmark buttons */}
      <div className="flex flex-wrap gap-3 px-4 mb-4">
        {['', 'business', 'sports', 'entertainment', 'science', 'technology', 'health'].map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1 rounded-full text-sm border shadow-sm transition-all ${
              selectedCategory === cat && !preferredMode
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
            }`}
          >
            {cat === '' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}

        <button
          onClick={() => {
            setPreferredMode(true);
            setSelectedCategory('');
          }}
          className={`px-3 py-1 rounded-full text-sm border shadow-sm transition-all ${
            preferredMode
              ? 'bg-black text-white border-black hover:bg-gray-800'
              : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
          }`}
        >
          Preferred
        </button>

        <button
          onClick={() => {
            setPreferredMode(false);
            setViewBookmarks(!viewBookmarks);
          }}
          className="px-3 py-1 rounded-full border shadow-sm text-sm hover:bg-gray-200"
        >
          {viewBookmarks ? 'View All News' : 'View Bookmarks'}
        </button>
      </div>

      {/* News Cards */}
      {loading && articles.length === 0 ? (
        <div className="text-lg flex justify-center items-center min-h-[40vh]">Loading news...</div>
      ) : displayedArticles && displayedArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 pb-12">
          {displayedArticles.map((article, index) => (
            <div key={index} className={`rounded-xl overflow-hidden transition-transform hover:scale-105 ${darkMode ? 'bg-gray-800 text-white shadow-[0_0_10px_#ffffff30]' : 'bg-white text-black shadow-md'} border`}>
              <img src={article.image || `https://source.unsplash.com/400x200/?news,${index}`} alt="thumbnail" className="w-full h-48 object-cover" />
              <div className="p-4">
              <h2 className={`text-lg font-bold mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                {article.title}
                {(preferredMode || userPreferences.includes(article.category?.toLowerCase() || '')) && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">Preferred</span>
                )}
              </h2>

              {article.category && (
                <p className="text-xs text-gray-500 mb-2">
                  Category: <span className="capitalize">{article.category}</span>
                </p>
              )}


                <div className="flex space-x-4 mb-2">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`} target="_blank" rel="noopener noreferrer"><FaFacebookF size={16} /></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer"><FaTwitter size={16} /></a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + article.url)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp size={16} /></a>
                  <button onClick={() => navigator.clipboard.writeText(article.url)}><Share2 size={16} /></button>
                  <button onClick={() => handleBookmark(article)} title="Bookmark"><FaBookmark size={16} color={bookmarks.find(b => b.url === article.url) ? '#FFD700' : 'gray'} /></button>
                </div>

                <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => handleReadHistory(article)} className={`hover:underline ${darkMode ? 'text-white' : 'text-black'}`}>Read More</a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-lg flex justify-center items-center min-h-[40vh]">No news found.</div>
      )}

      {hasMore && (
        <div className="text-center my-6 text-sm text-gray-500">Loading more news...</div>
      )}
    </div>
  );
}
