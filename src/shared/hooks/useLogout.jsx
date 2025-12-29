import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useLogout = () => {
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();

    const logout = () => {
        authLogout();
        toast.success('Sesión cerrada correctamente');
        navigate('/auth');
    };

    return { logout };
};