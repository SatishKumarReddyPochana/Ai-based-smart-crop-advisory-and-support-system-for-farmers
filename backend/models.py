from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ---------------------------------------------------------
# USER MODEL
# ---------------------------------------------------------
class User(db.Model):
    __tablename__ = "user"   # important to match your existing DB table
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # ---------- SETTINGS MODULE NEW FIELDS ----------
    profile_image = db.Column(db.String(512), nullable=True)
    dark_mode = db.Column(db.Boolean, default=False)
    language = db.Column(db.String(32), default="English")
    notifications_enabled = db.Column(db.Boolean, default=True)
    default_city = db.Column(db.String(128), nullable=True)
    default_land_id = db.Column(db.Integer, db.ForeignKey("land_profile.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "profile_image": self.profile_image,
            "dark_mode": self.dark_mode,
            "language": self.language,
            "notifications_enabled": self.notifications_enabled,
            
        }


# ---------------------------------------------------------
# CROP MODEL
# ---------------------------------------------------------
class Crop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    crop_name = db.Column(db.String(100), nullable=False)
    soil_type = db.Column(db.String(100))
    season = db.Column(db.String(50))
    temperature_range = db.Column(db.String(50))
    rainfall_requirement = db.Column(db.String(100))
    suitable_regions = db.Column(db.String(200))


# ---------------------------------------------------------
# LAND PROFILE MODEL
# ---------------------------------------------------------
class LandProfile(db.Model):
    __tablename__ = 'land_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    soil_type = db.Column(db.String(50), nullable=False)
    ph = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(100), nullable=False)


# ---------------------------------------------------------
# ACTIVITY LOG MODEL (NEW)
# ---------------------------------------------------------
class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    event = db.Column(db.String(255), nullable=False)
    meta = db.Column(db.JSON, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event": self.event,
            "meta": self.meta,
            "created_at": self.created_at.isoformat(),
        }
