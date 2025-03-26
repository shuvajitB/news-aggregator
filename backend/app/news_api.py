# news_api.py
import requests

API_KEY = "ed14cec616504a0387e52c597e2168d1"

def infer_category_from_title(title: str) -> str:
    title_lower = title.lower()

    keyword_map = {
        "sports": ["football", "cricket", "tennis", "fifa", "olympics", "nba", "match", "score"],
        "technology": ["tech", "ai", "apple", "google", "software", "smartphone", "robot", "microsoft"],
        "health": ["covid", "health", "vaccine", "medicine", "doctor", "mental health", "fitness"],
        "business": ["stock", "market", "economy", "trade", "startup", "investment", "revenue"],
        "science": ["nasa", "space", "physics", "research", "scientist", "quantum"],
        "entertainment": ["movie", "film", "celebrity", "hollywood", "netflix", "tv", "music"],
    }

    for cat, keywords in keyword_map.items():
        if any(kw in title_lower for kw in keywords):
            return cat

    return "general"


def fetch_newsapi_articles(category="", query=""):
    base_url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={API_KEY}&pageSize=100"
    if category:
        base_url += f"&category={category}"
    if query:
        base_url += f"&q={query}"

    try:
        response = requests.get(base_url)
        if response.status_code == 429:
            print("⚠️  NewsAPI Rate Limit Reached (429) — switching to RSS fallback")
            return []

        response.raise_for_status()
        data = response.json()

        if "articles" not in data:
            print("⚠️  NewsAPI response missing 'articles'")
            return []

        articles = data["articles"]
        print(f"✅ Fetched {len(articles)} NewsAPI articles (Category: {category or 'inferred'})")

        results = []
        for art in articles:
            title = art.get("title")
            url = art.get("url")
            image = art.get("urlToImage") or "https://source.unsplash.com/400x200/?news"


            if not title or not url:
                continue

            final_category = category.lower() if category else infer_category_from_title(title)

            results.append({
                "title": title,
                "url": url,
                "image": image,
                "source": "newsapi",
                "category": final_category
            })

        return results

    except requests.exceptions.RequestException as e:
        print(f"❌ NewsAPI Fetch Error: {e}")
        return []
