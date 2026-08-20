import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import BottomNav from './components/BottomNav';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title);

const Dashboard2 = () => {
    // ✅ Inisialisasi state yang aman
    const [semuaResponden, setSemuaResponden] = useState([]);
    const [totalResponden, setTotalResponden] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResponden, setSelectedResponden] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const allRes = await axios.get(`${API_URL}/semua-data`);
            
            setSemuaResponden(allRes.data || []);
            setTotalResponden(allRes.data.length || 0);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error fetching data:', err);
            setError('Gagal mengambil data: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const handleRowClick = async (responden) => {
        try {
            setSelectedResponden(responden);
            setShowModal(true);
            
            const response = await axios.get(`${API_URL}/detail-responden/${responden.id_responden}`);
            setDetailData(response.data);
        } catch (err) {
            console.error('❌ Error fetching detail:', err);
            alert('Gagal memuat detail responden');
            setShowModal(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedResponden(null);
        setDetailData(null);
    };

    // ✅ PERHITUNGAN TOTAL (AMAN DARI CRASH)
    const totalSehat = semuaResponden.reduce((sum, d) => sum + (Number(d.jumlah_sehat) || 0), 0);
    const totalKariesBaru = semuaResponden.reduce((sum, d) => sum + (Number(d.jumlah_karies_baru) || 0), 0);
    const totalKariesLama = semuaResponden.reduce((sum, d) => sum + (Number(d.jumlah_karies_lama) || 0), 0);
    const totalKode3 = semuaResponden.reduce((sum, d) => sum + (Number(d.jumlah_kode3) || 0), 0);
    
    // Total HANYA untuk persentase (exclude kode3)
    const totalUntukPersen = totalSehat + totalKariesBaru + totalKariesLama;

    // Persentase (exclude kode3)
    const persenSehat = totalUntukPersen > 0 ? ((totalSehat / totalUntukPersen) * 100).toFixed(2) : 0;
    const persenKariesBaru = totalUntukPersen > 0 ? ((totalKariesBaru / totalUntukPersen) * 100).toFixed(2) : 0;
    const persenKariesLama = totalUntukPersen > 0 ? ((totalKariesLama / totalUntukPersen) * 100).toFixed(2) : 0;

    // Chart Data
    const detailChartData = detailData ? {
        labels: [' Sehat', '🔴 Karies Baru', '🟡 Karies Lama'],
        datasets: [{
            data: [
                detailData.sehat || 0,
                detailData.karies_baru || 0,
                detailData.karies_lama || 0
            ],
            backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
            borderWidth: 3,
            borderColor: '#fff'
        }],
    } : null;

    const detailBarData = detailData ? {
        labels: ['Jumlah Gigi'],
        datasets: [
            { label: 'Sehat', data: [detailData.sehat || 0], backgroundColor: '#2ecc71' },
            { label: 'Karies Baru', data: [detailData.karies_baru || 0], backgroundColor: '#e74c3c' },
            { label: 'Karies Lama', data: [detailData.karies_lama || 0], backgroundColor: '#f39c12' },
        ],
    } : null;

    // Loading State
    if (loading) {
        return <div className="container" style={styles.container}><h2>📊 Loading Dashboard...</h2></div>;
    }

    // Error State
    if (error) {
        return (
            <div className="container" style={styles.container}>
                <div style={styles.error}>❌ {error}</div>
                <button onClick={fetchData} style={styles.btnRetry}>🔄 Retry</button>
            </div>
        );
    }

    return (
        <div className="container animate-slide-up" style={styles.container}>
            <header className="header" style={styles.header}>
                <h1 className="title" style={styles.title}>📊 Dashboard Prevalensi Karies Gigi</h1>
                <p className="subtitle" style={styles.subtitle}>Daftar Responden dan Statistik</p>
            </header>

            {/* RINGKASAN DATA */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📈 Ringkasan Data</h3>
                
                <div style={{
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f39c12',
                    fontSize: '13px',
                    color: '#856404'
                }}>
                    ℹ️ <strong>Catatan:</strong> Kondisi "Lainnya" (kode 3) ditampilkan sebagai data mentah, namun tidak dihitung dalam persentase distribusi.
                </div>
                
                <div className="stats-grid" style={styles.summaryGrid}>
                    <div style={{...styles.summaryBox, backgroundColor: '#667eea', color: 'white'}}>
                        <div style={styles.summaryLabel}>Total Responden</div>
                        <div style={styles.summaryValue}>{totalResponden}</div>
                        <div style={styles.summarySub}>orang</div>
                    </div>
                    <div style={{...styles.summaryBox, backgroundColor: '#2ecc71', color: 'white'}}>
                        <div style={styles.summaryLabel}>🟢 Gigi Sehat</div>
                        <div style={styles.summaryValue}>{totalSehat}</div>
                        <div style={styles.summarySub}>{persenSehat}%</div>
                    </div>
                    <div style={{...styles.summaryBox, backgroundColor: '#e74c3c', color: 'white'}}>
                        <div style={styles.summaryLabel}>🔴 Karies Baru</div>
                        <div style={styles.summaryValue}>{totalKariesBaru}</div>
                        <div style={styles.summarySub}>{persenKariesBaru}%</div>
                    </div>
                    <div style={{...styles.summaryBox, backgroundColor: '#f39c12', color: 'white'}}>
                        <div style={styles.summaryLabel}>🟡 Karies Lama</div>
                        <div style={styles.summaryValue}>{totalKariesLama}</div>
                        <div style={styles.summarySub}>{persenKariesLama}%</div>
                    </div>
                    <div style={{...styles.summaryBox, backgroundColor: '#95a5a6', color: 'white'}}>
                        <div style={styles.summaryLabel}>⚪ Lainnya</div>
                        <div style={styles.summaryValue}>{totalKode3}</div>
                        <div style={styles.summarySub}>(tidak dihitung)</div>
                    </div>
                </div>
            </section>

            {/* DAFTAR RESPONDEN */}
            <section className="card animate-fade-in" style={styles.card}>
                <h3 className="section-title" style={styles.sectionTitle}>📋 Daftar Responden (Klik untuk Detail)</h3>
                
                {semuaResponden.length === 0 ? (
                    <p className="text-center" style={{textAlign: 'center', color: '#999', padding: '40px'}}>Belum ada data untuk ditampilkan</p>
                ) : (
                    <div className="table-container" style={styles.tableContainer}>
                        <table className="table" style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{width: '5%'}}>No</th>
                                    <th style={{width: '10%'}}>Tanggal</th>
                                    <th style={{width: '12%'}}>No. Responden</th>
                                    <th style={{width: '10%'}}>Kelas</th>
                                    <th style={{width: '8%'}}>Umur</th>
                                    <th style={{width: '9%'}}>Sehat</th>
                                    <th style={{width: '10%'}}>Karies Baru</th>
                                    <th style={{width: '10%'}}>Karies Lama</th>
                                    <th style={{width: '9%'}}>Lainnya</th>
                                    <th style={{width: '9%'}}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {semuaResponden.map((responden, index) => {
                                    const totalPerResponden = (Number(responden.jumlah_sehat) || 0) + 
                                                             (Number(responden.jumlah_karies_baru) || 0) + 
                                                             (Number(responden.jumlah_karies_lama) || 0) +
                                                             (Number(responden.jumlah_kode3) || 0);
                                    
                                    return (
                                        <tr 
                                            key={index} 
                                            style={{...styles.tableRow, cursor: 'pointer'}}
                                            onClick={() => handleRowClick(responden)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'}
                                        >
                                            <td style={styles.tableCell}>{index + 1}</td>
                                            <td style={styles.tableCell}>
                                                {responden.tanggal_pemeriksaan 
                                                    ? new Date(responden.tanggal_pemeriksaan).toLocaleDateString('id-ID')
                                                    : '-'
                                                }
                                            </td>
                                            <td style={{...styles.tableCell, fontWeight: 'bold', color: '#667eea'}}>{responden.nomor_responden}</td>
                                            <td style={styles.tableCell}>{responden.kelas || '-'}</td>
                                            <td style={styles.tableCell}>{responden.umur || '-'} th</td>
                                            <td style={{...styles.tableCell, textAlign: 'center', color: '#2ecc71', fontWeight: 'bold'}}>{responden.jumlah_sehat || 0}</td>
                                            <td style={{...styles.tableCell, textAlign: 'center', color: '#e74c3c', fontWeight: 'bold'}}>{responden.jumlah_karies_baru || 0}</td>
                                            <td style={{...styles.tableCell, textAlign: 'center', color: '#f39c12', fontWeight: 'bold'}}>{responden.jumlah_karies_lama || 0}</td>
                                            <td style={{...styles.tableCell, textAlign: 'center', color: '#95a5a6', fontWeight: 'bold'}}>{responden.jumlah_kode3 || 0}</td>
                                            <td style={{...styles.tableCell, textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8f9fa'}}>{totalPerResponden}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* MODAL DETAIL */}
            {showModal && selectedResponden && detailData && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div className="modal-content" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.btnClose} onClick={closeModal}>×</button>
                        
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>📊 Analisis Individu</h2>
                            <p style={styles.modalSubtitle}>{selectedResponden.nomor_responden} - {selectedResponden.kelas}</p>
                        </div>

                        <section className="modal-section" style={styles.modalSection}>
                            <h3 className="section-title" style={styles.modalSectionTitle}>👤 Informasi Responden</h3>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
    <span style={styles.infoLabel}>Sikat Gigi:</span>
    <span style={styles.infoValue}>{detailData.frekuensi_sikat_gigi || '-'}x/hari ({detailData.waktu_sikat_gigi || '-'})</span>
</div>
<div style={styles.infoItem}>
    <span style={styles.infoLabel}>Kebiasaan Makan:</span>
    <span style={styles.infoValue}>{detailData.kebiasaan_makan || '-'}</span>
</div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Nomor:</span>
                                    <span style={styles.infoValue}>{selectedResponden.nomor_responden}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Kelas:</span>
                                    <span style={styles.infoValue}>{selectedResponden.kelas}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Umur:</span>
                                    <span style={styles.infoValue}>{selectedResponden.umur} tahun</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Gol. Darah:</span>
                                    <span style={styles.infoValue}>{selectedResponden.golongan_darah || '-'}</span>
                                </div>
                            </div>
                        </section>

                        <section className="modal-section" style={styles.modalSection}>
                            <h3 className="section-title" style={styles.modalSectionTitle}> Statistik Kondisi Gigi</h3>
                            
                            <div style={{
                                marginBottom: '15px',
                                padding: '12px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '8px',
                                borderLeft: '4px solid #2196f3',
                                fontSize: '13px',
                                color: '#0d47a1'
                            }}>
                                ️ Persentase dihitung dari kondisi Sehat + Karies Baru + Karies Lama (tanpa Lainnya)
                            </div>
                            
                            <div className="stats-grid" style={styles.statsGrid}>
                                {/* Fallback untuk total_untuk_persen jika backend belum diupdate */}
                                {(() => {
                                    const totalPersen = detailData.total_untuk_persen || (detailData.sehat + detailData.karies_baru + detailData.karies_lama);
                                    return (
                                        <>
                                            <div style={{...styles.statCard, backgroundColor: '#2ecc71', color: 'white'}}>
                                                <div style={{fontSize: '32px', marginBottom: '8px'}}>🟢</div>
                                                <div style={styles.statLabel}>Gigi Sehat</div>
                                                <div style={{...styles.statValue, fontSize: '36px'}}>{detailData.sehat || 0}</div>
                                                <div style={{...styles.statPercent, fontSize: '18px', fontWeight: 'bold'}}>
                                                    {totalPersen > 0 ? ((detailData.sehat / totalPersen) * 100).toFixed(2) : 0}%
                                                </div>
                                            </div>
                                            <div style={{...styles.statCard, backgroundColor: '#e74c3c', color: 'white'}}>
                                                <div style={{fontSize: '32px', marginBottom: '8px'}}>🔴</div>
                                                <div style={styles.statLabel}>Karies Baru</div>
                                                <div style={{...styles.statValue, fontSize: '36px'}}>{detailData.karies_baru || 0}</div>
                                                <div style={{...styles.statPercent, fontSize: '18px', fontWeight: 'bold'}}>
                                                    {totalPersen > 0 ? ((detailData.karies_baru / totalPersen) * 100).toFixed(2) : 0}%
                                                </div>
                                            </div>
                                            <div style={{...styles.statCard, backgroundColor: '#f39c12', color: 'white'}}>
                                                <div style={{fontSize: '32px', marginBottom: '8px'}}>🟡</div>
                                                <div style={styles.statLabel}>Karies Lama</div>
                                                <div style={{...styles.statValue, fontSize: '36px'}}>{detailData.karies_lama || 0}</div>
                                                <div style={{...styles.statPercent, fontSize: '18px', fontWeight: 'bold'}}>
                                                    {totalPersen > 0 ? ((detailData.karies_lama / totalPersen) * 100).toFixed(2) : 0}%
                                                </div>
                                            </div>
                                            <div style={{...styles.statCard, backgroundColor: '#95a5a6', color: 'white'}}>
                                                <div style={{fontSize: '32px', marginBottom: '8px'}}>⚪</div>
                                                <div style={styles.statLabel}>Lainnya</div>
                                                <div style={{...styles.statValue, fontSize: '36px'}}>{detailData.kode3 || 0}</div>
                                                <div style={{...styles.statPercent, fontSize: '14px', fontStyle: 'italic', opacity: 0.9}}>
                                                    (tidak dihitung)
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div style={{
                                marginTop: '20px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '15px'
                            }}>
                                <div style={{
                                    padding: '15px', backgroundColor: '#f8f9fa',
                                    borderRadius: '10px', textAlign: 'center', border: '2px solid #667eea'
                                }}>
                                    <div style={{fontSize: '14px', color: '#7f8c8d', marginBottom: '5px'}}>TOTAL UNTUK PERSENTASE</div>
                                    <div style={{fontSize: '28px', fontWeight: 'bold', color: '#667eea'}}>
                                        {detailData.total_untuk_persen || (detailData.sehat + detailData.karies_baru + detailData.karies_lama)} gigi
                                    </div>
                                    <div style={{fontSize: '12px', color: '#999'}}>(Sehat + Baru + Lama)</div>
                                </div>
                                <div style={{
                                    padding: '15px', backgroundColor: '#f8f9fa',
                                    borderRadius: '10px', textAlign: 'center', border: '2px solid #95a5a6'
                                }}>
                                    <div style={{fontSize: '14px', color: '#7f8c8d', marginBottom: '5px'}}>TOTAL LENGKAP</div>
                                    <div style={{fontSize: '28px', fontWeight: 'bold', color: '#95a5a6'}}>
                                        {detailData.total || 0} gigi
                                    </div>
                                    <div style={{fontSize: '12px', color: '#999'}}>(termasuk Lainnya)</div>
                                </div>
                            </div>
                        </section>

                        <div className="stats-grid" style={styles.chartsGrid}>
                            <section className="modal-section" style={styles.chartSection}>
                                <h3 className="section-title" style={styles.modalSectionTitle}>🥧 Distribusi</h3>
                                {detailChartData && (
                                    <div className="chart-wrapper" style={styles.chartWrapper}>
                                        <Pie data={detailChartData} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom' } }
                                        }} />
                                    </div>
                                )}
                            </section>
                            
                            <section className="modal-section" style={styles.chartSection}>
                                <h3 className="section-title" style={styles.modalSectionTitle}>📊 Perbandingan</h3>
                                {detailBarData && (
                                    <div className="chart-wrapper" style={styles.chartWrapper}>
                                        <Bar data={detailBarData} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'top' } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                        }} />
                                    </div>
                                )}
                            </section>
                        </div>

                        {detailData.detail_gigi && detailData.detail_gigi.length > 0 && (
                            <section className="modal-section" style={styles.modalSection}>
                                <h3 className="section-title" style={styles.modalSectionTitle}>🦷 Detail Kondisi per Gigi</h3>
                                <div className="tooth-grid" style={styles.toothGrid}>
                                    {detailData.detail_gigi.map((gigi, idx) => {
                                        const getConditionInfo = (kondisi) => {
                                            switch(String(kondisi)) {
                                                case '0': return { label: 'Sehat', color: '#2ecc71', bgColor: '#d4edda', borderColor: '#27ae60', emoji: '🟢' };
                                                case '1': return { label: 'Karies Baru', color: '#e74c3c', bgColor: '#f8d7da', borderColor: '#c0392b', emoji: '🔴' };
                                                case '2': return { label: 'Karies Lama', color: '#f39c12', bgColor: '#fff3cd', borderColor: '#d35400', emoji: '🟡' };
                                                case '3': return { label: 'Lainnya', color: '#95a5a6', bgColor: '#e2e3e5', borderColor: '#7f8c8d', emoji: '⚪' };
                                                default: return { label: '-', color: '#999', bgColor: '#f8f9fa', borderColor: '#999', emoji: '⚪' };
                                            }
                                        };
                                        const condition = getConditionInfo(gigi.kondisi);
                                        return (
                                            <div key={idx} style={{
                                                ...styles.toothItem,
                                                backgroundColor: condition.bgColor,
                                                borderLeft: `5px solid ${condition.borderColor}`,
                                                padding: '14px',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                minHeight: '60px'
                                            }}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <span style={{fontSize: '24px'}}>{condition.emoji}</span>
                                                    <div>
                                                        <div style={{fontWeight: 'bold', fontSize: '16px', color: '#2c3e50'}}>Gigi {gigi.kode_gigi}</div>
                                                        <div style={{fontSize: '12px', color: '#7f8c8d'}}>Kode: {gigi.kondisi}</div>
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    <span style={{
                                                        fontWeight: '700', fontSize: '14px', color: condition.color,
                                                        backgroundColor: 'white', padding: '6px 14px',
                                                        borderRadius: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}>{condition.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div style={styles.modalFooter}>
                            <button style={styles.btnPrint} onClick={() => window.print()}>🖨️ Cetak Laporan</button>
                            <button style={styles.btnCloseModal} onClick={closeModal}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer" style={styles.footer}>
                <button className="btn-kembali" style={{...styles.btnKembali, marginRight: '10px'}} onClick={() => window.location.href = '/dashboard'}>← Dashboard 1</button>
                <button className="btn-kembali" style={styles.btnKembali} onClick={() => window.location.href = 'http://localhost:5173'}>🏠 Beranda</button>
            </div>

            <BottomNav />
        </div>
    );
};

const styles = {
    container: { fontFamily: 'var(--font-primary)', padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: 'var(--bg-light)', minHeight: '100vh' },
    header: { textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 'var(--radius-lg)', marginBottom: '20px', color: 'white' },
    title: { margin: '0 0 5px 0', fontSize: '2rem' },
    subtitle: { margin: 0, opacity: 0.9, fontSize: '1rem' },
    error: { padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    btnRetry: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginBottom: '20px' },
    sectionTitle: { margin: '0 0 20px 0', color: 'var(--text-dark)', borderBottom: '2px solid #667eea', paddingBottom: '10px' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' },
    summaryBox: { padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    summaryLabel: { fontSize: '14px', marginBottom: '8px', opacity: 0.9 },
    summaryValue: { fontSize: '32px', fontWeight: 'bold' },
    summarySub: { fontSize: '12px', opacity: 0.8 },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    tableRow: { borderBottom: '1px solid #ddd' },
    tableCell: { padding: '12px 10px', textAlign: 'left' },
    footer: { textAlign: 'center', padding: '20px' },
    btnKembali: { padding: '12px 30px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflow: 'auto' },
    modalContent: { backgroundColor: 'white', borderRadius: '15px', padding: '30px', maxWidth: '1000px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
    btnClose: { position: 'absolute', top: '15px', right: '20px', fontSize: '32px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
    modalHeader: { textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #667eea' },
    modalTitle: { margin: '0 0 5px 0', fontSize: '28px', color: 'var(--text-dark)' },
    modalSubtitle: { margin: 0, fontSize: '16px', color: '#667eea', fontWeight: 'bold' },
    modalSection: { marginBottom: '25px' },
    modalSectionTitle: { margin: '0 0 15px 0', fontSize: '18px', color: 'var(--text-dark)', borderBottom: '2px solid #667eea', paddingBottom: '8px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
    infoItem: { display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' },
    infoLabel: { fontWeight: '600', color: '#555' },
    infoValue: { color: '#667eea', fontWeight: 'bold' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
    statCard: { padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    statLabel: { fontSize: '13px', marginBottom: '10px', opacity: 0.9 },
    statValue: { fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' },
    statPercent: { fontSize: '16px', opacity: 0.9 },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' },
    chartSection: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px' },
    chartWrapper: { height: '250px' },
    toothGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px', padding: '10px' },
    toothItem: { borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease', minHeight: '60px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #ddd' },
    btnPrint: { padding: '12px 24px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
    btnCloseModal: { padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }
};

export default Dashboard2;