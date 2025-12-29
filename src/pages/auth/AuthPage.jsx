import React, { useState } from 'react';
import { useLogin } from '../../shared/hooks';
import { useRegister } from '../../shared/hooks';
import toast from 'react-hot-toast';
import './authPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const { login, isLoading: isLoginLoading } = useLogin();
    const { registerUser, isLoading: isRegisterLoading } = useRegister();

    const isLoading = isLoginLoading || isRegisterLoading;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            // Login
            if (!formData.username || !formData.password) {
                toast.error('Por favor completa todos los campos');
                return;
            }
            await login(formData.username, formData.password);
        } else {
            // Register
            if (!formData.name || !formData.surname || !formData.username || !formData.password) {
                toast.error('Por favor completa todos los campos obligatorios');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('Las contraseñas no coinciden');
                return;
            }
            const result = await registerUser({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                phone: formData.phone,
                username: formData.username,
                password: formData.password
            });
            if (result.success) {
                setIsLogin(true);
                setFormData({
                    name: '',
                    surname: '',
                    email: '',
                    phone: '',
                    username: '',
                    password: '',
                    confirmPassword: ''
                });
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">
                <div className="auth-header">
                    <h1>📚 Sistema Educativo</h1>
                    <p>{isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}</p>
                </div>
                
                <div className="auth-body">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Nombre *</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        className="form-control" 
                                        placeholder="Tu nombre"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellido *</label>
                                    <input 
                                        type="text" 
                                        name="surname"
                                        className="form-control" 
                                        placeholder="Tu apellido"
                                        value={formData.surname}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        className="form-control" 
                                        placeholder="correo@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        className="form-control" 
                                        placeholder="Tu teléfono"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="form-group">
                            <label className="form-label">Usuario *</label>
                            <input 
                                type="text" 
                                name="username"
                                className="form-control" 
                                placeholder="Tu usuario"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Contraseña *</label>
                            <input 
                                type="password" 
                                name="password"
                                className="form-control" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">Confirmar Contraseña *</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    className="form-control" 
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        
                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : null}
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;