from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app import db, models
from passlib.hash import bcrypt
from pydantic import BaseModel, EmailStr
from datetime import date

router = APIRouter()

# Database dependency
def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# Request Model for Registration
class UserCreate(BaseModel):
    email_phone: EmailStr
    password: str
    name: str
    dob: date

# Request Model for Login
class UserLogin(BaseModel):
    email_phone: str
    password: str

# ✅ Response Model for Profile
class UserProfile(BaseModel):
    email_phone: str
    name: str
    dob: date

# REGISTER ENDPOINT
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email_phone == user.email_phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists!")

    hashed_pw = bcrypt.hash(user.password)
    new_user = models.User(
        email_phone=user.email_phone,
        hashed_password=hashed_pw,
        preferences='',
        name=user.name,
        dob=user.dob
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

# LOGIN ENDPOINT
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email_phone == user.email_phone).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found!")

    if not bcrypt.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password!")

    return {"message": "Login successful"}

# ✅ PROFILE FETCH ENDPOINT
@router.get("/profile", response_model=UserProfile)
def get_profile(email_phone: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email_phone == email_phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "email_phone": user.email_phone,
        "name": user.name,
        "dob": user.dob
    }
