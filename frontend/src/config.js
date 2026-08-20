// ============================================
// 🔹 KONFIGURASI API URL
// ============================================


const IP_ADDRESS = '192.168.88.184';  

export const API_URL = `http://${IP_ADDRESS}:3001/api`;
export const API_URL_LOCAL = 'http://localhost:3001/api';

export const getApiUrl = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile ? API_URL : API_URL_LOCAL;
};