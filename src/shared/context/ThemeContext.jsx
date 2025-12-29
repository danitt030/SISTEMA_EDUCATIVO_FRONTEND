import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    const applyTheme = useCallback((newTheme) => {
        const root = document.documentElement;
        
        if (newTheme === 'system') {
            // Detectar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', newTheme);
        }
        
        localStorage.setItem('theme', newTheme);
    }, []);

    useEffect(() => {
        // Aplicar tema al cargar
        applyTheme(theme);
    }, [theme, applyTheme]);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
    };

    // Escuchar cambios en la preferencia del sistema
    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            };
            
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personalizado para usar el contexto del tema
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de ThemeProvider');
    }
    return context;
};

export default ThemeContext;
