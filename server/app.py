from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
import time
import json
import os

app = Flask(__name__)
CORS(app)

# ---------- DATABASE SETUP ----------
def get_db():
    conn = sqlite3.connect('apic.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT,
            url TEXT,
            request_headers TEXT,
            request_body TEXT,
            status INTEGER,
            response_body TEXT,
            duration REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ---------- PROXY ROUTE ----------
@app.route('/api/proxy', methods=['POST'])
def proxy():
    data = request.json
    method = data.get('method', 'GET')
    url = data.get('url')
    headers = data.get('headers', {})
    body = data.get('body', None)

    start = time.time()
    try:
        resp = requests.request(method, url, headers=headers, json=body)
        duration = round((time.time() - start) * 1000, 2)

        # Save to history
        conn = get_db()
        conn.execute('''
            INSERT INTO history (method, url, request_headers, request_body, status, response_body, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (method, url, json.dumps(headers), json.dumps(body), resp.status_code, resp.text, duration))
        conn.commit()
        conn.close()

        try:
            response_data = resp.json()
        except:
            response_data = resp.text

        return jsonify({
            'status': resp.status_code,
            'statusText': resp.reason,
            'headers': dict(resp.headers),
            'data': response_data,
            'duration': duration
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------- HISTORY ROUTES ----------
@app.route('/api/history', methods=['GET'])
def get_history():
    conn = get_db()
    rows = conn.execute('SELECT * FROM history ORDER BY timestamp DESC LIMIT 50').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/history/<int:id>', methods=['DELETE'])
def delete_one(id):
    conn = get_db()
    conn.execute('DELETE FROM history WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    conn = get_db()
    conn.execute('DELETE FROM history')
    conn.commit()
    conn.close()
    return jsonify({'success': True})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)