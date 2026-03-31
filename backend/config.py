# config.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection URL
DATABASE_URL = "postgresql+psycopg2://postgres:Satish%40359@localhost:5432/agrigenius_db"

# SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# config.py

# This key is used for JWT token encryption. Change it to something strong!
SECRET_KEY = 'agrigenius_2025_super_secure_key'

import os

class Config:
    SECRET_KEY = 'your_secret_key'  # Change this to a secure random key
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:Satish%40359@localhost:5432/agrigenius_db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
