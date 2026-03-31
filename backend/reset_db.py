from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    # Disable foreign key checks and drop all tables with CASCADE
    db.session.execute(text("DROP SCHEMA public CASCADE;"))
    db.session.execute(text("CREATE SCHEMA public;"))
    db.session.commit()

    # Recreate tables
    db.create_all()
    print("✅ Database reset successfully with CASCADE.")


