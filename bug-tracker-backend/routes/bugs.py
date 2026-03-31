from flask import Blueprint, jsonify, request
from db import connection

bugs_bp = Blueprint("bugs", __name__)


@bugs_bp.route("/bugs")
def get_bugs():

    cursor = connection.cursor()

    query = """
    SELECT
        b.bug_id,
        b.title,
        b.description,
        b.priority,
        b.status,
        r.username AS reported_by,
        a.username AS assigned_to,
        b.created_date
    FROM bugs b
    JOIN users r ON b.reported_by = r.user_id
    JOIN users a ON b.assigned_to = a.user_id
    ORDER BY b.created_date DESC
    """

    cursor.execute(query)

    result = cursor.fetchall()

    bugs = []

    for row in result:
        bugs.append({
            "bug_id": row[0],
            "title": row[1],
            "description":row[2],
            "priority": row[3],
            "status": row[4],
            "reported_by": row[5],
            "assigned_to": row[6],
            "created_date": row[7]
        })

    return jsonify(bugs)


@bugs_bp.route("/bugs", methods=["POST"])
def create_bug():

    data = request.json
    cursor = connection.cursor()

    query = """
    INSERT INTO bugs 
    (title, description, priority, severity, status, reported_by, assigned_to, created_date, expected_end_date)
    VALUES (%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
    """

    values = (
        data["title"],
        data["description"],
        data["priority"],
        data["severity"],
        "Open",
        data["reported_by"],
        data["assigned_to"],
        data["expected_end_date"]
    )

    cursor.execute(query, values)

    connection.commit()

    return jsonify({"message": "Bug created successfully"}), 201


@bugs_bp.route("/bugs/<int:bug_id>", methods=["PUT"])
def update_bug(bug_id):

    data = request.json
    cursor = connection.cursor()

    query = """
    UPDATE bugs 
    SET status = %s 
    WHERE bug_id = %s
    """

    values = (data["status"], bug_id)

    cursor.execute(query, values)

    connection.commit()

    return jsonify({"message": "Bug status updated successfully"})


@bugs_bp.route("/bugs/<int:bug_id>", methods=["DELETE"])
def delete_bug(bug_id):

    cursor = connection.cursor()

    query = """
    DELETE FROM bugs 
    WHERE bug_id = %s
    """

    cursor.execute(query, (bug_id,))

    connection.commit()

    return jsonify({"message": "Bug deleted successfully"})