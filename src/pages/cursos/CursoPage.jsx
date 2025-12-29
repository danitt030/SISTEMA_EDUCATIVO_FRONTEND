import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useCurso } from '../../shared/hooks';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import CursoModal from '../../components/cursos/CursoModal';
import CursoDetailModal from '../../components/cursos/CursoDetailModal';
import './cursoPage.css';

const CursoPage = () => {
    const { cursos, isLoading, fetchCursos, addCurso, editCurso, removeCurso } = useCurso();
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState(null);
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
    const canEdit = isAdmin; // Solo admin puede crear/editar/eliminar cursos

    useEffect(() => {
        fetchCursos();
    }, [fetchCursos]);

    // Función para formatear el nombre del grado
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

    // Función para obtener nombre descriptivo del curso
    const getCursoNombre = (curso) => {
        return `${formatGrado(curso.grado)} "${curso.seccion}"`;
    };

    const filteredCursos = cursos.filter(curso => 
        formatGrado(curso.grado)?.toLowerCase().includes(search.toLowerCase()) ||
        curso.seccion?.toLowerCase().includes(search.toLowerCase()) ||
        curso.nivel?.toLowerCase().includes(search.toLowerCase()) ||
        curso.cicloEscolar?.includes(search)
    );

    const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);
    const paginatedCursos = filteredCursos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { 
            header: 'Nivel', 
            accessor: 'nivel',
            render: (value) => (
                <span className={`badge-nivel badge-${value?.toLowerCase()}`}>
                    {value}
                </span>
            )
        },
        { 
            header: 'Grado', 
            accessor: 'grado',
            render: (value) => formatGrado(value)
        },
        { header: 'Sección', accessor: 'seccion' },
        { 
            header: 'Jornada', 
            accessor: 'jornada',
            render: (value) => value?.charAt(0) + value?.slice(1).toLowerCase()
        },
        { header: 'Ciclo', accessor: 'cicloEscolar' },
        {
            header: 'Coordinador',
            accessor: 'coordinador',
            render: (value) => {
                if (!value) return <span className="text-muted">Sin asignar</span>;
                if (typeof value === 'object') {
                    return `${value.name || ''} ${value.surname || ''}`.trim() || value.username;
                }
                return value;
            }
        },
        {
            header: 'Profesor',
            accessor: 'profesor',
            render: (value) => {
                if (!value) return <span className="text-muted">Sin asignar</span>;
                if (typeof value === 'object') {
                    return `${value.name || ''} ${value.surname || ''}`.trim() || value.username;
                }
                return value;
            }
        }
    ];

    const handleCreate = () => {
        setSelectedCurso(null);
        setShowModal(true);
    };

    const handleEdit = (curso) => {
        setSelectedCurso(curso);
        setShowModal(true);
    };

    const handleView = (curso) => {
        setSelectedCurso(curso);
        setShowDetailModal(true);
    };

    const handleDelete = (curso) => {
        setSelectedCurso(curso);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedCurso) {
            setIsDeleting(true);
            await removeCurso(selectedCurso.cid);
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedCurso(null);
        }
    };

    const handleSave = async (cursoData) => {
        let success;
        if (selectedCurso) {
            success = await editCurso(selectedCurso.cid, cursoData);
        } else {
            success = await addCurso(cursoData);
        }
        if (success) {
            setShowModal(false);
            setSelectedCurso(null);
        }
        return success;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCurso(null);
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
        if (userRole === 'PROFESOR_ROLE') return 'Mis Cursos Asignados';
        if (userRole === 'COORDINADOR_ROLE') return 'Cursos que Coordino';
        return 'Gestión de Cursos';
    };

    const getPageSubtitle = () => {
        if (userRole === 'PROFESOR_ROLE') return 'Cursos donde tienes materias asignadas';
        if (userRole === 'COORDINADOR_ROLE') return 'Cursos bajo tu coordinación';
        return 'Administra los cursos del sistema educativo';
    };

    return (
        <div className="curso-page">
            <div className="curso-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{getPageTitle()}</h1>
                        <p className="page-subtitle">{getPageSubtitle()}</p>
                    </div>
                    {canEdit && (
                        <Button variant="primary" icon={Plus} onClick={handleCreate}>
                            Nuevo Curso
                        </Button>
                    )}
                </div>

                <div className="page-toolbar">
                    <SearchBar 
                        value={search} 
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                        placeholder="Buscar por nivel, grado, sección o ciclo..."
                    />
                    <div className="toolbar-info">
                        <span className="total-count">{filteredCursos.length} cursos encontrados</span>
                    </div>
                </div>

                {isLoading ? (
                    <Loader text="Cargando cursos..." />
                ) : (
                    <>
                        <Table 
                            columns={columns} 
                            data={paginatedCursos} 
                            actions={actions}
                            emptyMessage="No se encontraron cursos"
                        />
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <CursoModal 
                isOpen={showModal}
                onClose={handleCloseModal}
                curso={selectedCurso}
                onSave={handleSave}
            />

            <CursoDetailModal 
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedCurso(null);
                }}
                curso={selectedCurso}
            />

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCurso(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Curso"
                message={`¿Estás seguro de eliminar el curso "${selectedCurso ? getCursoNombre(selectedCurso) : ''}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                loading={isDeleting}
            />
        </div>
    );
};

export default CursoPage;