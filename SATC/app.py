"""
Flask app: word search over SATC dialogues.
Run: python app.py
Open: http://127.0.0.1:5000
"""
import os
from flask import Flask, request, jsonify, send_from_directory

from search import load_dialogues, search

app = Flask(__name__, static_folder="static")
app.config["JSON_SORT_KEYS"] = False

# Load CSV once at startup
_df = None


def get_df():
    global _df
    if _df is None:
        _df = load_dialogues()
    return _df


@app.route("/")
def index():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "static"), "index.html")


@app.route("/api/search")
def api_search():
    q = request.args.get("q", "").strip()
    limit = request.args.get("limit", 500, type=int)
    limit = min(max(1, limit), 1000)
    df = get_df()
    results = search(df, q, limit=limit)
    return jsonify({"query": q, "count": len(results), "results": results})


if __name__ == "__main__":
    print("Loading dialogues...")
    get_df()
    print("Ready. Open http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
