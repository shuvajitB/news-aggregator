'use client';

import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Article {
  title: string;
  url: string;
  image: string;
  category?: string;
}

export default function NewsList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchArticles = async (category = '') => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/news${category ? `?category=${category}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchArticles(category);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <label className="mr-2 text-lg font-medium">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
          <option value="entertainment">Celebrity</option>
          <option value="science">Science</option>
          <option value="technology">Technology</option>
          <option value="health">Health</option>
        </select>
      </div>

      {loading ? (
        <div className="text-lg flex justify-center items-center min-h-screen">
          Loading news...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 bg-white"
            >
              <img
                src={article.image || `https://source.unsplash.com/400x200/?news,${index}`}
                alt="thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2 line-clamp-2 text-black">
                  {article.title}
                </h2>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
