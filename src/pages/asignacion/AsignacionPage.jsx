import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useAsignacion, useCurso } from '../../shared/hooks';
import { getAllUsers } from '../../services';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import AsignacionModal from '../../components/asignacion/AsignacionModal';
import AsignacionDetailModal from '../../components/asignacion/AsignacionDetailModal';
import './asignacionPage.css';

const AsignacionPage = () => {
    const { asignaciones, isLoading, fetchAsignaciones, addAsignacion, editAsignacion, removeAsignacion, toggleAsignacionStatus } = useAsignacion();
    const { cursos, fetchCursos } = useCurso();
    const [estudiantes, setEstudiantes] = useState([]);
    const [encargados, setEncargados] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAsignacion, setSelectedAsignacion] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;

    // Obtener rol del usuario
    const getUserRole = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.role;
        }
        return null;
    };

    const userRole = getUserRole();
    const isAdmin = userRole === 'ADMIN_ROLE';
    const isCoordinador = userRole === 'COORDINADOR_ROLE';
    const canEdit = isAdmin || isCoordinador;

    useEffect(() => {
        fetchAsignaciones();
        fetchCursos();
        // Cargar usuarios
        const loadUsers = async () => {
            const response = await getAllUsers();
            if (!response.error) {
                const users = response.data?.users || response.data || [];
                setEstudiantes(users.filter(u => u.role === 'ALUMNO_ROLE'));
                setEncargados(users.filter(u => u.role === 'PADRE_ROLE'));
            }
        };
        loadUsers();
    }, [fetchAsignaciones, fetchCursos]);

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

    const getCursoName = (curso) => {
        if (!curso) return 'Sin asignar';
        if (typeof curso === 'object') {
            return `${formatGrado(curso.grado)} "${curso.seccion}"`;
        }
        const cursoObj = cursos.find(c => c.cid === curso);
        return cursoObj ? `${formatGrado(cursoObj.grado)} "${cursoObj.seccion}"` : 'Sin asignar';
    };

    const getEncargadoName = (encargado) => {
        if (!encargado) return 'Sin asignar';
        if (typeof encargado === 'object') {
            return `${encargado.name || ''} ${encargado.surname || ''}`.trim() || 'Sin nombre';
        }
        const enc = encargados.find(e => e.uid === encargado);
        return enc ? `${enc.name || ''} ${enc.surname || ''}`.trim() : 'Sin asignar';
    };

    const filteredAsignaciones = asignaciones.filter(asig => {
        const estudianteName = getEstudianteName(asig.estudiante).toLowerCase();
        const cursoName = getCursoName(asig.curso).toLowerCase();
        const ciclo = asig.cicloEscolar?.toLowerCase() || '';
        return estudianteName.includes(search.toLowerCase()) || 
               cursoName.includes(search.toLowerCase()) ||
               ciclo.includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(filteredAsignaciones.length / itemsPerPage);
    const paginatedAsignaciones = filteredAsignaciones.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleToggleStatus = async (asignacion) => {
        await toggleAsignacionStatus(asignacion.aid, asignacion.status);
    };

    const columns = [
        { 
            header: 'Estudiante', 
            accessor: 'estudiante',
            render: (value) => getEstudianteName(value)
        },
        { 
            header: 'Curso', 
            accessor: 'curso',
            render: (value) => getCursoName(value)
        },
        { 
            header: 'Encargado', 
            accessor: 'encargado',
            render: (value) => getEncargadoName(value)
        },
        { 
            header: 'Ciclo Escolar', 
            accessor: 'cicloEscolar'
        },
        {
            header: 'Becado',
            accessor: 'becado',
            render: (value) => (
                <span className={`badge-role ${value ? 'badge-becado' : 'badge-no-becado'}`}>
                    {value ? 'Sí' : 'No'}
                </span>
            )
        },
        {
            header: 'Estado',
            accessor: 'status',
            render: (value, row) => (
                <span 
                    className={`badge-role badge-status-toggle ${value ? 'badge-active' : 'badge-inactive'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isAdmin) {
                            handleToggleStatus(row);
                        }
                    }}
                    title={isAdmin ? 'Clic para cambiar estado' : ''}
                    style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                >
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    const handleCreate = () => {
        setSelectedAsignacion(null);
        setShowModal(true);
    };

    const handleEdit = (asignacion) => {
        setSelectedAsignacion(asignacion);
        setShowModal(true);
    };

    const handleView = (asignacion) => {
        setSelectedAsignacion(asignacion);
        setShowDetailModal(true);
    };

    const handleDelete = (asignacion) => {
        setSelectedAsignacion(asignacion);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedAsignacion) {
            setIsDeleting(true);
            await removeAsignacion(selectedAsignacion.aid);
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedAsignacion(null);
        }
    };

    const handleSave = async (asignacionData) => {
        let success;
        if (selectedAsignacion) {
            success = await editAsignacion(selectedAsignacion.aid, asignacionData);
        } else {
            success = await addAsignacion(asignacionData);
        }
        if (success) {
            setShowModal(false);
            setSelectedAsignacion(null);
        }
        return success;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAsignacion(null);
    };

    const actions = (row) => (
        <>
            <Button 
                variant="info" 
                size="sm" 
                icon={Eye}
                onClick={() => handleView(row)}
            />
            {canEdit && (
                <Button 
                    variant="warning" 
                    size="sm" 
                    icon={Edit2}
                    onClick={() => handleEdit(row)}
                />
            )}
            {isAdmin && (
                <Button 
                    variant="danger" 
                    size="sm" 
                    icon={Trash2}
                    onClick={() => handleDelete(row)}
                />
            )}
        </>
    );

    return (
        <div className="asignacion-page">
            <div className="asignacion-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Asignación de Estudiantes</h1>
                        <p className="page-subtitle">Inscribe y gestiona estudiantes en cursos</p>
                    </div>
                    {canEdit && (
                        <Button variant="primary" icon={Plus} onClick={handleCreate}>
                            Nueva Inscripción
                        </Button>
                    )}
                </div>

                <div className="page-toolbar">
                    <SearchBar 
                        value={search} 
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                        placeholder="Buscar por estudiante, curso o ciclo..."
                    />
                    <div className="toolbar-info">
                        <span className="total-count">{filteredAsignaciones.length} inscripciones encontradas</span>
                    </div>
                </div>

                {isLoading ? (
                    <Loader text="Cargando inscripciones..." />
                ) : (
                    <>
                        <Table 
                            columns={columns} 
                            data={paginatedAsignaciones} 
                            actions={actions}
                            emptyMessage="No se encontraron inscripciones"
                        />
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <AsignacionModal 
                isOpen={showModal}
                onClose={handleCloseModal}
                asignacion={selectedAsignacion}
                estudiantes={estudiantes}
                encargados={encargados}
                cursos={cursos}
                onSave={handleSave}
            />

            <AsignacionDetailModal 
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedAsignacion(null);
                }}
                asignacion={selectedAsignacion}
            />

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAsignacion(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Inscripción"
                message="¿Estás seguro de eliminar esta inscripción? Esta acción dará de baja al estudiante."
                confirmText="Eliminar"
                loading={isDeleting}
            />
        </div>
    );
};

export default AsignacionPage;