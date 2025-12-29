import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Plus } from 'lucide-react';
import { useUser } from '../../shared/hooks';
import { register } from '../../services';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import UserModal from '../../components/usuarios/UserModal';
import UserDetailModal from '../../components/usuarios/UserDetailModal';
import toast from 'react-hot-toast';
import './userPage.css';

const UserPage = () => {
    const { users, isLoading, fetchUsers, editUser, removeUser, toggleUserStatus } = useUser();
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Función para obtener nombre completo
    const getFullName = (user) => {
        return `${user.name || ''} ${user.surname || ''}`.trim() || 'Sin nombre';
    };

    const filteredUsers = users.filter(user => {
        const fullName = getFullName(user).toLowerCase();
        return fullName.includes(search.toLowerCase()) ||
            user.username?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getRoleBadge = (role) => {
        const roleMap = {
            'ADMIN_ROLE': { label: 'Admin', class: 'badge-admin' },
            'COORDINADOR_ROLE': { label: 'Coordinador', class: 'badge-coordinador' },
            'PROFESOR_ROLE': { label: 'Profesor', class: 'badge-profesor' },
            'PADRE_ROLE': { label: 'Padre', class: 'badge-padre' },
            'ALUMNO_ROLE': { label: 'Alumno', class: 'badge-alumno' },
        };
        const roleInfo = roleMap[role] || { label: role, class: 'badge-secondary' };
        return <span className={`badge-role ${roleInfo.class}`}>{roleInfo.label}</span>;
    };

    const columns = [
        { 
            header: 'Nombre', 
            accessor: 'name',
            render: (value, row) => getFullName(row)
        },
        { header: 'Usuario', accessor: 'username' },
        { header: 'Email', accessor: 'email' },
        { 
            header: 'Rol', 
            accessor: 'role',
            render: (value) => getRoleBadge(value)
        },
        {
            header: 'Estado',
            accessor: 'status',
            render: (value, row) => (
                <span 
                    className={`badge-role badge-status-toggle ${value ? 'badge-active' : 'badge-inactive'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(row);
                    }}
                    title="Clic para cambiar estado"
                >
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    const handleToggleStatus = async (user) => {
        // Obtener el ID del usuario logueado desde localStorage
        const currentUserData = localStorage.getItem('user');
        if (currentUserData) {
            const currentUser = JSON.parse(currentUserData);
            if (currentUser.uid === user.uid || currentUser.id === user.uid) {
                toast.error('No puedes desactivarte a ti mismo');
                return;
            }
        }
        await toggleUserStatus(user.uid, user.status);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            setIsDeleting(true);
            await removeUser(selectedUser.uid);
            setIsDeleting(false);
            setShowDeleteModal(false);
            setSelectedUser(null);
        }
    };

    const handleSave = async (userData) => {
        let success;
        if (selectedUser) {
            // Editar usuario existente
            success = await editUser(selectedUser.uid, userData);
        } else {
            // Crear nuevo usuario
            const response = await register(userData);
            if (response.error) {
                toast.error(response.err?.response?.data?.message || 'Error al crear usuario');
                return false;
            }
            toast.success('Usuario creado correctamente');
            fetchUsers();
            success = true;
        }
        if (success) {
            setShowModal(false);
            setSelectedUser(null);
        }
        return success;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const actions = (row) => (
        <>
            <Button 
                variant="info" 
                size="sm" 
                icon={Eye}
                onClick={() => handleView(row)}
            />
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
    );

    return (
        <div className="user-page">
            <div className="user-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Gestión de Usuarios</h1>
                        <p className="page-subtitle">Administra los usuarios del sistema educativo</p>
                    </div>
                    <Button variant="primary" icon={Plus} onClick={handleCreate}>
                        Nuevo Usuario
                    </Button>
                </div>

                <div className="page-toolbar">
                    <SearchBar 
                        value={search} 
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
                        placeholder="Buscar por nombre, usuario o email..."
                    />
                    <div className="toolbar-info">
                        <span className="total-count">{filteredUsers.length} usuarios encontrados</span>
                    </div>
                </div>

                {isLoading ? (
                    <Loader text="Cargando usuarios..." />
                ) : (
                    <>
                        <Table 
                            columns={columns} 
                            data={paginatedUsers} 
                            actions={actions}
                            emptyMessage="No se encontraron usuarios"
                        />
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            <UserModal 
                isOpen={showModal}
                onClose={handleCloseModal}
                user={selectedUser}
                onSave={handleSave}
            />

            <UserDetailModal 
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de eliminar al usuario "${selectedUser ? getFullName(selectedUser) : ''}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                loading={isDeleting}
            />
        </div>
    );
};

export default UserPage;