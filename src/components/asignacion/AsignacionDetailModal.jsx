import React from 'react';
import Modal from '../Modal';
import { UserPlus, User, BookOpen, Calendar, FileText, Users, Award } from 'lucide-react';
import './AsignacionDetailModal.css';

const AsignacionDetailModal = ({ isOpen, onClose, asignacion }) => {
    if (!asignacion) return null;

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

    const getEstudianteName = () => {
        if (!asignacion.estudiante) return 'Sin asignar';
        if (typeof asignacion.estudiante === 'object') {
            return `${asignacion.estudiante.name || ''} ${asignacion.estudiante.surname || ''}`.trim();
        }
        return 'Sin asignar';
    };

    const getEstudianteEmail = () => {
        if (!asignacion.estudiante || typeof asignacion.estudiante !== 'object') return 'N/A';
        return asignacion.estudiante.email || 'N/A';
    };

    const getEstudianteCodigo = () => {
        if (!asignacion.estudiante || typeof asignacion.estudiante !== 'object') return 'N/A';
        return asignacion.estudiante.codigoEstudiante || 'N/A';
    };

    const getCursoName = () => {
        if (!asignacion.curso) return 'Sin asignar';
        if (typeof asignacion.curso === 'object') {
            return `${formatGrado(asignacion.curso.grado)} "${asignacion.curso.seccion}"`;
        }
        return 'Sin asignar';
    };

    const getCursoJornada = () => {
        if (!asignacion.curso || typeof asignacion.curso !== 'object') return 'N/A';
        return asignacion.curso.jornada || 'N/A';
    };

    const getEncargadoName = () => {
        if (!asignacion.encargado) return 'Sin asignar';
        if (typeof asignacion.encargado === 'object') {
            return `${asignacion.encargado.name || ''} ${asignacion.encargado.surname || ''}`.trim();
        }
        return 'Sin asignar';
    };

    const getEncargadoPhone = () => {
        if (!asignacion.encargado || typeof asignacion.encargado !== 'object') return 'N/A';
        return asignacion.encargado.phone || 'N/A';
    };

    const getEncargadoEmail = () => {
        if (!asignacion.encargado || typeof asignacion.encargado !== 'object') return 'N/A';
        return asignacion.encargado.email || 'N/A';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Inscripción" size="md">
            <div className="asignacion-detail">
                <div className="asignacion-detail-header">
                    <div className="asignacion-icon">
                        <UserPlus size={32} />
                    </div>
                    <div className="asignacion-main-info">
                        <h3>{getEstudianteName()}</h3>
                        <span className={`status-badge ${asignacion.status ? 'active' : 'inactive'}`}>
                            {asignacion.status ? 'Inscrito' : 'Inactivo'}
                        </span>
                        {asignacion.becado && (
                            <span className="status-badge becado">
                                <Award size={14} /> Becado
                            </span>
                        )}
                    </div>
                </div>

                <div className="asignacion-detail-body">
                    <div className="detail-section">
                        <h4 className="section-title">Información del Estudiante</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <User className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Nombre</span>
                                    <span className="detail-value">{getEstudianteName()}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FileText className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{getEstudianteEmail()}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FileText className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Código Estudiante</span>
                                    <span className="detail-value">{getEstudianteCodigo()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Información del Curso</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <BookOpen className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Curso</span>
                                    <span className="detail-value">{getCursoName()}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Calendar className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Jornada</span>
                                    <span className="detail-value">{getCursoJornada()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Información del Encargado</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <Users className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Nombre</span>
                                    <span className="detail-value">{getEncargadoName()}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FileText className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Teléfono</span>
                                    <span className="detail-value">{getEncargadoPhone()}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FileText className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{getEncargadoEmail()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Información de Inscripción</h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <Calendar className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Ciclo Escolar</span>
                                    <span className="detail-value">{asignacion.cicloEscolar || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Calendar className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Fecha de Inscripción</span>
                                    <span className="detail-value">{formatDate(asignacion.fechaInscripcion)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {asignacion.observaciones && (
                        <div className="detail-section">
                            <div className="detail-item">
                                <FileText className="detail-icon" size={18} />
                                <div className="detail-content">
                                    <span className="detail-label">Observaciones</span>
                                    <span className="detail-value">{asignacion.observaciones}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AsignacionDetailModal;
