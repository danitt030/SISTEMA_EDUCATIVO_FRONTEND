import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Download, FileText, User, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useCalificacion, useCurso, useMateria } from '../../shared/hooks';
import { getAllUsers, getCalificacionesPorEstudiante, getEstudiantesPorEncargado, getBoletaPDF, getMateriasPorProfesor, getEstudiantesPorCurso } from '../../services';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/ConfirmModal';
import CalificacionModal from '../../components/calificaciones/CalificacionModal';
import CalificacionDetailModal from '../../components/calificaciones/CalificacionDetailModal';
import BoletaPreviewModal from '../../components/calificaciones/BoletaPreviewModal';
import toast from 'react-hot-toast';
import './calificacionPage.css';

const CalificacionPage = () => {
    const { calificaciones, isLoading, fetchCalificaciones, addCalificacion, updateCalificacion, removeCalificacion } = useCalificacion();
    const { cursos, fetchCursos } = useCurso();
    const { materias, fetchMaterias } = useMateria();
    const [estudiantes, setEstudiantes] = useState([]);
    const [hijos, setHijos] = useState([]); // Para padres
    const [misMaterias, setMisMaterias] = useState([]); // Materias del profesor
    const [boletaData, setBoletaData] = useState(null);
    const [loadingBoleta, setLoadingBoleta] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedEstudiante, setExpandedEstudiante] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBoletaModal, setShowBoletaModal] = useState(false);
    const [selectedCalificacion, setSelectedCalificacion] = useState(null);
    const [selectedEstudiante, setSelectedEstudiante] = useState('');
    const [selectedCiclo, setSelectedCiclo] = useState(new Date().getFullYear().toString());
    const [isDeleting, setIsDeleting] = useState(false);

    // Obtener info del usuario
    const getUserInfo = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    };

    const user = getUserInfo();
    const userRole = user?.role;
    const isAdmin = userRole === 'ADMIN_ROLE';
    const isCoordinador = userRole === 'COORDINADOR_ROLE';
    const isProfesor = userRole === 'PROFESOR_ROLE';
    const isPadre = userRole === 'PADRE_ROLE';
    const isAlumno = userRole === 'ALUMNO_ROLE';
    
    const canManage = isAdmin || isProfesor;
    const canDelete = isAdmin;

    useEffect(() => {
        const loadData = async () => {
            // No cargar si no hay usuario
            if (!user?.uid) return;
            
            if (isAdmin || isCoordinador) {
                // Admin y Coordinador ven todo
                await fetchCalificaciones();
                await fetchCursos();
                await fetchMaterias();
                const response = await getAllUsers();
                if (!response.error) {
                    const users = response.data?.users || response.data || [];
                    setEstudiantes(users.filter(u => u.role === 'ALUMNO_ROLE'));
                }
            } else if (isProfesor) {
                // Profesor solo ve sus materias y estudiantes de esos cursos
                await fetchCalificaciones();
                await fetchCursos();
                
                // Obtener las materias del profesor
                const materiasResp = await getMateriasPorProfesor(user.uid);
                if (!materiasResp.error && materiasResp.data) {
                    const materiasProfesor = materiasResp.data?.materias || materiasResp.data || [];
                    setMisMaterias(materiasProfesor);
                    
                    // Obtener cursos únicos de las materias del profesor
                    const cursosIds = [...new Set(materiasProfesor.map(m => m.curso?.cid || m.curso?._id || m.curso))];
                    
                    // Obtener estudiantes de esos cursos
                    const estudiantesSet = new Map();
                    for (const cursoId of cursosIds) {
                        if (cursoId) {
                            const estResp = await getEstudiantesPorCurso(cursoId);
                            if (!estResp.error && estResp.data) {
                                const estudiantesCurso = estResp.data?.estudiantes || estResp.data || [];
                                estudiantesCurso.forEach(asig => {
                                    const est = asig.estudiante;
                                    if (est) {
                                        const estId = est._id || est.uid;
                                        if (!estudiantesSet.has(estId)) {
                                            estudiantesSet.set(estId, est);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    setEstudiantes(Array.from(estudiantesSet.values()));
                }
                
                await fetchMaterias(); // Esto cargará solo las materias visibles para profesor
            } else if (isPadre) {
                // Cargar hijos del padre
                const response = await getEstudiantesPorEncargado(user.uid);
                if (!response.error && response.data) {
                    const hijosData = response.data?.hijos || response.data?.asignaciones || response.data || [];
                    const estudiantesUnicos = [];
                    const idsVistos = new Set();
                    hijosData.forEach(asig => {
                        const est = asig.estudiante;
                        if (est && !idsVistos.has(est._id || est.uid)) {
                            idsVistos.add(est._id || est.uid);
                            estudiantesUnicos.push(est);
                        }
                    });
                    setHijos(estudiantesUnicos);
                    if (estudiantesUnicos.length > 0) {
                        const primerHijo = estudiantesUnicos[0];
                        setSelectedEstudiante(primerHijo.uid || primerHijo._id);
                    }
                }
            } else if (isAlumno) {
                setSelectedEstudiante(user.uid);
            }
        };
        loadData();
    }, [isAdmin, isCoordinador, isProfesor, isPadre, isAlumno, user?.uid, fetchCalificaciones, fetchCursos, fetchMaterias]);

    // Cargar boleta cuando cambia el estudiante seleccionado
    useEffect(() => {
        const loadBoleta = async () => {
            if ((isPadre || isAlumno) && selectedEstudiante && selectedCiclo) {
                setLoadingBoleta(true);
                const response = await getCalificacionesPorEstudiante(selectedEstudiante, selectedCiclo);
                if (!response.error) {
                    setBoletaData(response.data);
                }
                setLoadingBoleta(false);
            }
        };
        loadBoleta();
    }, [selectedEstudiante, selectedCiclo, isPadre, isAlumno]);

    // Función para formatear el grado
    const formatGrado = (grado) => {
        const gradoMap = {
            'PARVULOS_1': 'Párvulos 1',
            'PARVULOS_2': 'Párvulos 2',
            'PARVULOS_3': 'Párvulos 3',
            'PREPARATORIA': 'Preparatoria',
            'PRIMERO_PRIMARIA': '1° Primaria',
            'SEGUNDO_PRIMARIA': '2° Primaria',
            'TERCERO_PRIMARIA': '3° Primaria',
            'CUARTO_PRIMARIA': '4° Primaria',
            'QUINTO_PRIMARIA': '5° Primaria',
            'SEXTO_PRIMARIA': '6° Primaria',
            'PRIMERO_BASICO': '1° Básico',
            'SEGUNDO_BASICO': '2° Básico',
            'TERCERO_BASICO': '3° Básico'
        };
        return gradoMap[grado] || grado;
    };

    const getEstudianteName = (estudiante) => {
        if (!estudiante) return 'Sin asignar';
        if (typeof estudiante === 'object') {
            return `${estudiante.name || ''} ${estudiante.surname || ''}`.trim() || 'Sin nombre';
        }
        const est = estudiantes.find(e => e.uid === estudiante);
        return est ? `${est.name || ''} ${est.surname || ''}`.trim() : 'Sin asignar';
    };

    const getMateriaName = (materia) => {
        if (!materia) return 'Sin asignar';
        if (typeof materia === 'object') {
            return materia.nombre || 'Sin nombre';
        }
        const mat = materias.find(m => m.mid === materia);
        return mat?.nombre || 'Sin asignar';
    };

    const getCursoName = (curso) => {
        if (!curso) return 'Sin asignar';
        
        if (typeof curso === 'object') {
            // Si el objeto curso tiene grado, usarlo directamente
            if (curso.grado) {
                return `${formatGrado(curso.grado)} "${curso.seccion || ''}"`;
            }
            // Si no tiene grado, buscar en la lista de cursos por _id o cid
            const cursoId = curso._id || curso.cid;
            if (cursoId) {
                const cursoCompleto = cursos.find(c => c.cid === cursoId || c._id === cursoId);
                if (cursoCompleto) {
                    return `${formatGrado(cursoCompleto.grado)} "${cursoCompleto.seccion || ''}"`;
                }
            }
            // Si tiene seccion pero no grado
            return curso.seccion ? `Sección "${curso.seccion}"` : 'Sin asignar';
        }
        
        // Si es solo un ID string, buscar en la lista
        const cursoObj = cursos.find(c => c.cid === curso || c._id === curso);
        if (cursoObj) {
            return `${formatGrado(cursoObj.grado)} "${cursoObj.seccion}"`;
        }
        return 'Sin asignar';
    };

    const filteredCalificaciones = calificaciones.filter(cal => {
        const estudianteName = getEstudianteName(cal.estudiante).toLowerCase();
        const materiaName = getMateriaName(cal.materia).toLowerCase();
        
        // Filtro de búsqueda
        const matchesSearch = estudianteName.includes(search.toLowerCase()) || 
               materiaName.includes(search.toLowerCase());
        
        // Si es profesor, solo mostrar calificaciones de SUS materias
        if (isProfesor && misMaterias.length > 0) {
            const misMateriasIds = misMaterias.map(m => m.mid || m._id);
            const calMateriaId = cal.materia?.mid || cal.materia?._id || cal.materia;
            const esMiMateria = misMateriasIds.includes(calMateriaId);
            return matchesSearch && esMiMateria;
        }
        
        return matchesSearch;
    });

    // Obtener cursos del profesor basados en sus materias
    const misCursos = isProfesor 
        ? cursos.filter(curso => {
            const cursosDeProfesor = [...new Set(misMaterias.map(m => m.curso?.cid || m.curso?._id || m.curso))];
            return cursosDeProfesor.includes(curso.cid) || cursosDeProfesor.includes(curso._id);
        })
        : cursos;

    // Agrupar calificaciones por estudiante
    const calificacionesPorEstudiante = {};
    filteredCalificaciones.forEach(cal => {
        const estId = cal.estudiante?._id || cal.estudiante?.uid || cal.estudiante;
        if (!calificacionesPorEstudiante[estId]) {
            calificacionesPorEstudiante[estId] = {
                estudiante: cal.estudiante,
                calificaciones: []
            };
        }
        calificacionesPorEstudiante[estId].calificaciones.push(cal);
    });

    const estudiantesConCalificaciones = Object.values(calificacionesPorEstudiante);

    const getNotaBadge = (nota) => {
        if (nota >= 80) return 'badge-success';
        if (nota >= 60) return 'badge-warning';
        return 'badge-danger';
    };

    const toggleExpandEstudiante = (estId) => {
        setExpandedEstudiante(expandedEstudiante === estId ? null : estId);
    };

    const handleCreate = () => {
        setSelectedCalificacion(null);
        setShowModal(true);
    };

    // Verificar si una calificación pertenece a las materias del profesor
    const esMiMateriaCalificacion = (calificacion) => {
        if (!isProfesor || misMaterias.length === 0) return true;
        const misMateriasIds = misMaterias.map(m => m.mid || m._id);
        const calMateriaId = calificacion?.materia?.mid || calificacion?.materia?._id || calificacion?.materia;
        return misMateriasIds.includes(calMateriaId);
    };

    const handleEdit = (calificacion) => {
        // Verificar si el profesor puede editar esta calificación
        if (isProfesor && !esMiMateriaCalificacion(calificacion)) {
            toast.error('No puedes editar calificaciones de materias que no impartes');
            return;
        }
        setSelectedCalificacion(calificacion);
        setShowModal(true);
    };

    const handleView = (calificacion) => {
        setSelectedCalificacion(calificacion);
        setShowDetailModal(true);
    };

    const handleDelete = (calificacion) => {
        setSelectedCalificacion(calificacion);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedCalificacion) {
            setIsDeleting(true);
            await removeCalificacion(selectedCalificacion.cid);
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedCalificacion(null);
        }
    };

    const handleSave = async (calificacionData) => {
        let success;
        if (selectedCalificacion) {
            success = await updateCalificacion(selectedCalificacion.cid, calificacionData);
        } else {
            success = await addCalificacion(calificacionData);
        }
        if (success) {
            setShowModal(false);
            setSelectedCalificacion(null);
        }
        return success;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCalificacion(null);
    };

    // Función helper para formatear el nombre del archivo
    const formatFileName = (estudianteData, ciclo) => {
        let nombreCompleto = 'ESTUDIANTE';
        if (estudianteData) {
            const nombre = (estudianteData.name || estudianteData.nombre || '').trim();
            const apellido = (estudianteData.surname || estudianteData.apellido || '').trim();
            nombreCompleto = `${nombre}_${apellido}`.trim().replace(/\s+/g, '_').toUpperCase();
        }
        return `BOLETA_${nombreCompleto}_${ciclo}.pdf`;
    };

    const handleDownloadPDF = async () => {
        if (!selectedEstudiante || !selectedCiclo) {
            toast.error('Selecciona un estudiante y ciclo escolar');
            return;
        }
        
        try {
            toast.loading('Generando boleta PDF...');
            const response = await getBoletaPDF(selectedEstudiante, selectedCiclo);
            
            if (response.error) {
                toast.dismiss();
                toast.error('Error al generar la boleta');
                return;
            }
            
            // Obtener datos del estudiante para el nombre del archivo
            const estudianteData = hijos.find(h => (h.uid || h._id) === selectedEstudiante) || 
                                   estudiantes.find(e => (e.uid || e._id) === selectedEstudiante) ||
                                   (isAlumno ? user : null);
            
            // Crear blob y descargar
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = formatFileName(estudianteData, selectedCiclo);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.dismiss();
            toast.success('Boleta descargada correctamente');
        } catch {
            toast.dismiss();
            toast.error('Error al descargar la boleta');
        }
    };

    const handleViewBoleta = () => {
        if (boletaData) {
            setShowBoletaModal(true);
        }
    };

    // Función para ver boleta de un estudiante específico (para Admin)
    const handleViewBoletaEstudiante = async (estudianteId) => {
        if (!estudianteId) return;
        
        setSelectedEstudiante(estudianteId);
        setLoadingBoleta(true);
        
        const response = await getCalificacionesPorEstudiante(estudianteId, selectedCiclo);
        if (!response.error) {
            setBoletaData(response.data);
            setShowBoletaModal(true);
        } else {
            toast.error('No se encontraron calificaciones para este estudiante');
        }
        setLoadingBoleta(false);
    };

    // Función para descargar boleta de un estudiante específico (para Admin)
    const handleDownloadBoletaEstudiante = async (estudianteId) => {
        if (!estudianteId) return;
        
        try {
            toast.loading('Generando boleta PDF...');
            const response = await getBoletaPDF(estudianteId, selectedCiclo);
            
            if (response.error) {
                toast.dismiss();
                toast.error('Error al generar la boleta');
                return;
            }
            
            // Obtener datos del estudiante para el nombre del archivo
            const estudianteData = estudiantes.find(e => (e.uid || e._id) === estudianteId) ||
                                   hijos.find(h => (h.uid || h._id) === estudianteId) ||
                                   boletaData?.estudiante;
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = formatFileName(estudianteData, selectedCiclo);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.dismiss();
            toast.success('Boleta descargada correctamente');
        } catch {
            toast.dismiss();
            toast.error('Error al descargar la boleta');
        }
    };

    // Opciones de ciclo escolar
    const cicloOptions = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        cicloOptions.push({ value: year.toString(), label: year.toString() });
    }

    // Vista para Padres y Alumnos - Boleta
    if (isPadre || isAlumno) {
        const hijosOptions = hijos.map(h => ({
            value: h.uid || h._id,
            label: `${h.name || ''} ${h.surname || ''}`.trim()
        }));

        return (
            <div className="calificacion-page">
                <div className="calificacion-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">
                                {isPadre ? 'Calificaciones de mis hijos' : 'Mi Boleta de Calificaciones'}
                            </h1>
                            <p className="page-subtitle">
                                Consulta el rendimiento académico del ciclo escolar
                            </p>
                        </div>
                        <div className="header-actions">
                            <Button 
                                variant="secondary" 
                                icon={FileText}
                                onClick={handleViewBoleta}
                                disabled={!boletaData}
                            >
                                Ver Boleta
                            </Button>
                            <Button 
                                variant="primary" 
                                icon={Download}
                                onClick={handleDownloadPDF}
                                disabled={!selectedEstudiante}
                            >
                                Descargar PDF
                            </Button>
                        </div>
                    </div>

                    <div className="boleta-filters">
                        {isPadre && hijos.length > 1 && (
                            <div className="filter-group">
                                <label>Seleccionar hijo:</label>
                                <select 
                                    value={selectedEstudiante} 
                                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                                    className="filter-select"
                                >
                                    {hijosOptions.map(h => (
                                        <option key={h.value} value={h.value}>{h.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="filter-group">
                            <label>Ciclo Escolar:</label>
                            <select 
                                value={selectedCiclo} 
                                onChange={(e) => setSelectedCiclo(e.target.value)}
                                className="filter-select"
                            >
                                {cicloOptions.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loadingBoleta ? (
                        <Loader text="Cargando calificaciones..." />
                    ) : boletaData ? (
                        <div className="boleta-container">
                            <div className="boleta-header-info">
                                <div className="estudiante-info">
                                    <h3>{boletaData.estudiante?.name} {boletaData.estudiante?.surname}</h3>
                                    <p>Código: {boletaData.estudiante?.codigoEstudiante || 'N/A'}</p>
                                </div>
                                <div className="curso-info">
                                    <p><strong>Curso:</strong> {formatGrado(boletaData.curso?.grado)} "{boletaData.curso?.seccion}"</p>
                                    <p><strong>Ciclo:</strong> {boletaData.cicloEscolar}</p>
                                </div>
                            </div>

                            <div className="boleta-table-container">
                                <table className="boleta-table">
                                    <thead>
                                        <tr>
                                            <th>Materia</th>
                                            <th>B1</th>
                                            <th>B2</th>
                                            <th>B3</th>
                                            <th>B4</th>
                                            <th>Promedio</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {boletaData.calificaciones?.map((mat, idx) => {
                                            // Extraer el total de cada bimestre (puede ser objeto {zona, examen, total} o null)
                                            const b1 = mat.bimestre1?.total ?? mat.bimestre1;
                                            const b2 = mat.bimestre2?.total ?? mat.bimestre2;
                                            const b3 = mat.bimestre3?.total ?? mat.bimestre3;
                                            const b4 = mat.bimestre4?.total ?? mat.bimestre4;
                                            
                                            return (
                                                <tr key={idx}>
                                                    <td className="materia-cell">{mat.materia}</td>
                                                    <td className={b1 >= 60 ? 'nota-aprobada' : b1 ? 'nota-reprobada' : ''}>
                                                        {b1 || '-'}
                                                    </td>
                                                    <td className={b2 >= 60 ? 'nota-aprobada' : b2 ? 'nota-reprobada' : ''}>
                                                        {b2 || '-'}
                                                    </td>
                                                    <td className={b3 >= 60 ? 'nota-aprobada' : b3 ? 'nota-reprobada' : ''}>
                                                        {b3 || '-'}
                                                    </td>
                                                    <td className={b4 >= 60 ? 'nota-aprobada' : b4 ? 'nota-reprobada' : ''}>
                                                        {b4 || '-'}
                                                    </td>
                                                    <td className={`promedio-cell ${mat.promedio >= 60 ? 'nota-aprobada' : mat.promedio ? 'nota-reprobada' : ''}`}>
                                                        <strong>{mat.promedio || '-'}</strong>
                                                    </td>
                                                    <td>
                                                        {mat.promedio !== null && (
                                                            <span className={`estado-badge ${mat.aprobado ? 'aprobado' : 'reprobado'}`}>
                                                                {mat.aprobado ? 'Aprobado' : 'Reprobado'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {boletaData.resumen && (
                                <div className="boleta-resumen">
                                    <div className="resumen-item">
                                        <span className="resumen-label">Promedio General:</span>
                                        <span className={`resumen-value ${boletaData.resumen.promedioGeneral >= 60 ? 'aprobado' : 'reprobado'}`}>
                                            {boletaData.resumen.promedioGeneral || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="resumen-item">
                                        <span className="resumen-label">Materias Aprobadas:</span>
                                        <span className="resumen-value aprobado">{boletaData.resumen.materiasAprobadas || 0}</span>
                                    </div>
                                    <div className="resumen-item">
                                        <span className="resumen-label">Materias Reprobadas:</span>
                                        <span className="resumen-value reprobado">{boletaData.resumen.materiasReprobadas || 0}</span>
                                    </div>
                                    <div className="resumen-item">
                                        <span className="resumen-label">Total Materias:</span>
                                        <span className="resumen-value">{boletaData.resumen.totalMaterias || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-boleta">
                            <FileText size={64} />
                            <h3>No hay calificaciones registradas</h3>
                            <p>No se encontraron calificaciones para el ciclo escolar seleccionado.</p>
                        </div>
                    )}
                </div>

                <BoletaPreviewModal 
                    isOpen={showBoletaModal}
                    onClose={() => setShowBoletaModal(false)}
                    boletaData={boletaData}
                    estudiante={boletaData?.estudiante || hijos.find(h => (h.uid || h._id) === selectedEstudiante)}
                    cicloEscolar={selectedCiclo}
                    onDownload={handleDownloadPDF}
                    loading={loadingBoleta}
                />
            </div>
        );
    }

    // Vista para Admin/Coordinador/Profesor
    return (
        <div className="calificacion-page">
            <div className="calificacion-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Gestión de Calificaciones</h1>
                        <p className="page-subtitle">Registra y administra las calificaciones de los estudiantes</p>
                    </div>
                    {canManage && (
                        <Button variant="primary" icon={Plus} onClick={handleCreate}>
                            Nueva Calificación
                        </Button>
                    )}
                </div>

                {/* Sección de Materias del Profesor */}
                {isProfesor && misMaterias.length > 0 && (
                    <div className="profesor-materias-section">
                        <h3><BookOpen size={20} /> Mis Materias Asignadas</h3>
                        <div className="materias-chips">
                            {misMaterias.map(mat => (
                                <div key={mat.mid || mat._id} className="materia-chip">
                                    <BookOpen size={16} />
                                    <span className="materia-chip-nombre">{mat.nombre}</span>
                                    <span className="materia-chip-curso">
                                        {formatGrado(mat.curso?.grado || '')} "{mat.curso?.seccion || ''}"
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sección para ver boletas - Solo Admin y Coordinador */}
                {(isAdmin || isCoordinador) && !isProfesor && (
                    <div className="boleta-section">
                        <h3><FileText size={20} /> Consultar Boleta de Estudiante</h3>
                        <div className="boleta-filters">
                            <div className="filter-group">
                                <label>Estudiante:</label>
                                <select 
                                    value={selectedEstudiante} 
                                    onChange={(e) => setSelectedEstudiante(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Seleccionar estudiante...</option>
                                    {estudiantes.map(est => (
                                        <option key={est.uid || est._id} value={est.uid || est._id}>
                                            {est.name} {est.surname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Ciclo Escolar:</label>
                                <select 
                                    value={selectedCiclo} 
                                    onChange={(e) => setSelectedCiclo(e.target.value)}
                                    className="filter-select"
                                >
                                    {cicloOptions.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-actions">
                                <Button 
                                    variant="secondary" 
                                    icon={FileText}
                                    onClick={() => handleViewBoletaEstudiante(selectedEstudiante)}
                                    disabled={!selectedEstudiante}
                                >
                                    Ver Boleta
                                </Button>
                                <Button 
                                    variant="primary" 
                                    icon={Download}
                                    onClick={() => handleDownloadBoletaEstudiante(selectedEstudiante)}
                                    disabled={!selectedEstudiante}
                                >
                                    Descargar PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="page-toolbar">
                    <SearchBar 
                        value={search} 
                        onChange={setSearch} 
                        placeholder="Buscar por estudiante o materia..."
                    />
                    <div className="toolbar-info">
                        <span className="total-count">
                            {estudiantesConCalificaciones.length} estudiantes • {filteredCalificaciones.length} calificaciones
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <Loader text="Cargando calificaciones..." />
                ) : estudiantesConCalificaciones.length === 0 ? (
                    <div className="empty-state">
                        <User size={64} />
                        <h3>No hay calificaciones registradas</h3>
                        <p>Aún no se han registrado calificaciones para mostrar.</p>
                    </div>
                ) : (
                    <div className="estudiantes-cards-container">
                        {estudiantesConCalificaciones.map((item) => {
                            const estudianteId = item.estudiante?._id || item.estudiante?.uid || item.estudiante;
                            const isExpanded = expandedEstudiante === estudianteId;
                            const estudianteNombre = getEstudianteName(item.estudiante);
                            
                            // Agrupar calificaciones por materia
                            const calificacionesPorMateria = {};
                            item.calificaciones.forEach(cal => {
                                const materiaId = cal.materia?._id || cal.materia?.mid || cal.materia;
                                const materiaNombre = getMateriaName(cal.materia);
                                if (!calificacionesPorMateria[materiaId]) {
                                    calificacionesPorMateria[materiaId] = {
                                        nombre: materiaNombre,
                                        curso: cal.curso,
                                        bimestres: {}
                                    };
                                }
                                calificacionesPorMateria[materiaId].bimestres[cal.bimestre] = {
                                    zona: cal.zona,
                                    examen: cal.examen,
                                    total: cal.total,
                                    cid: cal.cid,
                                    fullData: cal
                                };
                            });

                            // Calcular promedio general del estudiante
                            const totales = item.calificaciones.map(c => c.total).filter(t => t !== undefined);
                            const promedio = totales.length > 0 
                                ? Math.round(totales.reduce((a, b) => a + b, 0) / totales.length) 
                                : 0;

                            return (
                                <div key={estudianteId} className={`estudiante-card ${isExpanded ? 'expanded' : ''}`}>
                                    <div 
                                        className="estudiante-card-header"
                                        onClick={() => toggleExpandEstudiante(estudianteId)}
                                    >
                                        <div className="estudiante-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="estudiante-info">
                                            <h3 className="estudiante-nombre">{estudianteNombre}</h3>
                                            <p className="estudiante-meta">
                                                {item.calificaciones.length} calificaciones • Ciclo {item.calificaciones[0]?.cicloEscolar || selectedCiclo}
                                            </p>
                                        </div>
                                        <div className="estudiante-promedio">
                                            <span className={`promedio-badge ${getNotaBadge(promedio)}`}>
                                                {promedio}
                                            </span>
                                            <span className="promedio-label">Promedio</span>
                                        </div>
                                        <div className="expand-icon">
                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="estudiante-card-content">
                                            {/* Botones de boleta solo para Admin y Coordinador */}
                                            {(isAdmin || isCoordinador) && (
                                                <div className="estudiante-actions-bar">
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm"
                                                        icon={FileText}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewBoletaEstudiante(estudianteId);
                                                        }}
                                                    >
                                                        Ver Boleta
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        icon={Download}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadBoletaEstudiante(estudianteId);
                                                        }}
                                                    >
                                                        Descargar PDF
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="materias-grid">
                                                {Object.entries(calificacionesPorMateria).map(([materiaId, materia]) => (
                                                    <div key={materiaId} className="materia-card">
                                                        <div className="materia-card-header">
                                                            <BookOpen size={18} />
                                                            <span className="materia-nombre">{materia.nombre}</span>
                                                            <span className="curso-badge">{getCursoName(materia.curso)}</span>
                                                        </div>
                                                        <div className="bimestres-container">
                                                            {[1, 2, 3, 4].map(bim => {
                                                                const bimestreData = materia.bimestres[bim];
                                                                return (
                                                                    <div key={bim} className={`bimestre-item ${bimestreData ? '' : 'sin-nota'}`}>
                                                                        <span className="bimestre-label">B{bim}</span>
                                                                        {bimestreData ? (
                                                                            <>
                                                                                <div className="notas-detalle">
                                                                                    <span className="nota-zona" title="Zona">Z: {bimestreData.zona}</span>
                                                                                    <span className="nota-examen" title="Examen">E: {bimestreData.examen}</span>
                                                                                </div>
                                                                                <span className={`nota-total ${getNotaBadge(bimestreData.total)}`}>
                                                                                    {bimestreData.total}
                                                                                </span>
                                                                                <div className="bimestre-actions">
                                                                                    <button 
                                                                                        className="action-btn view"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleView(bimestreData.fullData);
                                                                                        }}
                                                                                        title="Ver detalles"
                                                                                    >
                                                                                        <Eye size={14} />
                                                                                    </button>
                                                                                    {canManage && (!isProfesor || esMiMateriaCalificacion(bimestreData.fullData)) && (
                                                                                        <button 
                                                                                            className="action-btn edit"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleEdit(bimestreData.fullData);
                                                                                            }}
                                                                                            title="Editar"
                                                                                        >
                                                                                            <Edit2 size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                    {canDelete && (
                                                                                        <button 
                                                                                            className="action-btn delete"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleDelete(bimestreData.fullData);
                                                                                            }}
                                                                                            title="Eliminar"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <span className="sin-calificacion">-</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {canManage && (
                <CalificacionModal 
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    calificacion={selectedCalificacion}
                    estudiantes={estudiantes}
                    materias={isProfesor ? misMaterias : materias}
                    cursos={isProfesor ? misCursos : cursos}
                    onSave={handleSave}
                />
            )}

            <CalificacionDetailModal 
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedCalificacion(null);
                }}
                calificacion={selectedCalificacion}
            />

            {canDelete && (
                <ConfirmModal 
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedCalificacion(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Eliminar Calificación"
                    message="¿Estás seguro de eliminar esta calificación? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    loading={isDeleting}
                />
            )}

            {/* Modal de boleta para Admin/Coordinador */}
            <BoletaPreviewModal 
                isOpen={showBoletaModal}
                onClose={() => {
                    setShowBoletaModal(false);
                    setBoletaData(null);
                }}
                boletaData={boletaData}
                estudiante={boletaData?.estudiante || estudiantes.find(e => e.uid === selectedEstudiante)}
                cicloEscolar={selectedCiclo}
                onDownload={() => handleDownloadBoletaEstudiante(selectedEstudiante)}
                loading={loadingBoleta}
            />
        </div>
    );
};

export default CalificacionPage;