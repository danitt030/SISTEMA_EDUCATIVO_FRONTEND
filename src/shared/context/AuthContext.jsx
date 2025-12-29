import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar usuario del localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error al parsear usuario:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // Escuchar cambios en localStorage (para múltiples pestañas)
    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('localStorageChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageChange', handleStorageChange);
        };
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Disparar evento para otras pestañas
        window.dispatchEvent(new Event('localStorageChange'));
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        
        // Disparar evento para otras pestañas
        window.dispatchEvent(new Event('localStorageChange'));
    };

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
        
        window.dispatchEvent(new Event('localStorageChange'));
    };

    // Verificar si el usuario tiene un rol específico
    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;