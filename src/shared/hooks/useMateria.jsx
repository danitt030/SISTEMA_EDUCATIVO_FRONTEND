import { useState, useCallback } from 'react';
import { getAllMaterias, getMateriaById, crearMateria, actualizarMateria, eliminarMateria, getMateriasPorProfesor } from '../../services';
import toast from 'react-hot-toast';

export const useMateria = () => {
    const [materias, setMaterias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener usuario y rol del localStorage
    const getUserInfo = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    };

    const fetchMaterias = useCallback(async (filters = {}) => {
        setIsLoading(true);
        
        const user = getUserInfo();
        let response;

        // Filtrar materias según el rol
        if (user?.role === 'PROFESOR_ROLE') {
            // Profesor: solo ver materias donde está asignado
            response = await getMateriasPorProfesor(user.uid || user.id);
        } else {
            // Admin, Coordinador y otros: ver todas las materias (sin límite)
            response = await getAllMaterias({ ...filters, limite: 1000 });
        }
        
        setIsLoading(false);

        if (response.error) {
            toast.error('Error al cargar materias');
            return;
        }

        setMaterias(response.data?.materias || response.data || []);
    }, []);

    const getMateria = async (id) => {
        const response = await getMateriaById(id);
        if (response.error) {
            toast.error('Error al obtener materia');
            return null;
        }
        return response.data;
    };

    const addMateria = async (materiaData) => {
        const response = await crearMateria(materiaData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al crear materia');
            return false;
        }
        toast.success('Materia creada correctamente');
        fetchMaterias();
        return true;
    };

    const editMateria = async (id, materiaData) => {
        const response = await actualizarMateria(id, materiaData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al actualizar materia');
            return false;
        }
        toast.success('Materia actualizada correctamente');
        fetchMaterias();
        return true;
    };

    const removeMateria = async (id) => {
        const response = await eliminarMateria(id);
        if (response.error) {
            toast.error('Error al eliminar materia');
            return false;
        }
        toast.success('Materia eliminada correctamente');
        fetchMaterias();
        return true;
    };

    const toggleMateriaStatus = async (id, currentStatus) => {
        const response = await actualizarMateria(id, { status: !currentStatus });
        if (response.error) {
            toast.error('Error al cambiar estado de la materia');
            return false;
        }
        toast.success(`Materia ${!currentStatus ? 'activada' : 'desactivada'} correctamente`);
        fetchMaterias();
        return true;
    };

    return {
        materias,
        isLoading,
        fetchMaterias,
        getMateria,
        addMateria,
        editMateria,
        removeMateria,
        toggleMateriaStatus
    };
};