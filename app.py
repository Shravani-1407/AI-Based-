from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import sqlite3
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)


DATABASE = "identity.db"
UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# Create uploads folder automatically
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def initialize_database():

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_number TEXT UNIQUE,
            status TEXT,
            document_type TEXT
        )
    """)

    demo_documents = [
        ("DEMO12345", "GENUINE", "Identity Document"),
        ("DEMO67890", "GENUINE", "Identity Document"),
        ("FAKE11111", "SUSPICIOUS", "Identity Document"),
        ("FAKE22222", "SUSPICIOUS", "Identity Document"),
        ("REVIEW333", "MANUAL REVIEW", "Identity Document")
    ]

    for document in demo_documents:

        cursor.execute("""
            INSERT OR IGNORE INTO documents
            (document_number, status, document_type)
            VALUES (?, ?, ?)
        """, document)

    connection.commit()
    connection.close()


# Serve frontend
@app.route("/")
def home():

    return send_from_directory(".", "index.html")


# Serve CSS
@app.route("/style.css")
def style():

    return send_from_directory(".", "style.css")


# Serve JavaScript
@app.route("/script.js")
def script():

    return send_from_directory(".", "script.js")


# Document upload and backend analysis
@app.route("/analyze", methods=["POST"])
def analyze_document():

    if "document" not in request.files:

        return jsonify({
            "success": False,
            "message": "No document uploaded"
        }), 400


    file = request.files["document"]


    if file.filename == "":

        return jsonify({
            "success": False,
            "message": "No document selected"
        }), 400


    filename = secure_filename(file.filename)


    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )


    file.save(filepath)


    file_size = os.path.getsize(filepath)


    # Prototype backend validation

    if file_size < 50 * 1024:

        image_quality = "LOW QUALITY"
        risk_score = 75
        decision = "SUSPICIOUS DOCUMENT"

    elif file_size > 500 * 1024:

        image_quality = "GOOD QUALITY"
        risk_score = 20
        decision = "LIKELY GENUINE"

    else:

        image_quality = "ACCEPTABLE"
        risk_score = 45
        decision = "MANUAL REVIEW REQUIRED"


    return jsonify({

        "success": True,

        "filename": filename,

        "file_size": file_size,

        "image_quality": image_quality,

        "risk_score": risk_score,

        "decision": decision

    })


# Database identity verification
@app.route("/verify/<document_number>")
def verify_document(document_number):

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT document_number, status, document_type
        FROM documents
        WHERE document_number = ?
    """, (document_number.upper(),))


    result = cursor.fetchone()

    connection.close()


    if result:

        return jsonify({

            "found": True,

            "document_number": result[0],

            "status": result[1],

            "document_type": result[2]

        })


    return jsonify({

        "found": False,

        "message": "Document not found in prototype database"

    })


if __name__ == "__main__":

    initialize_database()

    app.run(debug=True)