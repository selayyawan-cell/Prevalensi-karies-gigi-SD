// Ambil URL dari environment variable
const API_URL = import.meta.env.VITE_API_URL || 'https://prevalensi-karies-gigi-sd.vercel.app';

// Fungsi helper untuk fetch API
export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan token jika perlu:
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Terjadi kesalahan');
  }
  
  return response.json();
};