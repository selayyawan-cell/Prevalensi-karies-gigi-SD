// Hardcode URL backend (untuk production)
export const API_URL = 'https://prevalensi-karies-gigi-sd.vercel.app';

// Atau jika menggunakan axios:
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://prevalensi-karies-gigi-sd.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});