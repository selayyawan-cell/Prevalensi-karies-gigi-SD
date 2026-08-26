import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { setSession } from './utils/auth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post   `${API_URL}/api//api/login`, { username, password });
            
            // Simpan token
            setSession(res.data.token, res.data.user);
            
            // Redirect ke halaman utama
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal login. Cek koneksi server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '40px', margin: 0 }}>🦷</h1>
                    <h2 style={{ color: '#333', margin: '10px 0 5px' }}>Login Sistem</h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>Prevalensi Karies Gigi SD</p>
                </div>

                {error && (
                    <div style={{
                        background: '#f8d7da', color: '#721c24', padding: '10px',
                        borderRadius: '5px', marginBottom: '15px', fontSize: '14px', textAlign: 'center'
                    }}>
                        {error}
                                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                    <p>Default: <b>admin</b> / <b>admin123</b></p>
                    {/* ✅ LINK KE HALAMAN PUBLIK */}
                    <p style={{ marginTop: '10px' }}>
                        Ingin melihat statistik umum? 
                        <a href="/public" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold', marginLeft: '5px' }}>
                            Buka Dashboard Publik 
                        </a>
                    </p>
                </div>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px', border: '1px solid #ddd',
                                borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
                            }}
                            placeholder="Masukkan username"
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px', border: '1px solid #ddd',
                                borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box'
                            }}
                            placeholder="Masukkan password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: '#667eea', color: 'white',
                            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Memproses...' : 'MASUK'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                    <p>Default: <b>admin</b> / <b>admin123</b></p>
                </div>
            </div>
        </div>
    );
};

export default Login;