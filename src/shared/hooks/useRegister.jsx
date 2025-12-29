import { useState } from 'react';
import { register as registerRequest } from '../../services';
import toast from 'react-hot-toast';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);

    const registerUser = async (userData) => {
        setIsLoading(true);

        const response = await registerRequest(userData);

        setIsLoading(false);

        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al registrar usuario');
            return { success: false };
        }

        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
        return { success: true, data: response.data };
    };

    return {
        registerUser,
        isLoading
    };
};