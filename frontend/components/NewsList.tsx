'use client';

import React, { useEffect, useState } from 'react';
import { useUserContext } from '@components/UserContext';
import { useRouter } from 'next/navigation';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaBookmark } from 'react-icons/fa';
import { Share2, Newspaper, ChevronDown } from 'lucide-react';

interface Article {
  title: string;
  url: string;
  image: string;
  category?: string;
}

export default function NewsList() {
  const { user, setLoggedIn } = useUserContext();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [preferredMode, setPreferredMode] = useState(false); // ✅ Preferred Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [viewBookmarks, setViewBookmarks] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const articlesPerLoad = 6;

  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const allCategories = ['business', 'sports', 'entertainment', 'science', 'technology', 'health'];

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail') || '';
      setUserEmail(storedEmail);

      const storedFilters = localStorage.getItem('filterCategories');
      if (storedFilters) {
        setFilterCategories(JSON.parse(storedFilters));
      }
    }
  }, []);

  useEffect(() => {
    const prefs = localStorage.getItem('userPreferences');
    if (prefs) {
      const { categories } = JSON.parse(prefs);
      if (categories?.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:8000/preferences?email_phone=${userEmail}`)
        .then(res => res.json())
        .then(data => setUserPreferences(data.preferences.categories || []))
        .catch(() => setUserPreferences([]));
    }
  }, [userEmail]);

  const toggleFilterCategory = (cat: string) => {
    const updated = filterCategories.includes(cat)
      ? filterCategories.filter(c => c !== cat)
      : [...filterCategories, cat];
    setFilterCategories(updated);
    localStorage.setItem('filterCategories', JSON.stringify(updated));
    fetchArticles(1, false);
  };

  const prioritizeArticles = (articlesList: Article[]) => {
    if (userPreferences.length === 0) return articlesList;
  
    const preferred = articlesList.filter(a =>
      a.category && userPreferences.includes(a.category.toLowerCase())
    );
  
    const others = articlesList.filter(a =>
      !a.category || !userPreferences.includes(a.category.toLowerCase())
    );
  
    return [...preferred, ...others];
  };
  

  const fetchArticles = async (pageNum = 1, append = false) => {
    setLoading(true);
  
    try {
      let newArticles: Article[] = [];
  
      // ✅ Preferred Mode Fetch
      if (preferredMode && userPreferences.length > 0) {
        const fetches = userPreferences.map(cat =>
          fetch(`http://localhost:8000/news?page=${pageNum}&page_size=${articlesPerLoad}&category=${cat}`)
            .then(res => res.json())
            .then(data =>
              (data.articles || []).map((a: Article) => ({
                ...a,
                category: cat.toLowerCase(), // ✅ Ensure category is tagged
                image: a.image || 'https://source.unsplash.com/random' // ✅ Fallback image
              }))
            )
            .catch(() => [])
        );
  
        const results = await Promise.all(fetches);
        const allPreferred = results.flat();
  
        // ✅ Remove duplicate articles by URL
        const uniqueMap = new Map(allPreferred.map(article => [article.url, article]));
        newArticles = Array.from(uniqueMap.values());
      } else {
        // ✅ Regular Fetch
        let url = `http://localhost:8000/news?page=${pageNum}&page_size=${articlesPerLoad}`;
        const params = [];
  
        if (selectedCategory) params.push(`category=${selectedCategory}`);
        if (searchTerm) params.push(`query=${searchTerm}`);
        if (params.length > 0) url += `&${params.join('&')}`;
  
        const res = await fetch(url);
        const data = await res.json();
        newArticles = (data.articles || []).map((a: Article) => ({
          ...a,
          image: a.image || 'https://source.unsplash.com/random'
        }));
      }
  
      // ✅ Apply dropdown filter if not preferred mode and no category selected
      if (!preferredMode && selectedCategory === '' && filterCategories.length > 0) {
        newArticles = newArticles.filter(article =>
          filterCategories.includes(article.category?.toLowerCase() || '')
        );
      }
  
      // ✅ Set Articles
      setArticles(prev => (append ? [...prev, ...newArticles] : newArticles));
  
      // ✅ Control pagination
      setHasMore(newArticles.length >= articlesPerLoad);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCategoryChange = (category: string) => {
    setPreferredMode(false); // ⛔ turn off preferred when selecting category
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferredMode(false); // ⛔ turn off preferred when searching
    fetchArticles(1, false);
    setPage(1);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userToken');
    }
    router.push('/');
  };

  const handleBookmark = (article: Article) => {
    if (!userEmail) return;
    const exists = bookmarks.find(b => b.url === article.url);
    if (exists) return;
    fetch('http://localhost:8000/bookmark/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_phone: userEmail, title: article.title, url: article.url, image: article.image }),
    }).then(() => fetchBookmarks());
  };

  const handleReadHistory = (article: Article) => {
    if (!userEmail) return;
    fetch('http://localhost:8000/history/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_phone: userEmail, title: article.title, url: article.url, image: article.image }),
    });
  };

  const fetchBookmarks = () => {
    if (!userEmail) return;
    fetch(`http://localhost:8000/bookmark/list?email_phone=${userEmail}`)
      .then(res => res.json())
      .then(data => setBookmarks(data || []));
  };

  useEffect(() => {
    if (userEmail) fetchBookmarks();
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchArticles(1, false);
      setPage(1);
    }
  }, [selectedCategory, searchTerm, userPreferences, userEmail]);

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
          <a href="/profile" className="bg-white text-black px-3 py-1 rounded-full border border-gray-400 shadow-sm hover:bg-gray-200">Profile</a>
          <button onClick={handleLogout} className="bg-white text-black px-3 py-1 rounded-full border border-gray-400 shadow-sm hover:bg-gray-200">Logout</button>
        </div>
      </div>

      {/* Search, Filter, Dark Mode */}
      <div className="flex justify-between items-center px-4 mt-6 mb-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input type="text" placeholder="Search news..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-56 p-1.5 border rounded-full text-sm ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} />
          <button type="submit" className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition">Search</button>
        </form>

        {/* ✅ Filter Dropdown */}
        <div className="relative ml-4">
          <button
            type="button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-gray-100 px-3 py-1.5 rounded-full text-sm border shadow-sm flex items-center space-x-1 hover:bg-gray-200"
          >
            <span>Filter</span>
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 space-y-2">
              {allCategories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filterCategories.includes(cat)}
                    onChange={() => toggleFilterCategory(cat)}
                    className="accent-black"
                  />
                  <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

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
