import { useState, useCallback } from 'react';
import { getAllCursos, getCursoById, crearCurso, actualizarCurso, eliminarCurso, getCursosPorProfesor, getCursosPorCoordinador } from '../../services';
import toast from 'react-hot-toast';

export const useCurso = () => {
    const [cursos, setCursos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener usuario y rol del localStorage
    const getUserInfo = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    };

    const fetchCursos = useCallback(async (filters = {}) => {
        setIsLoading(true);
        
        const user = getUserInfo();
        let response;

        // Filtrar cursos según el rol
        if (user?.role === 'PROFESOR_ROLE') {
            // Profesor: solo ver cursos donde tiene materias asignadas
            response = await getCursosPorProfesor(user.uid || user.id);
        } else if (user?.role === 'COORDINADOR_ROLE') {
            // Coordinador: solo ver cursos que coordina
            response = await getCursosPorCoordinador(user.uid || user.id);
        } else {
            // Admin y otros: ver todos los cursos (sin límite)
            response = await getAllCursos({ ...filters, limite: 1000 });
        }
        
        setIsLoading(false);

        if (response.error) {
            toast.error('Error al cargar cursos');
            return;
        }

        setCursos(response.data?.cursos || response.data || []);
    }, []);

    const getCurso = async (id) => {
        const response = await getCursoById(id);
        if (response.error) {
            toast.error('Error al obtener curso');
            return null;
        }
        return response.data;
    };

    const addCurso = async (cursoData) => {
        const response = await crearCurso(cursoData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al crear curso');
            return false;
        }
        toast.success('Curso creado correctamente');
        fetchCursos();
        return true;
    };

    const editCurso = async (id, cursoData) => {
        const response = await actualizarCurso(id, cursoData);
        if (response.error) {
            toast.error(response.err?.response?.data?.message || 'Error al actualizar curso');
            return false;
        }
        toast.success('Curso actualizado correctamente');
        fetchCursos();
        return true;
    };

    const removeCurso = async (id) => {
        const response = await eliminarCurso(id);
        if (response.error) {
            toast.error('Error al eliminar curso');
            return false;
        }
        toast.success('Curso eliminado correctamente');
        fetchCursos();
        return true;
    };

    return {
        cursos,
        isLoading,
        fetchCursos,
        getCurso,
        addCurso,
        editCurso,
        removeCurso
    };
};