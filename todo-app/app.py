from flask import Flask, request, jsonify, render_template
import uuid
import json
import os

app = Flask(__name__)

DATA_FILE = "todos.json"

def load_todos():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return []

def save_todos(todos):
    with open(DATA_FILE, "w") as f:
        json.dump(todos, f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/todos", methods=["GET"])
def get_todos():
    return jsonify(load_todos())

@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400
    todos = load_todos()
    todo = {
        "id": str(uuid.uuid4()),
        "title": title,
        "completed": False,
        "priority": data.get("priority", "medium"),
        "category": data.get("category", "General")
    }
    todos.append(todo)
    save_todos(todos)
    return jsonify(todo), 201

@app.route("/api/todos/<todo_id>", methods=["PUT"])
def update_todo(todo_id):
    todos = load_todos()
    for todo in todos:
        if todo["id"] == todo_id:
            data = request.get_json()
            todo["completed"] = data.get("completed", todo["completed"])
            if "title" in data:
                todo["title"] = data["title"]
            if "priority" in data:
                todo["priority"] = data["priority"]
            if "category" in data:
                todo["category"] = data["category"]
            save_todos(todos)
            return jsonify(todo)
    return jsonify({"error": "Not found"}), 404

@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    todos = load_todos()
    todos = [t for t in todos if t["id"] != todo_id]
    save_todos(todos)
    return jsonify({"message": "Deleted"})

@app.route("/api/todos/clear", methods=["DELETE"])
def clear_completed():
    todos = load_todos()
    todos = [t for t in todos if not t["completed"]]
    save_todos(todos)
    return jsonify({"message": "Cleared completed"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
