import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import BottomNav from './components/BottomNav';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [semuaData, setSemuaData] = useState([]);
    const [statistik, setStatistik] = useState(null);
    const [statistikPerKelas, setStatistikPerKelas] = useState([]);
    const [prevalensiData, setPrevalensiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ✅ LOGIKA TAHUN OTOMATIS (2024 s/d 2 tahun ke depan)
    const currentYr = new Date().getFullYear();
    const availableYears = [];
    for (let i = 2024; i <= currentYr + 2; i++) {
        availableYears.push(i);
    }
    const [selectedYear, setSelectedYear] = useState(currentYr.toString());

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const yearParam = (selectedYear === 'all' || !selectedYear) ? '' : `?year=${selectedYear}`;

            const [dataRes, statRes, kelasRes, prevalensiRes] = await Promise.all([
                axios.get(`${API_URL}/semua-data${yearParam}`),
                axios.get(`${API_URL}/statistik-total${yearParam}`),
                axios.get(`${API_URL}/statistik-per-kelas${yearParam}`),
                axios.get(`${API_URL}/prevalensi-karies${yearParam}`)
            ]);
            
            setSemuaData(dataRes.data || []);
            setStatistik(statRes.data || {});
            setStatistikPerKelas(kelasRes.data || []);
            setPrevalensiData(prevalensiRes.data || null);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error:', err);
            setError('Gagal mengambil data.');
            setLoading(false);
        }
    };

    const validData = semuaData.filter(d => d && d.nomor_responden);
    const totalSehat = validData.reduce((sum, d) => sum + (Number(d.jumlah_sehat) || 0), 0);
    const totalKariesBaru = validData.reduce((sum, d) => sum + (Number(d.jumlah_karies_baru) || 0), 0);
    const totalKariesLama = validData.reduce((sum, d) => sum + (Number(d.jumlah_karies_lama) || 0), 0);
    const totalGigi = totalSehat + totalKariesBaru + totalKariesLama;

    const pieChartData = statistik ? {
        labels: ['🟢 Sehat', '🔴 Karies Baru', '🟡 Karies Lama'],
        datasets: [{ data: [Number(statistik.total_sehat)||0, Number(statistik.total_karies_baru)||0, Number(statistik.total_karies_lama)||0], backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'], borderWidth: 3, borderColor: '#fff' }],
    } : null;

    const donutChartData = prevalensiData ? {
        labels: [`Siswa Karies (${prevalensiData.siswa_dengan_karies})`, `Siswa Sehat (${prevalensiData.siswa_tanpa_karies})`],
        datasets: [{ data: [prevalensiData.siswa_dengan_karies||0, prevalensiData.siswa_tanpa_karies||0], backgroundColor: ['#e74c3c', '#2ecc71'], borderWidth: 3, borderColor: '#fff' }],
    } : null;

    if (loading) return <div style={styles.container}><h2>📊 Loading...</h2></div>;
    if (error) return <div style={styles.container}><div style={styles.error}>❌ {error}</div><button onClick={fetchData} style={styles.btnRetry}>🔄 Retry</button></div>;

    return (
        <div className="container animate-slide-up" style={styles.container}>
            <header className="header" style={styles.header}>
                <h1 className="title" style={styles.title}>📊 Dashboard Prevalensi Karies Gigi</h1>
                <p className="subtitle" style={styles.subtitle}>Visualisasi Data Keseluruhan</p>
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>📅 Filter Tahun:</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)} 
                        style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', minWidth: '150px' }}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                        <option value="all">Semua Tahun</option>
                    </select>
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => window.location.href = '/ganti-password'} style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>🔒 Ganti Password</button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Yakin ingin keluar?')) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; } }} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>🚪 Logout</button>
                </div>
            </header>

            {statistik && (
                <section className="card animate-fade-in" style={styles.card}>
                    <h3 className="section-title" style={styles.sectionTitle}>📈 Statistik Keseluruhan (Tahun {selectedYear === 'all' ? 'Semua' : selectedYear})</h3>
                    <div className="stats-grid" style={styles.statsGrid}>
                        <div style={{...styles.statBox, backgroundColor: '#667eea', color: 'white'}}><div style={styles.statLabel}>👥 Total Responden</div><div style={styles.statValue}>{Number(statistik.total_responden) || 0}</div></div>
                        <div style={{...styles.statBox, backgroundColor: '#2ecc71', color: 'white'}}><div style={styles.statLabel}>🦷 Gigi Sehat</div><div style={styles.statValue}>{Number(statistik.total_sehat) || 0}</div></div>
                        <div style={{...styles.statBox, backgroundColor: '#e74c3c', color: 'white'}}><div style={styles.statLabel}>⚠️ Karies Baru</div><div style={styles.statValue}>{Number(statistik.total_karies_baru) || 0}</div></div>
                        <div style={{...styles.statBox, backgroundColor: '#f39c12', color: 'white'}}><div style={styles.statLabel}>🕐 Karies Lama</div><div style={styles.statValue}>{Number(statistik.total_karies_lama) || 0}</div></div>
                    </div>
                </section>
            )}

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>🥧 Distribusi Kondisi Gigi</h3>
                {pieChartData && <div className="chart-wrapper" style={styles.chartWrapper}><Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>}
            </section>

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>🍩 Prevalensi Karies (Standar WHO)</h3>
                {prevalensiData && donutChartData && (
                    <>
                        <div className="chart-wrapper" style={styles.chartWrapper}><Doughnut data={donutChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3', textAlign: 'center' }}>
                            <strong style={{color: '#0d47a1', fontSize: '18px'}}>Prevalensi Karies: {prevalensiData.prevalensi_karies}%</strong>
                            <p style={{margin: '5px 0 0 0', color: '#555', fontSize: '14px'}}>dari total {prevalensiData.total_siswa} siswa yang diperiksa</p>
                        </div>
                    </>
                )}
            </section>

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📊 Statistik Per Kelas</h3>
                {statistikPerKelas.length === 0 ? <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>Belum ada data</p> : (
                    <div className="table-container" style={styles.tableContainer}>
                        <table className="table" style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Kelas</th><th>Total Siswa</th><th style={{color: '#2ecc71'}}>🟢 Sehat (%)</th><th style={{color: '#e74c3c'}}>🔴 Baru (%)</th><th style={{color: '#f39c12'}}>🟡 Lama (%)</th><th style={{color: '#667eea'}}>📈 Prevalensi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistikPerKelas.map((kelas, index) => (
                                    <tr key={index} style={index % 2 === 0 ? {backgroundColor: '#f8f9fa'} : {}}>
                                        <td style={{...styles.tableCell, fontWeight: 'bold', color: '#667eea'}}>{kelas.kelas}</td>
                                        <td style={styles.tableCenter}>{kelas.total_responden}</td>
                                        <td style={{...styles.tableCenter, color: '#2ecc71', fontWeight: 'bold'}}>{kelas.persen_sehat}%</td>
                                        <td style={{...styles.tableCenter, color: '#e74c3c', fontWeight: 'bold'}}>{kelas.persen_karies_baru}%</td>
                                        <td style={{...styles.tableCenter, color: '#f39c12', fontWeight: 'bold'}}>{kelas.persen_karies_lama}%</td>
                                        <td style={styles.tableCenter}>
                                            <span style={{ padding: '5px 10px', borderRadius: '15px', color: 'white', fontWeight: 'bold', fontSize: '12px', backgroundColor: Number(kelas.prevalensi_karies) > 60 ? '#e74c3c' : Number(kelas.prevalensi_karies) > 40 ? '#e67e22' : Number(kelas.prevalensi_karies) > 20 ? '#f39c12' : '#2ecc71' }}>
                                                {kelas.prevalensi_karies}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📋 Daftar Semua Responden (Dikelompokkan per Kelas)</h3>
                {validData.length === 0 ? <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>Belum ada data</p> : (
                    <>
                        {(() => {
                            const groupedByKelas = validData.reduce((acc, data) => {
                                const kelas = data.kelas || 'Tanpa Kelas';
                                if (!acc[kelas]) acc[kelas] = [];
                                acc[kelas].push(data);
                                return acc;
                            }, {});
                            const sortedKelas = Object.keys(groupedByKelas).sort();
                            return sortedKelas.map((kelas, kelasIndex) => {
                                const dataKelas = groupedByKelas[kelas];
                                const totalSehatKelas = dataKelas.reduce((sum, d) => sum + (Number(d.jumlah_sehat) || 0), 0);
                                const totalBaruKelas = dataKelas.reduce((sum, d) => sum + (Number(d.jumlah_karies_baru) || 0), 0);
                                const totalLamaKelas = dataKelas.reduce((sum, d) => sum + (Number(d.jumlah_karies_lama) || 0), 0);
                                const totalGigiKelas = totalSehatKelas + totalBaruKelas + totalLamaKelas;
                                return (
                                    <div key={kelasIndex} style={{marginBottom: '30px'}}>
                                        <div style={{ backgroundColor: '#667eea', color: 'white', padding: '12px 20px', borderRadius: '8px 8px 0 0', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>🏫 Kelas {kelas}</span>
                                            <span style={{fontSize: '14px', opacity: 0.9}}>({dataKelas.length} responden | {totalGigiKelas} gigi)</span>
                                        </div>
                                        <div className="table-container" style={styles.tableContainer}>
                                            <table className="table" style={styles.table}>
                                                <thead>
                                                    <tr><th style={{width: '5%'}}>No</th><th style={{width: '10%'}}>Tanggal</th><th style={{width: '15%'}}>No. Responden</th><th style={{width: '8%'}}>Umur</th><th style={{width: '10%'}}>Gol. Darah</th><th style={{width: '10%'}}>🟢 Sehat</th><th style={{width: '10%'}}>🔴 Baru</th><th style={{width: '10%'}}>🟡 Lama</th><th style={{width: '8%'}}>Total</th></tr>
                                                </thead>
                                                <tbody>
                                                    {dataKelas.map((data, index) => {
                                                        let tanggalStr = '-';
                                                        try { if (data.tanggal_pemeriksaan) tanggalStr = new Date(data.tanggal_pemeriksaan).toLocaleDateString('id-ID'); } catch (e) {}
                                                        const totalPerResponden = (Number(data.jumlah_sehat) || 0) + (Number(data.jumlah_karies_baru) || 0) + (Number(data.jumlah_karies_lama) || 0);
                                                        return (
                                                            <tr key={index} style={index % 2 === 0 ? {backgroundColor: '#f8f9fa'} : {}}>
                                                                <td style={styles.tableCell}>{index + 1}</td>
                                                                <td style={styles.tableCell}>{tanggalStr}</td>
                                                                <td style={{...styles.tableCell, fontWeight: 'bold', color: '#667eea'}}>{String(data.nomor_responden || '-')}</td>
                                                                <td style={styles.tableCell}>{data.umur ? `${data.umur} th` : '-'}</td>
                                                                <td style={styles.tableCell}>{String(data.golongan_darah || '-')}</td>
                                                                <td style={styles.sehat}>{Number(data.jumlah_sehat) || 0}</td>
                                                                <td style={styles.kariesBaru}>{Number(data.jumlah_karies_baru) || 0}</td>
                                                                <td style={styles.kariesLama}>{Number(data.jumlah_karies_lama) || 0}</td>
                                                                <td style={{...styles.tableCell, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f0f4ff'}}>{totalPerResponden}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr style={{ backgroundColor: '#e8f0fe', fontWeight: 'bold', borderTop: '2px solid #667eea' }}>
                                                        <td colSpan="5" style={{...styles.tableCell, textAlign: 'right', color: '#667eea'}}>TOTAL KELAS {kelas}:</td>
                                                        <td style={{...styles.tableCell, textAlign: 'center', color: '#2ecc71'}}>{totalSehatKelas}</td>
                                                        <td style={{...styles.tableCell, textAlign: 'center', color: '#e74c3c'}}>{totalBaruKelas}</td>
                                                        <td style={{...styles.tableCell, textAlign: 'center', color: '#f39c12'}}>{totalLamaKelas}</td>
                                                        <td style={{...styles.tableCell, textAlign: 'center', color: '#667eea', backgroundColor: '#d0e0ff'}}>{totalGigiKelas}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                        <div style={{ backgroundColor: '#667eea', color: 'white', padding: '15px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                            <span>📊 GRAND TOTAL SEMUA KELAS</span>
                            <span style={{fontSize: '14px'}}>{validData.length} responden | {totalGigi} gigi</span>
                        </div>
                    </>
                )}
            </section>

            <div className="footer" style={styles.footer}>
                <button className="btn-kembali" style={{...styles.btnKembali, marginRight: '10px'}} onClick={() => window.location.href = '/dashboard2'}>📊 Dashboard Distribusi →</button>
                <button className="btn-kembali" style={styles.btnKembali} onClick={() => window.location.href = 'http://localhost:5173'}>← Kembali ke Form Input</button>
            </div>
            <BottomNav />
        </div>
    );
};

const styles = {
    container: { fontFamily: 'var(--font-primary)', padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'var(--bg-light)', minHeight: '100vh' },
    header: { textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 'var(--radius-lg)', marginBottom: '20px', color: 'white' },
    title: { margin: '0 0 5px 0', fontSize: '2rem' },
    subtitle: { margin: 0, opacity: 0.9, fontSize: '1rem' },
    error: { padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    btnRetry: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginBottom: '20px' },
    sectionTitle: { margin: '0 0 20px 0', color: 'var(--text-dark)', borderBottom: '2px solid #667eea', paddingBottom: '10px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' },
    statBox: { padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '13px', marginBottom: '8px', opacity: 0.9, fontWeight: '500' },
    statValue: { fontSize: '28px', fontWeight: 'bold' },
    chartWrapper: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    tableCell: { padding: '12px', textAlign: 'left' },
    tableCenter: { textAlign: 'center', padding: '12px' },
    sehat: { backgroundColor: '#d4edda', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#2ecc71' },
    kariesBaru: { backgroundColor: '#f8d7da', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#e74c3c' },
    kariesLama: { backgroundColor: '#fff3cd', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#f39c12' },
    footer: { textAlign: 'center', padding: '20px' },
    btnKembali: { padding: '12px 30px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Dashboard;