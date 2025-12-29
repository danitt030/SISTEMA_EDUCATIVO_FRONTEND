import { useAuth } from '../context/AuthContext';

export const useUserDetails = () => {
    const { user, isAuthenticated, isLoading, hasRole } = useAuth();

    const getUserId = () => {
        if (!user) return null;
        return user.uid || user._id || user.id;
    };

    const getUserRole = () => {
        if (!user) return null;
        return user.role;
    };

    const getUserName = () => {
        if (!user) return 'Usuario';
        return user.name || user.username || 'Usuario';
    };

    const getUserFullName = () => {
        if (!user) return 'Usuario';
        if (user.name && user.surname) {
            return `${user.name} ${user.surname}`;
        }
        return user.name || user.username || 'Usuario';
    };

    const isAdmin = () => hasRole('ADMIN_ROLE');
    const isCoordinador = () => hasRole('COORDINADOR_ROLE');
    const isProfesor = () => hasRole('PROFESOR_ROLE');
    const isPadre = () => hasRole('PADRE_ROLE');
    const isAlumno = () => hasRole('ALUMNO_ROLE');

    return {
        user,
        isAuthenticated,
        isLoading,
        hasRole,
        getUserId,
        getUserRole,
        getUserName,
        getUserFullName,
        isAdmin,
        isCoordinador,
        isProfesor,
        isPadre,
        isAlumno
    };
};