import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import BottomNav from './components/BottomNav';

const GantiPassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pesan, setPesan] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleGantiPassword = async (e) => {
        e.preventDefault();
        setPesan({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setPesan({ text: '❌ Password baru dan konfirmasi tidak cocok!', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setPesan({ text: '❌ Password baru minimal 6 karakter!', type: 'error' });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post(
                `${API_URL}/api/change-password`,
                { oldPassword, newPassword },
                { headers: { Authorization: token } }
            );
            
            setPesan({ text: '✅ Password berhasil diubah! Silakan login ulang.', type: 'success' });
            
            // Hapus token agar dipaksa login ulang
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }, 2000);

        } catch (err) {
            setPesan({ 
                text: '❌ ' + (err.response?.data?.message || 'Gagal mengubah password'), 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-slide-up" style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#f4f7f6',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>🔒 Ganti Password</h2>

                {pesan.text && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        backgroundColor: pesan.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: pesan.type === 'success' ? '#155724' : '#721c24',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {pesan.text}
                    </div>
                )}

                <form onSubmit={handleGantiPassword}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Password Lama</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Password Baru</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Memproses...' : 'UBAH PASSWORD'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        ← Kembali ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GantiPassword;