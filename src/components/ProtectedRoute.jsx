import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Mostrar loader mientras se verifica autenticación
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Si se requieren roles específicos y el usuario no los tiene
    if (roles.length > 0 && user && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;