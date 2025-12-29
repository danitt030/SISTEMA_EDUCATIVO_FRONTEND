import React from 'react';
import './Loader.css';

const Loader = ({ size = 'md', text = 'Cargando...' }) => {
    return (
        <div className={`loader-container loader-${size}`}>
            <div className="loader-spinner"></div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
};

export default Loader;
