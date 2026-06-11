# To-Do App — Docker Setup

## Quick Start (Docker Compose — Recommended)

```bash
# 1. Build and start
docker compose up --build

# 2. Open browser
http://localhost:5000
```

## Manual Docker Commands

```bash
# Build the image
docker build -t todo-app .

# Run the container
docker run -d -p 5000:5000 --name todo_app todo-app

# View logs
docker logs todo_app

# Stop
docker stop todo_app

# Remove
docker rm todo_app
```

## File Structure

```
todo-app/
├── app.py                  # Flask backend (REST API)
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── todos.json              # Auto-created at runtime
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/app.js
```

## API Endpoints

| Method | URL                      | Description         |
|--------|--------------------------|---------------------|
| GET    | /api/todos               | Get all todos       |
| POST   | /api/todos               | Add a new todo      |
| PUT    | /api/todos/<id>          | Update a todo       |
| DELETE | /api/todos/<id>          | Delete a todo       |
| DELETE | /api/todos/clear         | Clear completed     |
