import React from 'react';

const BottomNav = () => {
    const currentPath = window.location.pathname;
    
    const isActive = (path) => {
        if (path === '/') return currentPath === '/' || currentPath === '';
        return currentPath === path;
    };
    
    const navigate = (path) => { window.location.href = path; };
    
    return (
        <nav className="bottom-nav">
            <div className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
                <span className="bottom-nav-icon">📝</span><span>Input</span>
            </div>
            <div className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                <span className="bottom-nav-icon">📊</span><span>Overview</span>
            </div>
            <div className={`bottom-nav-item ${isActive('/dashboard2') ? 'active' : ''}`} onClick={() => navigate('/dashboard2')}>
                <span className="bottom-nav-icon">📋</span><span>Distribusi</span>
            </div>
        </nav>
    );
};

export default BottomNav;