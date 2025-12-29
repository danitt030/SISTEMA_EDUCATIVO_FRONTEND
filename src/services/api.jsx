import axios from "axios";

const api = axios.create({
    baseURL: "https://sistema-educativo-backend.vercel.app/sistemaEducativo/v1",
    timeout: 5000,
    httpsAgent: false
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const userDetails = localStorage.getItem("user");

        if (userDetails) {
            try {
                const parsedUser = JSON.parse(userDetails);
                if (parsedUser?.token) {
                    config.headers.Authorization = `Bearer ${parsedUser.token}`;
                }
            } catch (err) {
                console.error("Error al parsear el token:", err);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401 &&
            !window.location.pathname.includes('/auth') &&
            error.response.data?.message?.includes('token')) {

            localStorage.removeItem('user');
            window.location.href = '/auth';
        }

        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const login = async (data) => {
    try {
        return await api.post("/auth/login", data);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const register = async (data) => {
    try {
        return await api.post("/auth/register", data);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

// ==================== USERS ====================
export const getAllUsers = async (filters = {}) => {
    try {
        // Si hay filtro por role, usar la ruta específica
        if (filters.role) {
            const response = await api.get(`/users/role/${filters.role}`);
            return response;
        }

        const queryParams = new URLSearchParams();
        if (filters.nombre) queryParams.append('nombre', filters.nombre);
        if (filters.desde) queryParams.append('desde', filters.desde);
        if (filters.limite) queryParams.append('limite', filters.limite);

        const queryString = queryParams.toString();
        const url = queryString ? `/users?${queryString}` : '/users';

        const response = await api.get(url);
        return response;
    } catch (err) {
        console.error('Error en getAllUsers:', err.response?.data || err.message);
        return {
            error: true,
            err
        };
    }
};

export const getUserById = async (uid) => {
    try {
        return await api.get(`/users/${uid}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getUsersByRole = async (role) => {
    try {
        return await api.get(`/users/role/${role}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const updateUser = async (uid, userData) => {
    try {
        return await api.put(`/users/${uid}`, userData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const updatePassword = async (uid, passwordData) => {
    try {
        return await api.patch(`/users/password/${uid}`, passwordData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const updateRole = async (uid, roleData) => {
    try {
        return await api.patch(`/users/role/${uid}`, roleData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const deleteUser = async (uid) => {
    try {
        return await api.delete(`/users/${uid}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const deleteAccount = async (uid) => {
    try {
        return await api.delete(`/users/account/${uid}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

// ==================== CURSOS ====================
export const getAllCursos = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.nivel) queryParams.append('nivel', filters.nivel);
        if (filters.grado) queryParams.append('grado', filters.grado);
        if (filters.desde) queryParams.append('desde', filters.desde);
        if (filters.limite) queryParams.append('limite', filters.limite);

        const queryString = queryParams.toString();
        const url = queryString ? `/cursos?${queryString}` : '/cursos';

        return await api.get(url);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursoById = async (id) => {
    try {
        return await api.get(`/cursos/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosPorNivel = async (nivel) => {
    try {
        return await api.get(`/cursos/nivel/${nivel}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosPorGrado = async (grado) => {
    try {
        return await api.get(`/cursos/grado/${grado}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosPorCiclo = async (ciclo) => {
    try {
        return await api.get(`/cursos/ciclo/${ciclo}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosPorCoordinador = async (uid) => {
    try {
        return await api.get(`/cursos/coordinador/${uid}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosPorProfesor = async (uid) => {
    try {
        return await api.get(`/cursos/profesor/${uid}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const crearCurso = async (cursoData) => {
    try {
        return await api.post("/cursos/crearCurso", cursoData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const actualizarCurso = async (id, cursoData) => {
    try {
        return await api.put(`/cursos/${id}`, cursoData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const asignarCoordinador = async (id, coordinadorData) => {
    try {
        return await api.patch(`/cursos/asignar-coordinador/${id}`, coordinadorData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const eliminarCurso = async (id) => {
    try {
        return await api.delete(`/cursos/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

// ==================== MATERIAS ====================
export const getAllMaterias = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.cursoId) queryParams.append('cursoId', filters.cursoId);
        if (filters.desde) queryParams.append('desde', filters.desde);
        if (filters.limite) queryParams.append('limite', filters.limite);

        const queryString = queryParams.toString();
        const url = queryString ? `/materias?${queryString}` : '/materias';

        return await api.get(url);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getMateriaById = async (id) => {
    try {
        return await api.get(`/materias/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getMateriasPorCurso = async (cursoId) => {
    try {
        return await api.get(`/materias/curso/${cursoId}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getMateriasPorProfesor = async (uid) => {
    try {
        return await api.get(`/materias/profesor/${uid}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const crearMateria = async (materiaData) => {
    try {
        return await api.post("/materias/crearMateria", materiaData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const actualizarMateria = async (id, materiaData) => {
    try {
        return await api.put(`/materias/${id}`, materiaData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const asignarProfesor = async (id, profesorData) => {
    try {
        return await api.patch(`/materias/asignar-profesor/${id}`, profesorData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const eliminarMateria = async (id) => {
    try {
        return await api.delete(`/materias/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

// ==================== CALIFICACIONES ====================
export const getAllCalificaciones = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.cursoId) queryParams.append('cursoId', filters.cursoId);
        if (filters.materiaId) queryParams.append('materiaId', filters.materiaId);
        if (filters.bimestre) queryParams.append('bimestre', filters.bimestre);
        if (filters.desde) queryParams.append('desde', filters.desde);
        if (filters.limite) queryParams.append('limite', filters.limite);

        const queryString = queryParams.toString();
        const url = queryString ? `/calificaciones?${queryString}` : '/calificaciones';

        return await api.get(url);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCalificacionById = async (id) => {
    try {
        return await api.get(`/calificaciones/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCalificacionesPorEstudiante = async (uid, ciclo) => {
    try {
        return await api.get(`/calificaciones/estudiante/${uid}/${ciclo}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getBoletaPDF = async (uid, ciclo) => {
    try {
        return await api.get(`/calificaciones/boleta/${uid}/${ciclo}`, {
            responseType: 'blob'
        });
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCuadroNotas = async (cursoId, materiaId, bimestre) => {
    try {
        return await api.get(`/calificaciones/cuadro/${cursoId}/${materiaId}/${bimestre}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const registrarCalificacion = async (calificacionData) => {
    try {
        return await api.post("/calificaciones/registrar", calificacionData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const editarCalificacion = async (id, calificacionData) => {
    try {
        return await api.put(`/calificaciones/${id}`, calificacionData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const eliminarCalificacion = async (id) => {
    try {
        return await api.delete(`/calificaciones/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

// ==================== ASIGNACIÓN ESTUDIANTE ====================
export const getAllAsignaciones = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.cursoId) queryParams.append('cursoId', filters.cursoId);
        if (filters.ciclo) queryParams.append('ciclo', filters.ciclo);
        if (filters.desde) queryParams.append('desde', filters.desde);
        if (filters.limite) queryParams.append('limite', filters.limite);

        const queryString = queryParams.toString();
        const url = queryString ? `/asignaciones?${queryString}` : '/asignaciones';

        return await api.get(url);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getAsignacionById = async (id) => {
    try {
        return await api.get(`/asignaciones/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getEstudiantesPorCurso = async (cursoId) => {
    try {
        return await api.get(`/asignaciones/curso/${cursoId}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getCursosDeEstudiante = async (uid) => {
    try {
        return await api.get(`/asignaciones/estudiante/${uid}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const getEstudiantesPorEncargado = async (uid) => {
    try {
        return await api.get(`/asignaciones/encargado/${uid}?limite=1000`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const inscribirEstudiante = async (asignacionData) => {
    try {
        return await api.post("/asignaciones/inscribir", asignacionData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const actualizarAsignacion = async (id, asignacionData) => {
    try {
        return await api.put(`/asignaciones/${id}`, asignacionData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const cambiarCurso = async (id, cursoData) => {
    try {
        return await api.patch(`/asignaciones/cambiar-curso/${id}`, cursoData);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};

export const eliminarAsignacion = async (id) => {
    try {
        return await api.delete(`/asignaciones/${id}`);
    } catch (err) {
        return {
            error: true,
            err
        };
    }
};