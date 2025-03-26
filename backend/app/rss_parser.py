# rss_parser.py
import feedparser

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

def fetch_rss_articles():
    feeds = {
        # General feeds
        "https://rss.cnn.com/rss/edition.rss": "general",
        "https://feeds.bbci.co.uk/news/rss.xml": "general",
        "https://www.aljazeera.com/xml/rss/all.xml": "general",

        # Category-specific feeds
        "https://www.espn.com/espn/rss/news": "sports",
        "https://www.theverge.com/rss/index.xml": "technology",
        "https://www.etonline.com/news/rss": "entertainment",
        "https://www.medicalnewstoday.com/rss": "health",
        "https://www.reutersagency.com/feed/?best-sectors=business-finance&post_type=best": "business",
        "https://www.sciencedaily.com/rss/all.xml": "science",
    }

    articles = []
    try:
        for feed_url, category in feeds.items():
            feed = feedparser.parse(feed_url)
            print(f"Fetched {len(feed.entries)} articles from {feed_url}")

            for entry in feed.entries:
                title = entry.get("title", "")
                image_url = (
                    entry.get("media_content", [{}])[0].get("url") or
                    entry.get("media_thumbnail", [{}])[0].get("url") or
                    entry.get("image", {}).get("href") or
                    "https://source.unsplash.com/400x200/?news"
                )

                # Infer category from title if feed is general
                final_category = category.lower()
                if final_category == "general":
                    final_category = infer_category_from_title(title)

                articles.append({
                    "title": title or "No title",
                    "url": entry.get("link", ""),
                    "image": image_url,
                    "source": "rss",
                    "category": final_category
                })

        return articles

    except Exception as e:
        print(f"RSS Fetch Error: {e}")
        return []
