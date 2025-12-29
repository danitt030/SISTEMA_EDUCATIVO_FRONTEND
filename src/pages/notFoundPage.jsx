import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="container mt-5 text-center">
            <h1 className="display-1">404</h1>
            <h2>Página no encontrada</h2>
            <p className="lead">La página que buscas no existe.</p>
            <Link to="/dashboard" className="btn btn-primary">
                Volver al inicio
            </Link>
        </div>
    );
};

export default NotFoundPage;