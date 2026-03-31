
# create_tables.py

from models import Base
from database import engine  # Assuming this is where you created your engine

Base.metadata.create_all(bind=engine)
