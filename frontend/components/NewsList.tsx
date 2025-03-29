'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useUserContext } from './UserContext';
import { useRouter } from 'next/navigation';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaBookmark } from 'react-icons/fa';
import { Share2, Newspaper } from 'lucide-react';

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
              (data.articles || []).map((a: Article) => ({ ...a, category: cat }))
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

      setArticles(prev => append ? [...prev, ...newArticles] : newArticles);
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
    return <div className="text-center py-10 text-gray-500">Loading News...</div>;
  }

  return (
    <div className={`${darkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/20 dark:bg-black/20 backdrop-blur border-b border-gray-300 px-6 py-3 flex justify-between items-center shadow-md">
        <a href="/" className="flex items-center space-x-2">
          <Newspaper size={30} />
          <span className="font-bold text-xl">News Aggregator</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/profile" title="Profile" className="rounded-full border px-3 py-1 hover:bg-white/40 transition">👤</a>
          <button onClick={handleLogout} className="rounded-full border px-4 py-1 hover:bg-white/40 transition">Logout</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-full bg-white/60 dark:bg-black/30 border text-sm w-full md:w-64"
          />
          <button type="submit" className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 text-sm">Search</button>
        </form>
        <label className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm">🌙</span>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only" />
          <div className="w-10 h-5 bg-gray-400 rounded-full relative">
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition ${darkMode ? 'translate-x-5' : ''}`}></div>
          </div>
        </label>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 px-6 py-4">
        {[ '', ...allCategories ].map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-1 rounded-full text-sm border backdrop-blur-sm transition ${
              selectedCategory === cat && !preferredMode
                ? 'bg-black text-white border-black'
                : 'bg-white/50 dark:bg-white/20 text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-white/30'
            }`}
          >
            {cat === '' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button
          onClick={() => { setPreferredMode(true); setSelectedCategory(''); }}
          className={`px-4 py-1 rounded-full text-sm border backdrop-blur-sm transition ${preferredMode ? 'bg-black text-white border-black' : 'bg-white/50 dark:bg-white/20 text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-white/60 dark:hover:bg-white/30'}`}
        >
          Preferred
        </button>
        <button
          onClick={() => { setPreferredMode(false); setViewBookmarks(!viewBookmarks); }}
          className="px-4 py-1 rounded-full text-sm border transition backdrop-blur-sm bg-white/50 dark:bg-white/20 hover:bg-white/70 dark:hover:bg-white/30"
        >
          {viewBookmarks ? 'View All News' : 'View Bookmarks'}
        </button>
      </div>

      {/* News Cards */}
      {loading && articles.length === 0 ? (
        <div className="text-lg flex justify-center items-center min-h-[40vh]">Loading news...</div>
      ) : displayedArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 pb-12">
          {displayedArticles.map((article, index) => (
            <div key={index} className={`rounded-xl overflow-hidden backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl duration-300`}>
              <img src={article.image || `https://source.unsplash.com/400x200/?news,${index}`} alt="thumbnail" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1 line-clamp-2">
                  {article.title}
                  {(preferredMode || userPreferences.includes(article.category?.toLowerCase() || '')) && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">Preferred</span>
                  )}
                </h2>
                {article.category && (
                  <p className="text-xs text-gray-300 dark:text-gray-400 mb-2">
                    Category: <span className="capitalize">{article.category}</span>
                  </p>
                )}
                <div className="flex space-x-4 mb-2 text-white/80">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`} target="_blank" rel="noopener noreferrer"><FaFacebookF size={16} /></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer"><FaTwitter size={16} /></a>
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + article.url)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp size={16} /></a>
                  <button onClick={() => navigator.clipboard.writeText(article.url)}><Share2 size={16} /></button>
                  <button onClick={() => handleBookmark(article)} title="Bookmark">
                    <FaBookmark size={16} color={bookmarks.find(b => b.url === article.url) ? '#FFD700' : 'gray'} />
                  </button>
                </div>
                <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={() => handleReadHistory(article)} className="hover:underline text-white">Read More</a>
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
