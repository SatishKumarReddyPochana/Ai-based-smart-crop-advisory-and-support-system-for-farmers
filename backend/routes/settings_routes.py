from flask import Blueprint, request, jsonify, current_app, url_for, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from models import db, User, ActivityLog

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

# Allowed extensions for profile photo
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ----------------------------------------
# 1️⃣ Get user settings
# ----------------------------------------
@settings_bp.route("/get/<int:user_id>", methods=["GET"])
def get_user_settings(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Return full URL for profile image
        user_data = user.to_dict()
        if user.profile_image:
            user_data["profile_image"] = url_for(
                'settings.serve_uploaded_file',
                filename=user.profile_image.replace("uploads/", ""),
                _external=True
            )
        else:
            user_data["profile_image"] = ""

        return jsonify(user_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# 2️⃣ Update profile (username, email)
# ----------------------------------------
@settings_bp.route("/update_profile", methods=["POST"])
def update_profile():
    try:
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        updated_fields = []

        if "username" in data and data["username"] != user.username:
            updated_fields.append({"field": "username", "old": user.username, "new": data["username"]})
            user.username = data["username"]

        if "email" in data and data["email"] != user.email:
            updated_fields.append({"field": "email", "old": user.email, "new": data["email"]})
            user.email = data["email"]

        db.session.commit()

        if updated_fields:
            log = ActivityLog(
                user_id=user.id,
                event="Profile updated",
                meta={"changes": updated_fields}
            )
            db.session.add(log)
            db.session.commit()

        return jsonify({"message": "Profile updated successfully!", "updated_fields": updated_fields})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# 3️⃣ Change password
# ----------------------------------------
@settings_bp.route("/change_password", methods=["POST"])
def change_password():
    try:
        data = request.json
        user_id = data.get("user_id")
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not all([user_id, old_password, new_password]):
            return jsonify({"error": "Missing parameters"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user.password, old_password):
            return jsonify({"error": "Old password is incorrect"}), 400

        user.password = generate_password_hash(new_password)
        db.session.commit()

        log = ActivityLog(user_id=user.id, event="Password changed")
        db.session.add(log)
        db.session.commit()

        return jsonify({"message": "Password changed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# 4️⃣ Upload / update profile photo
# ----------------------------------------
@settings_bp.route("/upload_photo", methods=["POST"])
def upload_profile_photo():
    try:
        if "photo" not in request.files:
            return jsonify({"error": "No photo uploaded"}), 400

        file = request.files["photo"]
        user_id = request.form.get("user_id")
        if not user_id or file.filename == "":
            return jsonify({"error": "Missing user_id or file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename)
        save_folder = os.path.join(current_app.root_path, "uploads", "profiles")
        os.makedirs(save_folder, exist_ok=True)
        filepath = os.path.join(save_folder, f"user_{user_id}_{filename}")
        file.save(filepath)

        user = User.query.get(user_id)
        if user:
            old_photo = user.profile_image
            relative_path = f"uploads/profiles/user_{user_id}_{filename}"
            user.profile_image = relative_path
            db.session.commit()

            log = ActivityLog(
                user_id=user.id,
                event="Profile photo updated",
                meta={"old_photo": old_photo, "new_photo": relative_path}
            )
            db.session.add(log)
            db.session.commit()

        photo_url = url_for(
            'settings.serve_uploaded_file',
            filename=f"profiles/user_{user_id}_{filename}",
            _external=True
        )

        return jsonify({"message": "Profile photo updated successfully!", "photo_url": photo_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# Serve uploaded files
# ----------------------------------------
@settings_bp.route("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, "uploads"), filename)


# ----------------------------------------
# 5️⃣ Update app settings
# ----------------------------------------
@settings_bp.route("/update_app_settings", methods=["POST"])
def update_app_settings():
    try:
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        updated_fields = []
        allowed_fields = ["dark_mode", "language", "notifications_enabled"]

        for field in allowed_fields:
            if field in data:
                old_value = getattr(user, field)
                new_value = data[field]
                if old_value != new_value:
                    setattr(user, field, new_value)
                    updated_fields.append({"field": field, "old": old_value, "new": new_value})

        db.session.commit()

        if updated_fields:
            log = ActivityLog(
                user_id=user.id,
                event="App settings updated",
                meta={"changes": updated_fields}
            )
            db.session.add(log)
            db.session.commit()

        # Return updated profile including full profile image URL
        user_data = user.to_dict()
        if user.profile_image:
            user_data["profile_image"] = url_for(
                'settings.serve_uploaded_file',
                filename=user.profile_image.replace("uploads/", ""),
                _external=True
            )

        return jsonify({"message": "App settings updated successfully!", "updated_fields": updated_fields, "user": user_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# 6️⃣ Delete account
# ----------------------------------------
@settings_bp.route("/delete_account", methods=["POST"])
def delete_account():
    try:
        data = request.json
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        log = ActivityLog(user_id=user.id, event="Account deleted")
        db.session.add(log)
        db.session.commit()

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Account deleted successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# 7️⃣ Get activity logs
# ----------------------------------------
@settings_bp.route("/activity_logs/<int:user_id>", methods=["GET"])
def get_activity_logs(user_id):
    try:
        logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.created_at.desc()).all()
        return jsonify([log.to_dict() for log in logs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

