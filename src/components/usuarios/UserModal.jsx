import React, { useState, useMemo } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import './UserModal.css';

const UserModal = ({ isOpen, onClose, user, onSave, isProfile = false }) => {
    const isEditing = !!user;
    
    const initialFormData = useMemo(() => ({
        name: user?.name || '',
        surname: user?.surname || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'ALUMNO_ROLE',
        password: '',
        confirmPassword: ''
    }), [user]);

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setErrors({});
        }
    }, [isOpen, initialFormData]);

    const roleOptions = [
        { value: 'ADMIN_ROLE', label: 'Administrador' },
        { value: 'COORDINADOR_ROLE', label: 'Coordinador' },
        { value: 'PROFESOR_ROLE', label: 'Profesor' },
        { value: 'PADRE_ROLE', label: 'Padre de Familia' },
        { value: 'ALUMNO_ROLE', label: 'Alumno' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.surname.trim()) newErrors.surname = 'El apellido es requerido';
        if (!formData.username.trim()) newErrors.username = 'El usuario es requerido';
        if (!formData.email.trim()) newErrors.email = 'El email es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Password validation solo para nuevo usuario
        if (!isEditing) {
            if (!formData.password) newErrors.password = 'La contraseña es requerida';
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        
        // Preparar datos para enviar
        const dataToSend = {
            name: formData.name,
            surname: formData.surname,
            username: formData.username,
            email: formData.email,
            phone: formData.phone
        };

        // Solo incluir rol si no es edición de perfil propio
        if (!isProfile) {
            dataToSend.role = formData.role;
        }

        // Incluir password solo para nuevo usuario
        if (!isEditing) {
            dataToSend.password = formData.password;
        }

        const success = await onSave(dataToSend);
        setLoading(false);

        if (success) {
            onClose();
        }
    };

    const getTitle = () => {
        if (isProfile) return 'Editar Mi Perfil';
        return isEditing ? 'Editar Usuario' : 'Nuevo Usuario';
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={getTitle()}
            size="md"
        >
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row two-cols">
                    <Input
                        label="Nombre"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />
                    <Input
                        label="Apellido"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        error={errors.surname}
                        required
                    />
                </div>

                <div className="form-row two-cols">
                    <Input
                        label="Usuario"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        required
                        disabled={isEditing}
                    />
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />
                </div>

                <div className="form-row two-cols">
                    <Input
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                    />
                    {!isProfile && (
                        <Select
                            label="Rol"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            options={roleOptions}
                            error={errors.role}
                            required
                            disabled={isEditing && isProfile}
                        />
                    )}
                </div>

                {/* Campos de contraseña solo para nuevo usuario */}
                {!isEditing && (
                    <div className="form-row two-cols">
                        <Input
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />
                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />
                    </div>
                )}

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserModal;