from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, db
from pydantic import BaseModel

router = APIRouter()

class PreferenceIn(BaseModel):
    email_phone: str
    categories: list[str]

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

@router.get("/preferences")
def get_preferences(email_phone: str, database: Session = Depends(get_db)):
    preference = database.query(models.Preference).filter(models.Preference.email_phone == email_phone).first()
    if preference and preference.categories:
        categories = preference.categories.split(",")
    else:
        categories = []
    return { "preferences": { "categories": categories } }

@router.post("/preferences")
def set_preferences(preference_in: PreferenceIn, database: Session = Depends(get_db)):
    print("Incoming preference save for:", preference_in.email_phone)
    print("Categories to save:", preference_in.categories)

    existing = database.query(models.Preference).filter(models.Preference.email_phone == preference_in.email_phone).first()

    if existing:
        existing.categories = ",".join(preference_in.categories)
        print("Updating existing preferences...")
    else:
        new_pref = models.Preference(
            email_phone=preference_in.email_phone,
            categories=",".join(preference_in.categories)
        )
        database.add(new_pref)
        print("Creating new preference row...")

    try:
        database.commit()
        saved = database.query(models.Preference).filter(models.Preference.email_phone == preference_in.email_phone).first()
        print("Saved categories in DB:", saved.categories)
        return { "message": "Preferences saved" }
    except Exception as e:
        print("Error during DB commit:", e)
        database.rollback()
        return { "error": "Failed to save preferences" }
