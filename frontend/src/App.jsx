import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import BottomNav from './components/BottomNav';

const App = () => {
    const [responden, setResponden] = useState({ 
    nomor: '', 
    umur: '', 
    kelas: 'IV A', 
    golongan_darah: 'O',
    frekuensi_sikat: '2',       // Default 2x
    waktu_sikat: 'Pagi & Malam', // Default
    kebiasaan_makan: 'Seimbang'  // Default
});
    const [gigiList, setGigiList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pesan, setPesan] = useState({ text: '', type: '' });

    const gigiAtas = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
    const gigiBawah = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];

    const handleRespondenChange = (e) => setResponden({...responden, [e.target.name]: e.target.value});
    
    const handleGigiChange = (kode, nilai) => {
        setGigiList(prev => {
            const existing = prev.find(g => g.kode === kode);
            if (existing) return prev.map(g => g.kode === kode ? {...g, kondisi: nilai} : g);
            return [...prev, {kode, kondisi: nilai}];
        });
    };

    // ✅ FUNGSI UNTUK MENDAPATKAN WARNA BERDASARKAN KODE
    const getKondisiColor = (kondisi) => {
        switch(kondisi) {
            case '0': return { bg: '#d4edda', color: '#2ecc71', border: '#27ae60' };  // Hijau - Sehat
            case '1': return { bg: '#f8d7da', color: '#e74c3c', border: '#c0392b' };  // Merah - Karies Baru
            case '2': return { bg: '#fff3cd', color: '#f39c12', border: '#d35400' };  // Orange - Karies Lama
            case '3': return { bg: '#e2e3e5', color: '#95a5a6', border: '#7f8c8d' };  // Abu - Lainnya
            default: return { bg: '#f8f9fa', color: '#999', border: '#ddd' };          // Default
        }
    };

    const simpanData = async () => {
        if (!responden.nomor || !responden.umur || gigiList.length < 28) {
            setPesan({text: '⚠️ Lengkapi semua data!', type: 'error'});
            return;
        }
        
        setLoading(true);
        try {
            await axios.post(`${API_URL}/simpan-data`, {responden, gigiList});
            setPesan({text: '✅ Data berhasil disimpan!', type: 'success'});
            setResponden({nomor: '', umur: '', kelas: 'IV A', golongan_darah: 'O'});
            setGigiList([]);
        } catch (err) {
            setPesan({text: '❌ Gagal: ' + err.message, type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { fontFamily: 'var(--font-primary)', padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'var(--bg-light)', minHeight: '100vh' },
        header: { textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #1abc9c 0%, #2ecc71 100%)', borderRadius: 'var(--radius-lg)', marginBottom: '20px', color: 'white' },
        title: { margin: '0 0 8px 0', fontSize: '2rem' },
        subtitle: { margin: 0, opacity: 0.95, fontSize: '1rem' },
        btnDashboard: { marginTop: '20px', padding: '14px 32px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-full)', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
        card: { backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginBottom: '20px' },
        sectionTitle: { margin: '0 0 20px 0', color: 'var(--text-dark)', fontSize: '1.3rem', fontWeight: '600', borderBottom: '2px solid var(--bg-light)', paddingBottom: '12px' },
        formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' },
        formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
        formLabel: { fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)' },
        input: { padding: '14px 16px', border: '2px solid #e8e8e8', borderRadius: 'var(--radius-sm)', fontSize: '14px', backgroundColor: 'white' },
        legend: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', padding: '12px 16px', backgroundColor: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' },
        legendItem: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '12px', fontWeight: '600' },
        odontogramContainer: { display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' },
        jawSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px', border: '2px solid var(--turquoise)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(26, 188, 156, 0.05)' },
        jawLabel: { fontWeight: '600', color: 'var(--turquoise)', fontSize: '14px', textTransform: 'uppercase' },
        toothRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
        toothCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '52px', gap: '6px' },
        toothNumber: { fontWeight: '600', fontSize: '11px', color: 'var(--text-dark)', backgroundColor: 'var(--bg-light)', padding: '4px 8px', borderRadius: '6px', minWidth: '32px', textAlign: 'center' },
        select: { padding: '8px 4px', borderRadius: '8px', border: '2px solid #ddd', width: '100%', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' },
        actionBar: { textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginBottom: '24px' },
        btnSimpan: { background: 'linear-gradient(135deg, #1abc9c 0%, #2ecc71 100%)', color: 'white', padding: '16px 48px', fontSize: '16px', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: '600' },
        hint: { marginTop: '12px', fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' },
        alert: { padding: '16px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontWeight: '500' },
        footer: { textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: '13px', borderTop: '1px solid var(--bg-light)', marginTop: '40px' }
    };

    return (
        <div className="container animate-slide-up" style={styles.container}>
            <header className="header" style={styles.header}>
                <h1 style={styles.title}>🦷 Pemeriksaan Karies Gigi Anak SD</h1>
                <p style={styles.subtitle}>Sistem Prevalensi Karies - Mode Landscape</p>
                <button className="btn-dashboard" style={styles.btnDashboard} onClick={() => window.location.href = '/dashboard'}>📊 Lihat Dashboard</button>
            </header>

            {pesan.text && (
                <div style={{
                    ...styles.alert, 
                    backgroundColor: pesan.type === 'success' ? '#d4edda' : '#f8d7da', 
                    color: pesan.type === 'success' ? '#155724' : '#721c24',
                    borderLeft: `4px solid ${pesan.type === 'success' ? '#2ecc71' : '#e74c3c'}`
                }}>
                    {pesan.text}
                </div>
            )}

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📋 Data Responden</h3>
                <div className="form-grid" style={styles.formGrid}>
                    <div style={styles.formGroup}>
    <label className="form-label">Frekuensi Sikat Gigi / Hari</label>
    <select className="select" style={styles.input} name="frekuensi_sikat" value={responden.frekuensi_sikat} onChange={handleRespondenChange}>
        <option value="1">1 Kali</option>
        <option value="2">2 Kali</option>
        <option value="3">3 Kali</option>
        <option value="Lebih dari 3">Lebih dari 3 Kali</option>
    </select>
</div>

<div style={styles.formGroup}>
    <label className="form-label">Waktu Menyikat Gigi</label>
    <select className="select" style={styles.input} name="waktu_sikat" value={responden.waktu_sikat} onChange={handleRespondenChange}>
        <option value="Pagi saja">Pagi Saja</option>
        <option value="Malam saja">Malam Saja</option>
        <option value="Pagi & Malam">Pagi & Malam</option>
        <option value="Setelah Makan">Setiap Setelah Makan</option>
    </select>
</div>

<div style={styles.formGroup}>
    <label className="form-label">Kebiasaan Makan</label>
    <select className="select" style={styles.input} name="kebiasaan_makan" value={responden.kebiasaan_makan} onChange={handleRespondenChange}>
        <option value="Seimbang">Seimbang</option>
        <option value="Suka Manis">Suka Makanan Manis</option>
        <option value="Suka Asam">Suka Makanan Asam</option>
        <option value="Suka Ngemil">Suka Ngemil</option>
    </select>
</div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Nomor Responden *</label>
                        <input 
                            className="input"
                            style={styles.input} 
                            name="nomor" 
                            value={responden.nomor} 
                            onChange={handleRespondenChange} 
                            placeholder="Contoh: SD-001" 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Umur (tahun) *</label>
                        <input 
                            className="input"
                            style={styles.input} 
                            type="number" 
                            name="umur" 
                            value={responden.umur} 
                            onChange={handleRespondenChange} 
                            placeholder="Contoh: 10" 
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Kelas</label>
                        <select 
                            className="select"
                            style={styles.input} 
                            name="kelas" 
                            value={responden.kelas} 
                            onChange={handleRespondenChange}
                        >
                            <option>IV A</option>
                            <option>IV B</option>
                            <option>IV C</option>
                        </select>
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Golongan Darah</label>
                        <select 
                            className="select"
                            style={styles.input} 
                            name="golongan_darah" 
                            value={responden.golongan_darah} 
                            onChange={handleRespondenChange}
                        >
                            <option>O</option>
                            <option>A</option>
                            <option>B</option>
                            <option>AB</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>🦷 Tabel Pemeriksaan Odontogram</h3>
                
                {/* Legend dengan warna */}
                <div style={styles.legend}>
                    <div style={{...styles.legendItem, backgroundColor: '#2ecc71', border: '2px solid #27ae60'}}>
                        <span>●</span> 0 = Sehat
                    </div>
                    <div style={{...styles.legendItem, backgroundColor: '#e74c3c', border: '2px solid #c0392b'}}>
                        <span>●</span> 1 = Karies Baru
                    </div>
                    <div style={{...styles.legendItem, backgroundColor: '#f39c12', border: '2px solid #d35400'}}>
                        <span>●</span> 2 = Karies Lama
                    </div>
                    <div style={{...styles.legendItem, backgroundColor: '#95a5a6', border: '2px solid #7f8c8d'}}>
                        <span>●</span> 3 = Lainnya
                    </div>
                </div>

                <div className="odontogram-container" style={styles.odontogramContainer}>
                    {/* GIGI ATAS */}
                    <div className="jaw-section" style={styles.jawSection}>
                        <span className="jaw-label" style={styles.jawLabel}>🦷 Gigi Atas (Maxilla)</span>
                        <div className="tooth-row" style={styles.toothRow}>
                            {gigiAtas.map(kode => {
                                const kondisi = gigiList.find(g => g.kode === kode)?.kondisi || '';
                                const color = getKondisiColor(kondisi);
                                
                                return (
                                    <div className="tooth-cell" key={kode} style={styles.toothCell}>
                                        <span className="tooth-number" style={styles.toothNumber}>{kode}</span>
                                        <select 
                                            className="select"
                                            style={{
                                                ...styles.select,
                                                backgroundColor: color.bg,
                                                color: color.color,
                                                borderColor: color.border,
                                                fontWeight: kondisi ? '700' : '500'
                                            }} 
                                            value={kondisi} 
                                            onChange={(e) => handleGigiChange(kode, e.target.value)}
                                        >
                                            <option value="">-</option>
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* GIGI BAWAH */}
                    <div className="jaw-section" style={styles.jawSection}>
                        <span className="jaw-label" style={styles.jawLabel}>🦷 Gigi Bawah (Mandibula)</span>
                        <div className="tooth-row" style={styles.toothRow}>
                            {gigiBawah.map(kode => {
                                const kondisi = gigiList.find(g => g.kode === kode)?.kondisi || '';
                                const color = getKondisiColor(kondisi);
                                
                                return (
                                    <div className="tooth-cell" key={kode} style={styles.toothCell}>
                                        <span className="tooth-number" style={styles.toothNumber}>{kode}</span>
                                        <select 
                                            className="select"
                                            style={{
                                                ...styles.select,
                                                backgroundColor: color.bg,
                                                color: color.color,
                                                borderColor: color.border,
                                                fontWeight: kondisi ? '700' : '500'
                                            }} 
                                            value={kondisi} 
                                            onChange={(e) => handleGigiChange(kode, e.target.value)}
                                        >
                                            <option value="">-</option>
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Summary Count */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📊 Ringkasan Sementara</h3>
                <div className="stats-grid" style={styles.statsGrid}>
                    <div style={{...styles.statBox, backgroundColor: '#d4edda', color: '#2ecc71', border: '2px solid #27ae60'}}>
                        <div style={styles.statLabel}>🟢 Sehat (0)</div>
                        <div style={{...styles.statValue, fontSize: '24px'}}>{gigiList.filter(g => g.kondisi === '0').length}</div>
                    </div>
                    <div style={{...styles.statBox, backgroundColor: '#f8d7da', color: '#e74c3c', border: '2px solid #c0392b'}}>
                        <div style={styles.statLabel}>🔴 Karies Baru (1)</div>
                        <div style={{...styles.statValue, fontSize: '24px'}}>{gigiList.filter(g => g.kondisi === '1').length}</div>
                    </div>
                    <div style={{...styles.statBox, backgroundColor: '#fff3cd', color: '#f39c12', border: '2px solid #d35400'}}>
                        <div style={styles.statLabel}>🟡 Karies Lama (2)</div>
                        <div style={{...styles.statValue, fontSize: '24px'}}>{gigiList.filter(g => g.kondisi === '2').length}</div>
                    </div>
                    <div style={{...styles.statBox, backgroundColor: '#e2e3e5', color: '#95a5a6', border: '2px solid #7f8c8d'}}>
                        <div style={styles.statLabel}>⚪ Lainnya (3)</div>
                        <div style={{...styles.statValue, fontSize: '24px'}}>{gigiList.filter(g => g.kondisi === '3').length}</div>
                    </div>
                    <div style={{...styles.statBox, backgroundColor: '#667eea', color: 'white', border: '2px solid #5a67d8'}}>
                        <div style={styles.statLabel}>📊 Total Terisi</div>
                        <div style={{...styles.statValue, fontSize: '24px'}}>{gigiList.length}/32</div>
                    </div>
                </div>
            </section>

            <div className="card animate-fade-in" style={styles.actionBar}>
                <button 
                    className="btn-simpan"
                    style={{
                        ...styles.btnSimpan,
                        opacity: loading || gigiList.length < 32 ? 0.7 : 1,
                        cursor: loading || gigiList.length < 32 ? 'not-allowed' : 'pointer'
                    }} 
                    onClick={simpanData} 
                    disabled={loading || gigiList.length < 32}
                >
                    {loading ? '⏳ Menyimpan...' : '💾 SIMPAN DATA & HITUNG'}
                </button>
                <p style={styles.hint}>* Semua 32 gigi wajib diisi sebelum menyimpan</p>
            </div>

            <footer className="footer" style={styles.footer}>
                <p>Sistem Prevalensi Karies Gigi Anak SD © 2026</p>
            </footer>

            <BottomNav />
        </div>
    );
};

// Tambahkan styles untuk statsGrid dan statBox
const additionalStyles = {
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
    statBox: { padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '13px', marginBottom: '8px', opacity: 0.9, fontWeight: '500' },
    statValue: { fontSize: '28px', fontWeight: 'bold' }
};

// Merge styles
Object.assign(App, { additionalStyles });

export default App;