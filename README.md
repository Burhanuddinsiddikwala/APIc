

# APIc — API Client

A lightweight, beautiful API testing tool built with React and Flask. Test your APIs directly from the browser — no downloads, no bloat.

## Features

- **Send requests** — GET, POST, PUT, PATCH, DELETE

- **Custom headers** — add/remove key-value pairs

- **Request body** — JSON editor with format button

- **Response viewer** — syntax highlighted JSON with line numbers

- **History** — every request saved automatically with search, replay and delete

- **Dark/Light mode** — smooth theme toggle

## Tech Stack

**Frontend:** React + Vite + Tailwind CSS + Axios  

**Backend:** Flask + SQLite + Flask-CORS

## Live Demo

https://apic-chi.vercel.app

## Local Development

**Backend**

cd server

python3 -m venv venv

source venv/bin/activate

pip install flask flask-cors requests

python3 app.py

**Frontend**

cd client

npm install

npm run dev

Create client/.env:

VITE_API_URL=http://127.0.0.1:5000

## Deployment

- Frontend → Vercel

- Backend → Render

## License

MIT