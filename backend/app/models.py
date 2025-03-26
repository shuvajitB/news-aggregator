from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email_phone = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    preferences = Column(String)  # Optional: can store preferences here too

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = Column(Integer, primary_key=True, index=True)
    email_phone = Column(String, index=True)
    title = Column(String)
    url = Column(String)
    image = Column(String)

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    email_phone = Column(String, index=True)
    title = Column(String)
    url = Column(String)
    image = Column(String)

class Preference(Base):
    __tablename__ = "preferences"
    id = Column(Integer, primary_key=True, index=True)
    email_phone = Column(String, unique=True)
    categories = Column(String)  # Stored as comma-separated string
