import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useMateria, useCurso } from '../../shared/hooks';
import { getAllUsers } from '../../services';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import MateriaModal from '../../components/materias/MateriaModal';
import MateriaDetailModal from '../../components/materias/MateriaDetailModal';
import './materiaPage.css';

const MateriaPage = () => {
    const { materias, isLoading, fetchMaterias, addMateria, editMateria, removeMateria, toggleMateriaStatus } = useMateria();
    const { cursos, fetchCursos } = useCurso();
    const [profesores, setProfesores] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
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
    const canEdit = isAdmin;

    useEffect(() => {
        fetchMaterias();
        fetchCursos();
        // Cargar profesores
        const loadProfesores = async () => {
            const response = await getAllUsers();
            if (!response.error) {
                const users = response.data?.users || response.data || [];
                const profs = users.filter(u => u.role === 'PROFESOR_ROLE' && u.status);
                setProfesores(profs);
            }
        };
        loadProfesores();
    }, [fetchMaterias, fetchCursos]);

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

    const filteredMaterias = materias.filter(materia => 
        materia.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        materia.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage);
    const paginatedMaterias = filteredMaterias.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getCursoName = (curso) => {
        if (!curso) return 'Sin asignar';
        if (typeof curso === 'object') {
            return `${formatGrado(curso.grado)} "${curso.seccion}"`;
        }
        const cursoObj = cursos.find(c => c.cid === curso || c._id === curso);
        return cursoObj ? `${formatGrado(cursoObj.grado)} "${cursoObj.seccion}"` : 'Sin asignar';
    };

    const getProfesorName = (profesor) => {
        if (!profesor) return <span className="text-muted">Sin asignar</span>;
        if (typeof profesor === 'object') {
            return `${profesor.name || ''} ${profesor.surname || ''}`.trim() || profesor.username;
        }
        return profesor;
    };

    const columns = [
        { header: 'Nombre', accessor: 'nombre' },
        { 
            header: 'Descripción', 
            accessor: 'descripcion',
            render: (value) => value || '-'
        },
        { 
            header: 'Curso', 
            accessor: 'curso',
            render: (value) => getCursoName(value)
        },
        { 
            header: 'Profesor', 
            accessor: 'profesor',
            render: (value) => getProfesorName(value)
        },
        {
            header: 'Estado',
            accessor: 'status',
            render: (value, row) => (
                <span 
                    className={`badge-role badge-status-toggle ${value ? 'badge-active' : 'badge-inactive'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (canEdit) {
                            handleToggleStatus(row);
                        }
                    }}
                    title={canEdit ? 'Clic para cambiar estado' : ''}
                    style={{ cursor: canEdit ? 'pointer' : 'default' }}
                >
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    const handleCreate = () => {
        setSelectedMateria(null);
        setShowModal(true);
    };

    const handleEdit = (materia) => {
        setSelectedMateria(materia);
        setShowModal(true);
    };

    const handleView = (materia) => {
        setSelectedMateria(materia);
        setShowDetailModal(true);
    };

    const handleDelete = (materia) => {
        setSelectedMateria(materia);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedMateria) {
            setIsDeleting(true);
            await removeMateria(selectedMateria.mid);
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedMateria(null);
        }
    };

    const handleToggleStatus = async (materia) => {
        await toggleMateriaStatus(materia.mid, materia.status);
    };

    const handleSave = async (materiaData) => {
        let success;
        if (selectedMateria) {
            success = await editMateria(selectedMateria.mid, materiaData);
        } else {
            success = await addMateria(materiaData);
        }
        if (success) {
            setShowModal(false);
            setSelectedMateria(null);
        }
        return success;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMateria(null);
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
                <>
                    <Button 
                        variant="warning" 
                        size="sm" 
                        icon={Edit2}
                        onClick={() => handleEdit(row)}
                    />
                    <Button 
                        variant="danger" 
                        size="sm" 
                        icon={Trash2}
                        onClick={() => handleDelete(row)}
                    />
                </>
            )}
        </>
    );

    // Título según el rol
    const getPageTitle = () => {
        if (userRole === 'PROFESOR_ROLE') return 'Mis Materias';
        if (userRole === 'COORDINADOR_ROLE') return 'Materias del Centro';
        return 'Gestión de Materias';
    };

    const getPageSubtitle = () => {
        if (userRole === 'PROFESOR_ROLE') return 'Materias donde eres profesor asignado';
        if (userRole === 'COORDINADOR_ROLE') return 'Materias bajo tu coordinación';
        return 'Administra las materias del sistema educativo';
    };

    return (
        <div className="materia-page">
            <div className="materia-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{getPageTitle()}</h1>
                        <p className="page-subtitle">{getPageSubtitle()}</p>
                    </div>
                    {canEdit && (
                        <Button variant="primary" icon={Plus} onClick={handleCreate}>
                            Nueva Materia
                        </Button>
                    )}
                </div>

                <div className="page-toolbar">
                    <SearchBar 
                        value={search} 
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                        placeholder="Buscar por nombre o descripción..."
                    />
                    <div className="toolbar-info">
                        <span className="total-count">{filteredMaterias.length} materias encontradas</span>
                    </div>
                </div>

                {isLoading ? (
                    <Loader text="Cargando materias..." />
                ) : (
                    <>
                        <Table 
                            columns={columns} 
                            data={paginatedMaterias} 
                            actions={actions}
                            emptyMessage="No se encontraron materias"
                        />
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <MateriaModal 
                isOpen={showModal}
                onClose={handleCloseModal}
                materia={selectedMateria}
                cursos={cursos}
                profesores={profesores}
                onSave={handleSave}
            />

            <MateriaDetailModal 
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedMateria(null);
                }}
                materia={selectedMateria}
            />

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedMateria(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Materia"
                message={`¿Estás seguro de eliminar la materia "${selectedMateria?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                loading={isDeleting}
            />
        </div>
    );
};

export default MateriaPage;