import { useState, useCallback } from 'react';
import { getAllAsignaciones, getAsignacionById, inscribirEstudiante, actualizarAsignacion, eliminarAsignacion } from '../../services';
import toast from 'react-hot-toast';

export const useAsignacion = () => {
    const [asignaciones, setAsignaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAsignaciones = useCallback(async (filters = {}) => {
        setIsLoading(true);
        const response = await getAllAsignaciones({ ...filters, limite: 1000 });
        setIsLoading(false);

        if (response.error) {
            toast.error('Error al cargar asignaciones');
            return;
        }

        setAsignaciones(response.data?.asignaciones || response.data || []);
    }, []);

    const getAsignacion = async (id) => {
        const response = await getAsignacionById(id);
        if (response.error) {
            toast.error('Error al obtener asignación');
            return null;
        }
        return response.data;
    };

    const addAsignacion = async (asignacionData) => {
        const response = await inscribirEstudiante(asignacionData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al inscribir estudiante');
            return false;
        }
        toast.success('Estudiante inscrito correctamente');
        fetchAsignaciones();
        return true;
    };

    const editAsignacion = async (id, asignacionData) => {
        const response = await actualizarAsignacion(id, asignacionData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al actualizar asignación');
            return false;
        }
        toast.success('Asignación actualizada correctamente');
        fetchAsignaciones();
        return true;
    };

    const removeAsignacion = async (id) => {
        const response = await eliminarAsignacion(id);
        if (response.error) {
            toast.error('Error al eliminar asignación');
            return false;
        }
        toast.success('Estudiante dado de baja correctamente');
        fetchAsignaciones();
        return true;
    };

    const toggleAsignacionStatus = async (id, currentStatus) => {
        const response = await actualizarAsignacion(id, { status: !currentStatus });
        if (response.error) {
            toast.error('Error al cambiar estado de la asignación');
            return false;
        }
        toast.success(`Asignación ${!currentStatus ? 'activada' : 'desactivada'} correctamente`);
        fetchAsignaciones();
        return true;
    };

    return {
        asignaciones,
        isLoading,
        fetchAsignaciones,
        getAsignacion,
        addAsignacion,
        editAsignacion,
        removeAsignacion,
        toggleAsignacionStatus
    };
};