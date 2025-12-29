import React from 'react';
import Modal from '../Modal';
import { User, Mail, Phone, IdCard } from 'lucide-react';
import './UserDetailModal.css';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    const getFullName = () => {
        return `${user.name || ''} ${user.surname || ''}`.trim() || 'Usuario';
    };

    const getRoleLabel = (role) => {
        const roles = {
            'ADMIN_ROLE': 'Administrador',
            'COORDINADOR_ROLE': 'Coordinador',
            'PROFESOR_ROLE': 'Profesor',
            'PADRE_ROLE': 'Padre de Familia',
            'ALUMNO_ROLE': 'Alumno'
        };
        return roles[role] || role;
    };

    const getCodigo = () => {
        if (user.codigoEstudiante) return { label: 'Código Estudiante', value: user.codigoEstudiante };
        if (user.codigoEmpleado) return { label: 'Código Empleado', value: user.codigoEmpleado };
        if (user.codigoPadre) return { label: 'Código Padre', value: user.codigoPadre };
        return null;
    };

    const codigo = getCodigo();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mi Perfil" size="md">
            <div className="user-detail">
                <div className="user-detail-header">
                    <div className="user-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-main-info">
                        <h3>{getFullName()}</h3>
                        <span className={`role-badge role-${user.role?.toLowerCase().replace('_role', '')}`}>
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                </div>

                <div className="user-detail-body">
                    <div className="detail-item">
                        <User className="detail-icon" size={18} />
                        <div className="detail-content">
                            <span className="detail-label">Usuario</span>
                            <span className="detail-value">{user.username || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Mail className="detail-icon" size={18} />
                        <div className="detail-content">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{user.email || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Phone className="detail-icon" size={18} />
                        <div className="detail-content">
                            <span className="detail-label">Teléfono</span>
                            <span className="detail-value">{user.phone || 'N/A'}</span>
                        </div>
                    </div>

                    {codigo && (
                        <div className="detail-item">
                            <IdCard className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">{codigo.label}</span>
                                <span className="detail-value">{codigo.value}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default UserDetailModal;
