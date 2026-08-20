import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PublicDashboard = () => {
    const [statistik, setStatistik] = useState(null);
    const [statistikPerKelas, setStatistikPerKelas] = useState([]);
    const [prevalensiData, setPrevalensiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [statRes, kelasRes, prevalensiRes] = await Promise.all([
                axios.get(`${API_URL}/statistik-total`),
                axios.get(`${API_URL}/statistik-per-kelas`),
                axios.get(`${API_URL}/prevalensi-karies`)
            ]);
            
            setStatistik(statRes.data || {});
            setStatistikPerKelas(kelasRes.data || []);
            setPrevalensiData(prevalensiRes.data || null);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error fetching data:', err);
            setError('Gagal mengambil data: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Data Pie Chart
    const pieChartData = statistik ? {
        labels: ['🟢 Sehat', '🔴 Karies Baru', '🟡 Karies Lama'],
        datasets: [{
            data: [
                Number(statistik.total_sehat) || 0,
                Number(statistik.total_karies_baru) || 0,
                Number(statistik.total_karies_lama) || 0
            ],
            backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
            borderWidth: 3,
            borderColor: '#fff'
        }],
    } : null;

    // Data Donut Chart (Prevalensi)
    const donutChartData = prevalensiData ? {
        labels: [
            `Siswa dengan Karies (${prevalensiData.siswa_dengan_karies} orang)`,
            `Siswa Sehat (${prevalensiData.siswa_tanpa_karies} orang)`
        ],
        datasets: [{
            data: [
                prevalensiData.siswa_dengan_karies || 0,
                prevalensiData.siswa_tanpa_karies || 0
            ],
            backgroundColor: ['#e74c3c', '#2ecc71'],
            borderWidth: 3,
            borderColor: '#fff'
        }],
    } : null;

    if (loading) {
        return <div style={styles.container}><h2>📊 Memuat Data Publik...</h2></div>;
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>❌ {error}</div>
                <button onClick={fetchData} style={styles.btnRetry}>🔄 Coba Lagi</button>
            </div>
        );
    }

    return (
        <div className="container animate-slide-up" style={styles.container}>
            {/* HEADER PUBLIK */}
            <header className="header" style={styles.header}>
                <h1 className="title" style={styles.title}>🌐 Prevalensi Karies Gigi</h1>
                <p className="subtitle" style={styles.subtitle}>Data Statistik Kesehatan Gigi Anak SD</p>
                
                <button 
                    onClick={() => window.location.href = '/login'}
                    style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.5)',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    🔒 Login Admin / Examiner
                </button>
            </header>

            {/* STATISTIK KESELURUHAN */}
            {statistik && (
                <section className="card animate-fade-in" style={styles.card}>
                    <h3 className="section-title" style={styles.sectionTitle}>📈 Statistik Keseluruhan</h3>
                    <div className="stats-grid" style={styles.statsGrid}>
                        <div style={{...styles.statBox, backgroundColor: '#667eea', color: 'white'}}>
                            <div style={styles.statLabel}>👥 Total Responden</div>
                            <div style={styles.statValue}>{Number(statistik.total_responden) || 0}</div>
                        </div>
                        <div style={{...styles.statBox, backgroundColor: '#2ecc71', color: 'white'}}>
                            <div style={styles.statLabel}>🦷 Gigi Sehat</div>
                            <div style={styles.statValue}>{Number(statistik.total_sehat) || 0}</div>
                        </div>
                        <div style={{...styles.statBox, backgroundColor: '#e74c3c', color: 'white'}}>
                            <div style={styles.statLabel}>⚠️ Karies Baru</div>
                            <div style={styles.statValue}>{Number(statistik.total_karies_baru) || 0}</div>
                        </div>
                        <div style={{...styles.statBox, backgroundColor: '#f39c12', color: 'white'}}>
                            <div style={styles.statLabel}> Karies Lama</div>
                            <div style={styles.statValue}>{Number(statistik.total_karies_lama) || 0}</div>
                        </div>
                    </div>
                </section>
            )}

            {/* DISTRIBUSI KONDISI GIGI (PIE CHART) */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}> Distribusi Kondisi Gigi</h3>
                {pieChartData && (
                    <div className="chart-wrapper" style={styles.chartWrapper}>
                        <Pie data={pieChartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.parsed || 0;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            return `${label}: ${value} gigi (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }} />
                    </div>
                )}
            </section>

            {/* PREVALENSI KARIES (DONUT CHART) */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>🍩 Prevalensi Karies (Berdasarkan Individu)</h3>
                
                {prevalensiData && donutChartData && (
                    <>
                        <div className="chart-wrapper" style={styles.chartWrapper}>
                            <Doughnut data={donutChartData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { position: 'bottom' },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const label = context.label || '';
                                                const value = context.parsed || 0;
                                                const total = prevalensiData.total_siswa;
                                                const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                                                return `${label}: ${value} siswa (${percentage}%)`;
                                            }
                                        }
                                    }
                                }
                            }} />
                        </div>
                        
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '8px',
                            borderLeft: '4px solid #2196f3',
                            textAlign: 'center'
                        }}>
                            <strong style={{color: '#0d47a1', fontSize: '18px'}}>
                                Prevalensi Karies: {prevalensiData.prevalensi_karies}%
                            </strong>
                            <p style={{margin: '5px 0 0 0', color: '#555', fontSize: '14px'}}>
                                dari total {prevalensiData.total_siswa} siswa yang diperiksa
                            </p>
                        </div>
                    </>
                )}
            </section>

            {/* STATISTIK PER KELAS (TANPA NAMA) */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📊 Statistik Per Kelas</h3>
                {statistikPerKelas.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>Belum ada data per kelas</p>
                ) : (
                    <div className="table-container" style={styles.tableContainer}>
                        <table className="table" style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Kelas</th>
                                    <th>Total Siswa</th>
                                    <th style={{color: '#2ecc71'}}> Sehat (%)</th>
                                    <th style={{color: '#e74c3c'}}> Karies Baru (%)</th>
                                    <th style={{color: '#f39c12'}}>🟡 Karies Lama (%)</th>
                                    <th style={{color: '#667eea'}}>📈 Prevalensi</th>
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
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '12px',
                                                backgroundColor: Number(kelas.prevalensi_karies) > 60 ? '#e74c3c' : Number(kelas.prevalensi_karies) > 40 ? '#e67e22' : Number(kelas.prevalensi_karies) > 20 ? '#f39c12' : '#2ecc71'
                                            }}>
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

            <footer style={{textAlign: 'center', padding: '20px', color: '#999', fontSize: '13px'}}>
                <p>© 2026 Sistem Prevalensi Karies Gigi Anak SD - Halaman Publik</p>
            </footer>
        </div>
    );
};

const styles = {
    container: { fontFamily: 'var(--font-primary)', padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    header: { textAlign: 'center', padding: '30px 20px', background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)', borderRadius: '15px', marginBottom: '20px', color: 'white' },
    title: { margin: '0 0 10px 0', fontSize: '2rem' },
    subtitle: { margin: 0, opacity: 0.95, fontSize: '1rem' },
    error: { padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    btnRetry: { padding: '10px 20px', backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '20px' },
    sectionTitle: { margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #1abc9c', paddingBottom: '10px', fontSize: '1.2rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' },
    statBox: { padding: '20px', borderRadius: '10px', textAlign: 'center' },
    statLabel: { fontSize: '13px', marginBottom: '8px', opacity: 0.9 },
    statValue: { fontSize: '28px', fontWeight: 'bold' },
    chartWrapper: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    tableCell: { padding: '12px', textAlign: 'left' },
    tableCenter: { textAlign: 'center', padding: '12px' }
};

export default PublicDashboard;