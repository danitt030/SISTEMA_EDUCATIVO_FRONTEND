import { useState, useCallback } from 'react';
import { getAllCalificaciones, getCalificacionById, registrarCalificacion, editarCalificacion, eliminarCalificacion } from '../../services';
import toast from 'react-hot-toast';

export const useCalificacion = () => {
    const [calificaciones, setCalificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCalificaciones = useCallback(async (filters = {}) => {
        setIsLoading(true);
        const response = await getAllCalificaciones({ ...filters, limite: 1000 });
        setIsLoading(false);

        if (response.error) {
            toast.error('Error al cargar calificaciones');
            return;
        }

        setCalificaciones(response.data?.calificaciones || response.data || []);
    }, []);

    const getCalificacion = async (id) => {
        const response = await getCalificacionById(id);
        if (response.error) {
            toast.error('Error al obtener calificación');
            return null;
        }
        return response.data;
    };

    const addCalificacion = async (calificacionData) => {
        const response = await registrarCalificacion(calificacionData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al registrar calificación');
            return false;
        }
        toast.success('Calificación registrada correctamente');
        fetchCalificaciones();
        return true;
    };

    const updateCalificacion = async (id, calificacionData) => {
        const response = await editarCalificacion(id, calificacionData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al actualizar calificación');
            return false;
        }
        toast.success('Calificación actualizada correctamente');
        fetchCalificaciones();
        return true;
    };

    const removeCalificacion = async (id) => {
        const response = await eliminarCalificacion(id);
        if (response.error) {
            toast.error('Error al eliminar calificación');
            return false;
        }
        toast.success('Calificación eliminada correctamente');
        fetchCalificaciones();
        return true;
    };

    return {
        calificaciones,
        isLoading,
        fetchCalificaciones,
        getCalificacion,
        addCalificacion,
        updateCalificacion,
        removeCalificacion
    };
};