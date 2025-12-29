import React, { useState } from 'react';
import { 
    Settings, 
    User, 
    Shield, 
    Palette, 
    Database,
    RefreshCw,
    Moon,
    Sun,
    Monitor,
    Eye,
    EyeOff,
    Lock,
    Check
} from 'lucide-react';
import { useUserDetails } from '../../shared/hooks';
import { useTheme } from '../../shared/context/ThemeContext';
import { updatePassword } from '../../services';
import Button from '../../components/Button';
import Input from '../../components/Input';
import toast from 'react-hot-toast';
import './settingsPage.css';

const SettingsPage = () => {
    const { getUserFullName, getUserRole, user, isAdmin } = useUserDetails();
    const { theme, changeTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('perfil');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        calificaciones: true,
        asistencia: true
    });

    const getRoleName = (role) => {
        const roles = {
            'ADMIN_ROLE': 'Administrador',
            'COORDINADOR_ROLE': 'Coordinador',
            'PROFESOR_ROLE': 'Profesor',
            'PADRE_ROLE': 'Padre de Familia',
            'ALUMNO_ROLE': 'Alumno'
        };
        return roles[role] || role;
    };

    const handleThemeChange = (newTheme) => {
        changeTheme(newTheme);
        toast.success(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : newTheme === 'light' ? 'claro' : 'sistema'}`);
    };

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        // Guardar cambios automáticamente
        const newNotifications = { ...notifications, [key]: !notifications[key] };
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
    };

    // Funciones para cambio de contraseña
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePassword = () => {
        const errors = {};
        
        if (!passwordData.newPassword) {
            errors.newPassword = 'La nueva contraseña es requerida';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Confirma tu nueva contraseña';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        
        if (!validatePassword()) return;
        
        setIsChangingPassword(true);
        
        try {
            const response = await updatePassword(user.uid, { 
                newPassword: passwordData.newPassword 
            });
            
            if (response.error) {
                toast.error(response.err?.response?.data?.message || 'Error al cambiar contraseña');
            } else {
                toast.success('¡Contraseña actualizada correctamente!');
                setShowPasswordForm(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
            }
        } catch {
            toast.error('Error al cambiar contraseña');
        }
        
        setIsChangingPassword(false);
    };

    const cancelPasswordChange = () => {
        setShowPasswordForm(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
    };

    const tabs = [
        { id: 'perfil', label: 'Mi Perfil', icon: User },
        { id: 'seguridad', label: 'Seguridad', icon: Shield },
        { id: 'apariencia', label: 'Apariencia', icon: Palette },
        ...(isAdmin ? [{ id: 'sistema', label: 'Sistema', icon: Database }] : [])
    ];

    return (
        <div className="settings-page">
            <div className="settings-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <Settings size={28} />
                            Configuración
                        </h1>
                        <p className="page-subtitle">Administra tu cuenta y preferencias del sistema</p>
                    </div>
                </div>

                <div className="settings-container">
                    {/* Tabs de navegación */}
                    <div className="settings-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Contenido de los tabs */}
                    <div className="settings-panel">
                        {/* Tab: Mi Perfil */}
                        {activeTab === 'perfil' && (
                            <div className="settings-section">
                                <h2 className="section-title">Información Personal</h2>
                                <div className="profile-card">
                                    <div className="profile-avatar-large">
                                        <User size={48} />
                                    </div>
                                    <div className="profile-info">
                                        <h3>{getUserFullName()}</h3>
                                        <span className="profile-role">{getRoleName(getUserRole())}</span>
                                    </div>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Nombre completo</label>
                                        <p>{user?.name} {user?.surname}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Usuario</label>
                                        <p>{user?.username || 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Correo electrónico</label>
                                        <p>{user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Teléfono</label>
                                        <p>{user?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Rol</label>
                                        <p>{getRoleName(getUserRole())}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Estado</label>
                                        <p className="status-active">Activo</p>
                                    </div>
                                </div>

                                <p className="settings-note">
                                    Para modificar tu información personal, contacta al administrador del sistema.
                                </p>
                            </div>
                        )}

                        {/* Tab: Seguridad */}
                        {activeTab === 'seguridad' && (
                            <div className="settings-section">
                                <h2 className="section-title">Seguridad de la Cuenta</h2>
                                
                                <div className="security-item">
                                    <div className="security-info">
                                        <h4><Lock size={18} /> Contraseña</h4>
                                        <p>Cambia tu contraseña para mantener tu cuenta segura</p>
                                    </div>
                                    {!showPasswordForm && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setShowPasswordForm(true)}
                                        >
                                            Cambiar contraseña
                                        </Button>
                                    )}
                                </div>

                                {showPasswordForm && (
                                    <form onSubmit={handleSubmitPassword} className="password-form">
                                        <div className="password-field">
                                            <Input
                                                label="Nueva contraseña"
                                                name="newPassword"
                                                type={showPassword.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                error={passwordErrors.newPassword}
                                                placeholder="Mínimo 6 caracteres"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                            >
                                                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <div className="password-field">
                                            <Input
                                                label="Confirmar contraseña"
                                                name="confirmPassword"
                                                type={showPassword.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                error={passwordErrors.confirmPassword}
                                                placeholder="Repite tu nueva contraseña"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            >
                                                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        {/* Indicador de fortaleza */}
                                        {passwordData.newPassword && (
                                            <div className="password-strength">
                                                <div className="strength-bars">
                                                    <div className={`strength-bar ${passwordData.newPassword.length >= 6 ? 'filled' : ''}`}></div>
                                                    <div className={`strength-bar ${passwordData.newPassword.length >= 8 ? 'filled' : ''}`}></div>
                                                    <div className={`strength-bar ${/[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) ? 'filled' : ''}`}></div>
                                                </div>
                                                <span className="strength-text">
                                                    {passwordData.newPassword.length < 6 ? 'Débil' : 
                                                     passwordData.newPassword.length < 8 ? 'Media' : 'Fuerte'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="password-actions">
                                            <Button 
                                                type="button" 
                                                variant="outline"
                                                onClick={cancelPasswordChange}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                variant="primary"
                                                icon={Check}
                                                disabled={isChangingPassword}
                                            >
                                                {isChangingPassword ? 'Guardando...' : 'Guardar contraseña'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                <div className="security-item">
                                    <div className="security-info">
                                        <h4>Sesiones activas</h4>
                                        <p>Tienes 1 sesión activa en este dispositivo</p>
                                    </div>
                                    <Button variant="outline" disabled>
                                        Ver sesiones
                                    </Button>
                                </div>

                                <div className="security-tips">
                                    <h4>Consejos de seguridad</h4>
                                    <ul>
                                        <li>Usa una contraseña segura de al menos 6 caracteres</li>
                                        <li>Incluye mayúsculas, minúsculas y números</li>
                                        <li>No compartas tu contraseña con nadie</li>
                                        <li>Cierra sesión al usar equipos públicos</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Tab: Apariencia */}
                        {activeTab === 'apariencia' && (
                            <div className="settings-section">
                                <h2 className="section-title">Personalización</h2>
                                
                                <div className="theme-selector">
                                    <h4>Tema de la aplicación</h4>
                                    <div className="theme-options">
                                        <button 
                                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('light')}
                                        >
                                            <Sun size={24} />
                                            <span>Claro</span>
                                        </button>
                                        <button 
                                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('dark')}
                                        >
                                            <Moon size={24} />
                                            <span>Oscuro</span>
                                        </button>
                                        <button 
                                            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                                            onClick={() => handleThemeChange('system')}
                                        >
                                            <Monitor size={24} />
                                            <span>Sistema</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="notification-settings">
                                    <h4>Notificaciones (Próximamente)</h4>
                                    <div className="notification-options">
                                        <label className="notification-toggle">
                                            <span>Notificaciones por correo</span>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.email}
                                                onChange={() => handleNotificationChange('email')}
                                                disabled
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <label className="notification-toggle">
                                            <span>Alertas de calificaciones</span>
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.calificaciones}
                                                onChange={() => handleNotificationChange('calificaciones')}
                                                disabled
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Sistema (Solo Admin) */}
                        {activeTab === 'sistema' && isAdmin && (
                            <div className="settings-section">
                                <h2 className="section-title">Configuración del Sistema</h2>
                                
                                <div className="system-info">
                                    <div className="system-item">
                                        <label>Versión del Sistema</label>
                                        <p>1.0.0</p>
                                    </div>
                                    <div className="system-item">
                                        <label>Ciclo Escolar Actual</label>
                                        <p>{new Date().getFullYear()}</p>
                                    </div>
                                    <div className="system-item">
                                        <label>Ambiente</label>
                                        <p>Desarrollo</p>
                                    </div>
                                </div>

                                <div className="system-actions">
                                    <h4>Acciones del Sistema</h4>
                                    <div className="action-buttons">
                                        <Button variant="outline" icon={RefreshCw} disabled>
                                            Limpiar caché
                                        </Button>
                                        <Button variant="outline" icon={Database} disabled>
                                            Respaldar datos
                                        </Button>
                                    </div>
                                </div>

                                <div className="system-note">
                                    <p>⚠️ Las funciones avanzadas del sistema estarán disponibles en próximas versiones.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
