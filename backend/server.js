const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'kunci_rahasia_karies_gigi_2026';
require('dotenv').config();

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Pool (Lebih stabil untuk Vercel Serverless)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'test',
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi untuk Pool (Bukan db.connect)
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal koneksi ke MySQL:', err.message);
    } else {
        console.log('✅ TERHUBUNG KE MYSQL (POOL)');
        connection.release(); // Kembalikan koneksi ke pool setelah dites
    }
});

// Middleware Auth
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Akses ditolak.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid.' });
    }
};

// --- AUTH ENDPOINTS ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    db.query(`SELECT * FROM users WHERE username = ?`, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Username tidak ditemukan!' });
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Password salah!' });
        const token = jwt.sign({ id: user.id_user, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: 'Login berhasil!', token, user: { username: user.username, nama: user.nama_lengkap, role: user.role } });
    });
});

app.post('/api/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const username = req.user.username;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const user = results[0];
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) return res.status(401).json({ message: 'Password lama salah!' });
        const newHash = await bcrypt.hash(newPassword, 10);
        db.query('UPDATE users SET password = ? WHERE username = ?', [newHash, username], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '✅ Password berhasil diubah!' });
        });
    });
});

app.get('/api/reset-admin', async (req, res) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.query(`SELECT * FROM users WHERE username = 'admin'`, (err, results) => {
        if (results.length > 0) {
            db.query(`UPDATE users SET password = ? WHERE username = 'admin'`, [hashedPassword], () => res.json({ message: 'Reset berhasil' }));
        } else {
            db.query(`INSERT INTO users (username, password, nama_lengkap, role) VALUES ('admin', ?, 'Super Admin', 'admin')`, [hashedPassword], () => res.json({ message: 'Admin dibuat' }));
        }
    });
});

