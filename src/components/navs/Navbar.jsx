import React, { useState } from 'react';
import { Menu, User, LogOut, Settings, Eye } from 'lucide-react';
import { useLogout, useUserDetails, useUser } from '../../shared/hooks';
import UserModal from '../usuarios/UserModal';
import UserDetailModal from '../usuarios/UserDetailModal';
import toast from 'react-hot-toast';
import './navs.css';

const Navbar = ({ toggleSidebar }) => {
    const { logout } = useLogout();
    const { getUserFullName, getUserRole, getUserId, user } = useUserDetails();
    const { fetchUsers, users, editUser } = useUser();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);

    const userRole = getUserRole();
    const canEditProfile = userRole === 'ADMIN_ROLE' || userRole === 'COORDINADOR_ROLE';

    const getRoleBadge = (role) => {
        const badges = {
            'ADMIN_ROLE': { text: 'Admin', class: 'badge-admin' },
            'COORDINADOR_ROLE': { text: 'Coordinador', class: 'badge-coordinador' },
            'PROFESOR_ROLE': { text: 'Profesor', class: 'badge-profesor' },
            'PADRE_ROLE': { text: 'Padre', class: 'badge-padre' },
            'ALUMNO_ROLE': { text: 'Alumno', class: 'badge-alumno' }
        };
        return badges[role] || { text: role, class: 'badge-secondary' };
    };

    const roleBadge = getRoleBadge(getUserRole());

    const handleOpenProfile = async () => {
        setShowUserMenu(false);
        try {
            // Obtener datos actuales del usuario
            await fetchUsers();
            const userId = getUserId();
            // Esperar un momento para que users se actualice
            setTimeout(() => {
                const userData = users?.find(u => u.uid === userId);
                if (userData) {
                    setCurrentUserData(userData);
                    setIsProfileModalOpen(true);
                } else {
                    // Si no encontramos por uid, usar los datos del contexto
                    toast.error('No se pudo cargar los datos completos del perfil');
                }
            }, 100);
        } catch (error) {
            toast.error('Error al cargar el perfil');
        }
    };

    const handleSaveProfile = async (formData) => {
        try {
            const userId = getUserId();
            const success = await editUser(userId, formData);
            if (success) {
                setIsProfileModalOpen(false);
            }
            return success;
        } catch (error) {
            toast.error(error.message || 'Error al actualizar el perfil');
            return false;
        }
    };

    const handleViewProfile = () => {
        setShowUserMenu(false);
        // Usar datos del usuario desde el contexto/localStorage
        if (user) {
            setCurrentUserData(user);
            setIsViewProfileModalOpen(true);
        } else {
            toast.error('No se pudo cargar los datos del perfil');
        }
    };

    return (
        <>
            <nav className="navbar-custom">
                <div className="navbar-left">
                    <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <h1 className="navbar-title">Sistema Educativo</h1>
                </div>

                <div className="navbar-right">
                    <div className="navbar-user-container">
                        <div 
                            className="navbar-user"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="user-avatar">
                                <User size={20} />
                            </div>
                            <div className="user-info">
                                <span className="user-name">{getUserFullName()}</span>
                                <span className={`badge-role ${roleBadge.class}`}>{roleBadge.text}</span>
                            </div>
                        </div>

                        {showUserMenu && (
                            <div className="user-dropdown-menu">
                                {canEditProfile ? (
                                    <button 
                                        className="dropdown-item"
                                        onClick={handleOpenProfile}
                                    >
                                        <Settings size={16} />
                                        <span>Editar Perfil</span>
                                    </button>
                                ) : (
                                    <button 
                                        className="dropdown-item"
                                        onClick={handleViewProfile}
                                    >
                                        <Eye size={16} />
                                        <span>Ver Perfil</span>
                                    </button>
                                )}
                                <button 
                                    className="dropdown-item logout-item"
                                    onClick={logout}
                                >
                                    <LogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="btn-navbar-logout" onClick={logout} title="Cerrar sesión">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <UserModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={currentUserData}
                onSave={handleSaveProfile}
                isProfile={true}
            />

            <UserDetailModal
                isOpen={isViewProfileModalOpen}
                onClose={() => setIsViewProfileModalOpen(false)}
                user={currentUserData}
            />
        </>
    );
};

export default Navbar;