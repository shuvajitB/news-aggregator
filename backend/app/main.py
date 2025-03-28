from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, db, auth, preferences, user_data, news_api, rss_parser
from dotenv import load_dotenv
load_dotenv()

models.Base.metadata.create_all(bind=db.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://proud-unity-production.up.railway.app"
    ],  # ✅ frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(user_data.router)

@app.get("/news")
def get_news(page: int = 1, page_size: int = 6, category: str = '', query: str = ''):
    # 1. Fetch from NewsAPI
    news = news_api.fetch_newsapi_articles(category, query)

    # 2. Fallback to RSS if empty
    if not news:
        news = rss_parser.fetch_rss_articles()

    # 3. Fallback dummy
    if not news or len(news) == 0:
        news = [{
            "title": "Dummy News",
            "url": "https://example.com",
            "image": "https://source.unsplash.com/random",
            "category": category or "general"
        }]

    # 4. Filter by true category tag if specified
    if category:
        news = [a for a in news if a.get("category", "").lower() == category.lower()]

    # 5. Pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated = news[start:end]

    return { "articles": paginated }


    # Handle cases where slicing returns empty
    if not paginated_news:
        paginated_news = [{
            "title": "No more news available.",
            "url": "#",
            "image": "https://source.unsplash.com/random"
        }]
    
    return {"articles": paginated_news}
