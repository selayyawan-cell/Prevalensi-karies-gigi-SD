const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inisialisasi database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'test',
    ssl: { rejectUnauthorized: true }
});

// Helper untuk response
const json = (data) => ({ 
    statusCode: 200, 
    headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }, 
    body: JSON.stringify(data) 
});

// API Handler
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, query, body } = req;

    try {
        // Contoh endpoint - tambahkan sesuai kebutuhan
        if (method === 'GET' && query.endpoint === 'statistik-total') {
            // ... kode statistik Anda
            return res.status(200).json({ message: 'API bekerja!' });
        }

        return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}