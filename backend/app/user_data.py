from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, db
from pydantic import BaseModel

router = APIRouter()

class ItemIn(BaseModel):
    email_phone: str
    title: str
    url: str
    image: str

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

# Add Bookmark
@router.post("/bookmark/add")
def add_bookmark(item: ItemIn, database: Session = Depends(get_db)):
    bookmark = models.Bookmark(email_phone=item.email_phone, title=item.title, url=item.url, image=item.image)
    database.add(bookmark)
    database.commit()
    return {"message": "Bookmark added"}

# List Bookmarks
@router.get("/bookmark/list")
def list_bookmarks(email_phone: str, database: Session = Depends(get_db)):
    bookmarks = database.query(models.Bookmark).filter(models.Bookmark.email_phone == email_phone).all()
    return [{ "id": b.id, "title": b.title, "url": b.url, "image": b.image } for b in bookmarks]

# Delete Bookmark
@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: int, email_phone: str, database: Session = Depends(get_db)):
    bookmark = database.query(models.Bookmark).filter(models.Bookmark.id == bookmark_id, models.Bookmark.email_phone == email_phone).first()
    if bookmark:
        database.delete(bookmark)
        database.commit()
        return { "message": "Bookmark deleted" }
    else:
        raise HTTPException(status_code=404, detail="Bookmark not found")

# Add History
@router.post("/history/add")
def add_history(item: ItemIn, database: Session = Depends(get_db)):
    history = models.History(email_phone=item.email_phone, title=item.title, url=item.url, image=item.image)
    database.add(history)
    database.commit()
    return {"message": "History added"}

# List History
@router.get("/history")
def list_history(email_phone: str, database: Session = Depends(get_db)):
    history_items = database.query(models.History).filter(models.History.email_phone == email_phone).all()
    return [{ "id": h.id, "title": h.title, "url": h.url, "image": h.image } for h in history_items]

# Delete History
@router.delete("/history/{history_id}")
def delete_history(history_id: int, email_phone: str, database: Session = Depends(get_db)):
    history_item = database.query(models.History).filter(models.History.id == history_id, models.History.email_phone == email_phone).first()
    if history_item:
        database.delete(history_item)
        database.commit()
        return { "message": "History deleted" }
    else:
        raise HTTPException(status_code=404, detail="History not found")
