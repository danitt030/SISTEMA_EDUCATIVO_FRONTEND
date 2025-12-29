import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const login = async (username, password) => {
        setIsLoading(true);

        const response = await loginRequest({ username, password });

        setIsLoading(false);

        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al iniciar sesión');
            return false;
        }

        const { userDetails } = response.data;

        if (userDetails) {
            authLogin(userDetails);
            toast.success('¡Bienvenido de nuevo!');
            navigate('/dashboard');
            return true;
        }

        toast.error('Error al obtener datos del usuario');
        return false;
    };

    return {
        login,
        isLoading
    };
};