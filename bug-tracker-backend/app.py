from flask import Flask
from flask_cors import CORS
from routes.users import users_bp
from routes.bugs import bugs_bp

app = Flask(__name__)

CORS(app)   # ← ADD THIS LINE

app.register_blueprint(users_bp)
app.register_blueprint(bugs_bp)

if __name__ == "__main__":
    app.run(debug=True)