# config.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection URL
DATABASE_URL = "Enter the url"

# SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# config.py

# This key is used for JWT token encryption. Change it to something strong!
SECRET_KEY = 'Enter key'

import os

class Config:
    SECRET_KEY = 'your_secret_key'  # Change this to a secure random key
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "Enter the url")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
