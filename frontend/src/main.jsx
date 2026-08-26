import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import Dashboard2 from './Dashboard2.jsx'
import Login from './login.jsx'
import GantiPassword from './GantiPassword.jsx'
import PublicDashboard from './PublicDashboard.jsx' 
import './index.css'

const currentPath = window.location.pathname;
const token = localStorage.getItem('token');

let Component;

// LOGIKA ROUTING
if (currentPath === '/login') {
    Component = Login;
} else if (currentPath === '/public') {
    // ✅ HALAMAN PUBLIK: TIDAK PERLU CEK TOKEN
    Component = PublicDashboard;
} else if (currentPath === '/ganti-password') {
    if (!token) {
        window.location.href = '/login';
    } else {
        Component = GantiPassword;
    }
} else if (!token) {
    // Jika tidak punya token dan bukan di halaman login/public -> PAKSA KE LOGIN
    window.location.href = '/login';
    Component = Login; 
} else {
    // Jika punya token, akses normal
    if (currentPath === '/dashboard') Component = Dashboard;
    else if (currentPath === '/dashboard2') Component = Dashboard2;
    else Component = App;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>,
)