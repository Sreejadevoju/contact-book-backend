// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'contacts.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('Failed to open DB', err);
    else console.log('SQLite DB opened:', DB_PATH);
});

function init() {
    // Step 1: Create table if not exists (without created_at to avoid errors)
    const sql = `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
    )`;
    db.run(sql, (err) => {
        if (err) console.error('Error creating table:', err);
    });

    // Step 2: Check if 'created_at' exists
    db.all("PRAGMA table_info(contacts)", (err, columns) => {
        if (err) return console.error(err);
        const hasCreatedAt = columns.some(col => col.name === 'created_at');
        if (!hasCreatedAt) {
            // Add column without default
            db.run('ALTER TABLE contacts ADD COLUMN created_at DATETIME', (err) => {
                if (err) console.error('Error adding created_at column:', err);
                else {
                    console.log('created_at column added successfully');
                    // Update existing rows to have current timestamp
                    db.run('UPDATE contacts SET created_at = datetime("now") WHERE created_at IS NULL', (err) => {
                        if (err) console.error('Error setting created_at for existing rows:', err);
                        else console.log('Existing rows updated with created_at');
                    });
                }
            });
        }
    });
}

function addContact({ name, email, phone }) {
    return new Promise((resolve, reject) => {
        // Insert new contact with current timestamp
        const stmt = db.prepare('INSERT INTO contacts (name, email, phone, created_at) VALUES (?, ?, ?, datetime("now"))');
        stmt.run([name, email, phone], function (err) {
            stmt.finalize();
            if (err) return reject(err);
            resolve({ id: this.lastID, name, email, phone, created_at: new Date().toISOString() });
        });
    });
}

function getContacts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT id, name, email, phone, created_at FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?',
            [limit, offset],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
}

function getCount() {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) AS count FROM contacts', (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.count : 0);
        });
    });
}

function deleteContact(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

module.exports = { db, init, addContact, getContacts, getCount, deleteContact };
