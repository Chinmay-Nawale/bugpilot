from flask import Blueprint, jsonify
from db import connection

users_bp = Blueprint("users", __name__)

@users_bp.route("/users")
def get_users():

    cursor = connection.cursor()

    cursor.execute("SELECT * FROM users")

    result = cursor.fetchall()

    users = []

    for row in result:
        users.append({
            "user_id": row[0],
            "username": row[1],
            "role": row[3]
        })

    return jsonify(users)