// --- DATA ENDPOINTS (DENGAN FILTER TAHUN) ---
app.post('/api/simpan-data', verifyToken, (req, res) => {
    const { responden, gigiList } = req.body;
    if (!responden.nomor || !gigiList || gigiList.length === 0) return res.status(400).json({ message: 'Data tidak lengkap' });
    
    const waktuSikat = responden.waktu_sikat === 'Lainnya' ? responden.waktu_sikat_lainnya : responden.waktu_sikat;

    const sqlResponden = `INSERT INTO responden (nomor_responden, umur, kelas, golongan_darah, frekuensi_sikat_gigi, waktu_sikat_gigi) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sqlResponden, [responden.nomor, responden.umur, responden.kelas, responden.golongan_darah, responden.frekuensi_sikat, waktuSikat], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const idResponden = result.insertId;
        const sqlPemeriksaan = `INSERT INTO pemeriksaan (id_responden, tanggal_pemeriksaan, jumlah_gigi, jumlah_sehat, jumlah_karies_baru, jumlah_karies_lama, jumlah_kode3) VALUES (?, NOW(), ?, ?, ?, ?, ?)`;
        
        const totalGigi = gigiList.length;
        const sehat = gigiList.filter(g => g.kondisi === '0').length;
        const kariesBaru = gigiList.filter(g => g.kondisi === '1').length;
        const kariesLama = gigiList.filter(g => g.kondisi === '2').length;
        const kode3 = gigiList.filter(g => g.kondisi === '3').length;
        
        db.query(sqlPemeriksaan, [idResponden, totalGigi, sehat, kariesBaru, kariesLama, kode3], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const idPemeriksaan = result.insertId;
            const sqlKondisi = `INSERT INTO kondisi_gigi (id_pemeriksaan, kode_gigi, kondisi) VALUES ?`;
            const values = gigiList.map(g => [idPemeriksaan, g.kode, g.kondisi]);
            db.query(sqlKondisi, [values], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Data berhasil disimpan!', id_responden: idResponden });
            });
        });
    });
});

app.get('/api/semua-data', (req, res) => {
    const { year } = req.query;
    const yearCondition = year && year !== 'all' ? `AND YEAR(p.tanggal_pemeriksaan) = '${year}'` : '';
    const sql = `SELECT r.id_responden, r.nomor_responden, r.umur, r.kelas, r.golongan_darah, r.frekuensi_sikat_gigi, r.waktu_sikat_gigi, p.jumlah_sehat, p.jumlah_karies_baru, p.jumlah_karies_lama, p.jumlah_kode3, p.tanggal_pemeriksaan FROM responden r LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden WHERE 1=1 ${yearCondition} ORDER BY p.tanggal_pemeriksaan DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/statistik-total', (req, res) => {
    const { year } = req.query;
    
    // ✅ LOG DEBUG: Kita akan lihat ini di terminal VS Code
    console.log(' PARAMETER TAHUN DARI URL:', year);
    
    const yearCondition = year && year !== 'all' ? `AND YEAR(p.tanggal_pemeriksaan) = '${year}'` : '';
    
    // ✅ LOG DEBUG: Kita akan lihat ini di terminal VS Code
    console.log('🔍 KONDISI SQL YANG DIBUAT:', yearCondition);

    const sql = `
        SELECT 
            COUNT(DISTINCT r.id_responden) as total_responden,
            SUM(p.jumlah_sehat) as total_sehat,
            SUM(p.jumlah_karies_baru) as total_karies_baru,
            SUM(p.jumlah_karies_lama) as total_karies_lama,
            SUM(p.jumlah_kode3) as total_kode3,
            SUM(p.jumlah_sehat) + SUM(p.jumlah_karies_baru) + SUM(p.jumlah_karies_lama) as total_gigi_diperiksa,
            AVG(r.umur) as rata_rata_umur
        FROM responden r
        LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden
        WHERE 1=1 ${yearCondition}
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

app.get('/api/statistik-per-kelas', (req, res) => {
    const { year } = req.query;
    const yearCondition = year && year !== 'all' ? `AND YEAR(p.tanggal_pemeriksaan) = '${year}'` : '';
    const sql = `SELECT r.kelas, COUNT(DISTINCT r.id_responden) as total_responden, SUM(p.jumlah_sehat) as total_sehat, SUM(p.jumlah_karies_baru) as total_karies_baru, SUM(p.jumlah_karies_lama) as total_karies_lama, SUM(p.jumlah_sehat) + SUM(p.jumlah_karies_baru) + SUM(p.jumlah_karies_lama) as total_gigi, AVG(r.umur) as rata_rata_umur, SUM(CASE WHEN (p.jumlah_karies_baru > 0 OR p.jumlah_karies_lama > 0) THEN 1 ELSE 0 END) as siswa_dengan_karies FROM responden r LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden WHERE 1=1 ${yearCondition} GROUP BY r.kelas ORDER BY r.kelas`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formattedResults = results.map(kelas => {
            const totalGigi = Number(kelas.total_gigi) || 1;
            const totalResponden = Number(kelas.total_responden) || 1;
            const totalSehat = Number(kelas.total_sehat) || 0;
            const totalKariesBaru = Number(kelas.total_karies_baru) || 0;
            const totalKariesLama = Number(kelas.total_karies_lama) || 0;
            const siswaDenganKaries = Number(kelas.siswa_dengan_karies) || 0;
            return {
                kelas: kelas.kelas,
                total_responden: totalResponden,
                total_sehat: totalSehat,
                total_karies_baru: totalKariesBaru,
                total_karies_lama: totalKariesLama,
                total_gigi: totalGigi,
                siswa_dengan_karies: siswaDenganKaries,
                persen_sehat: ((totalSehat / totalGigi) * 100).toFixed(2),
                persen_karies_baru: ((totalKariesBaru / totalGigi) * 100).toFixed(2),
                persen_karies_lama: ((totalKariesLama / totalGigi) * 100).toFixed(2),
                prevalensi_karies: ((siswaDenganKaries / totalResponden) * 100).toFixed(2),
                rata_rata_umur: Number(kelas.rata_rata_umur).toFixed(1)
            };
        });
        res.json(formattedResults);
    });
});

app.get('/api/prevalensi-karies', (req, res) => {
    const { year } = req.query;
    const yearCondition = year && year !== 'all' ? `AND YEAR(p.tanggal_pemeriksaan) = '${year}'` : '';
    const sqlTotal = `SELECT COUNT(DISTINCT r.id_responden) as total FROM responden r LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden WHERE 1=1 ${yearCondition}`;
    db.query(sqlTotal, (err, totalResult) => {
        if (err) return res.status(500).json({ error: err.message });
        const totalSiswa = Number(totalResult[0]?.total) || 0;
        const sqlKaries = `SELECT COUNT(DISTINCT r.id_responden) as siswa_karies FROM responden r LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden WHERE 1=1 ${yearCondition} AND (p.jumlah_karies_baru > 0 OR p.jumlah_karies_lama > 0)`;
        db.query(sqlKaries, (err, kariesResult) => {
            if (err) return res.status(500).json({ error: err.message });
            const siswaKaries = Number(kariesResult[0]?.siswa_karies) || 0;
            res.json({
                total_siswa: totalSiswa,
                siswa_dengan_karies: siswaKaries,
                siswa_tanpa_karies: totalSiswa - siswaKaries,
                prevalensi_karies: totalSiswa > 0 ? ((siswaKaries / totalSiswa) * 100).toFixed(2) : 0,
                persen_sehat: totalSiswa > 0 ? (((totalSiswa - siswaKaries) / totalSiswa) * 100).toFixed(2) : 0
            });
        });
    });
});

app.get('/api/detail-responden/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT r.id_responden, r.nomor_responden, r.umur, r.kelas, r.golongan_darah, r.frekuensi_sikat_gigi, r.waktu_sikat_gigi, p.id_pemeriksaan, p.jumlah_sehat, p.jumlah_karies_baru, p.jumlah_karies_lama, p.jumlah_kode3, p.tanggal_pemeriksaan FROM responden r LEFT JOIN pemeriksaan p ON r.id_responden = p.id_responden WHERE r.id_responden = ? ORDER BY p.tanggal_pemeriksaan DESC LIMIT 1`;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Tidak ditemukan' });
        const responden = results[0];
        const sehat = Number(responden.jumlah_sehat) || 0;
        const kariesBaru = Number(responden.jumlah_karies_baru) || 0;
        const kariesLama = Number(responden.jumlah_karies_lama) || 0;
        const kode3 = Number(responden.jumlah_kode3) || 0;
        const totalUntukPersen = sehat + kariesBaru + kariesLama;
        
        db.query(`SELECT kode_gigi, kondisi FROM kondisi_gigi WHERE id_pemeriksaan = ? ORDER BY kode_gigi`, [responden.id_pemeriksaan], (err, gigiResults) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...responden, sehat, karies_baru: kariesBaru, karies_lama: kariesLama, kode3, total: totalUntukPersen + kode3, total_untuk_persen: totalUntukPersen, detail_gigi: gigiResults });
        });
    });
});

   // Jalankan server hanya jika di laptop lokal (bukan di Vercel)
   if (process.env.NODE_ENV !== 'production') {
       app.listen(PORT, '0.0.0.0', () => {
           console.log(` Server berjalan di http://localhost:${PORT}`);
       });
   }

   // Export aplikasi agar bisa dibaca oleh Vercel (Serverless)
   module.exports = app;