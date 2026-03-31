from flask import Flask
from flask_cors import CORS
from models import db
from routes.auth_routes import auth_bp
from routes.land_routes import land_bp
from routes.crop_routes import crop_bp
from routes.predict_routes import predict_bp
from routes.fertilizer_routes import fertilizer_bp
from routes.pesticide_routes import pesticide_bp
from routes.irrigation_routes import irrigation_bp
from routes.weather_routes import weather_bp
from routes.market_price_routes import market_price_bp
from routes.yield_routes import yield_bp
from routes.disease_routes import disease_bp
from routes.chatbot_routes import chatbot_bp
from routes.settings_routes import settings_bp
import os

app = Flask(__name__)
CORS(app)

# ------------------- PostgreSQL -------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Satish%40359@localhost/agrigenius_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ------------------- File Upload -------------------
UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads", "profiles")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ------------------- Initialize DB -------------------
db.init_app(app)
with app.app_context():
    db.create_all()

# ------------------- Register Blueprints -------------------
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(land_bp, url_prefix='/api/land')
app.register_blueprint(crop_bp, url_prefix='/api/crop')
app.register_blueprint(predict_bp, url_prefix='/api/predict')
app.register_blueprint(fertilizer_bp, url_prefix='/api/fertilizer')
app.register_blueprint(pesticide_bp, url_prefix='/api/pesticide')
app.register_blueprint(irrigation_bp, url_prefix='/api/irrigation')
app.register_blueprint(weather_bp, url_prefix='/api/weather')
app.register_blueprint(market_price_bp, url_prefix='/api/predict_market_price')
app.register_blueprint(yield_bp, url_prefix='/api/yield')
app.register_blueprint(disease_bp, url_prefix='/api/disease')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
app.register_blueprint(settings_bp, url_prefix='/api/settings')

@app.route('/')
def home():
    return "AgriGenius AI Backend is running!"

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
