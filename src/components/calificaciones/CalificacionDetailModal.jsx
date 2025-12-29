import React from 'react';
import Modal from '../Modal';
import { ClipboardList, User, BookOpen, Award, Calendar, FileText, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import './CalificacionDetailModal.css';

const CalificacionDetailModal = ({ isOpen, onClose, calificacion }) => {
    if (!calificacion) return null;

    // Obtener nombre del estudiante (puede venir poblado o no)
    const getEstudianteName = () => {
        if (typeof calificacion.estudiante === 'object') {
            return `${calificacion.estudiante.name || ''} ${calificacion.estudiante.surname || ''}`.trim() || 
                   calificacion.estudiante.username || 'N/A';
        }
        return calificacion.estudiante || 'N/A';
    };

    // Obtener nombre de la materia
    const getMateriaName = () => {
        if (typeof calificacion.materia === 'object') {
            return calificacion.materia.nombre || 'N/A';
        }
        return calificacion.materia || 'N/A';
    };

    // Obtener nombre del curso
    const getCursoName = () => {
        if (typeof calificacion.curso === 'object') {
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
            return `${formatGrado(calificacion.curso.grado)} "${calificacion.curso.seccion}"`;
        }
        return calificacion.curso || 'N/A';
    };

    // Obtener quien registró la calificación
    const getRegistradoPor = () => {
        if (typeof calificacion.registradoPor === 'object') {
            return `${calificacion.registradoPor.name || ''} ${calificacion.registradoPor.surname || ''}`.trim() || 
                   calificacion.registradoPor.username || 'N/A';
        }
        return 'N/A';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTotalClass = (total) => {
        if (total >= 80) return 'nota-alta';
        if (total >= 60) return 'nota-media';
        return 'nota-baja';
    };

    const getBimestreLabel = (bimestre) => {
        const labels = {
            1: 'Primer Bimestre',
            2: 'Segundo Bimestre',
            3: 'Tercer Bimestre',
            4: 'Cuarto Bimestre'
        };
        return labels[bimestre] || `Bimestre ${bimestre}`;
    };

    const total = calificacion.total ?? ((calificacion.zona || 0) + (calificacion.examen || 0));
    const aprobado = total >= 60;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Calificación" size="md">
            <div className="calificacion-detail">
                <div className="calificacion-detail-header">
                    <div className="calificacion-icon">
                        <ClipboardList size={32} />
                    </div>
                    <div className="calificacion-main-info">
                        <h3>{getEstudianteName()}</h3>
                        <span className="materia-badge">{getMateriaName()}</span>
                    </div>
                    <div className={`nota-grande ${getTotalClass(total)}`}>
                        {total}
                        <span className="nota-label">{aprobado ? 'Aprobado' : 'Reprobado'}</span>
                    </div>
                </div>

                <div className="calificacion-detail-body">
                    {/* Información principal */}
                    <div className="detail-grid">
                        <div className="detail-item">
                            <User className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Estudiante</span>
                                <span className="detail-value">{getEstudianteName()}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <GraduationCap className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Curso</span>
                                <span className="detail-value">{getCursoName()}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <BookOpen className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Materia</span>
                                <span className="detail-value">{getMateriaName()}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Award className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Bimestre</span>
                                <span className="detail-value">{getBimestreLabel(calificacion.bimestre)}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Calendar className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Ciclo Escolar</span>
                                <span className="detail-value">{calificacion.cicloEscolar || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            {calificacion.status !== false ? (
                                <CheckCircle className="detail-icon status-active" size={18} />
                            ) : (
                                <XCircle className="detail-icon status-inactive" size={18} />
                            )}
                            <div className="detail-content">
                                <span className="detail-label">Estado</span>
                                <span className={`detail-value status-badge ${calificacion.status !== false ? 'active' : 'inactive'}`}>
                                    {calificacion.status !== false ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sección de notas */}
                    <div className="notas-detail-section">
                        <h4>Desglose de Calificaciones</h4>
                        <div className="notas-grid">
                            <div className="nota-item">
                                <span className="nota-tipo">Zona</span>
                                <span className="nota-valor">{calificacion.zona || 0}</span>
                                <span className="nota-max">/60</span>
                            </div>
                            <div className="nota-item">
                                <span className="nota-tipo">Examen</span>
                                <span className="nota-valor">{calificacion.examen || 0}</span>
                                <span className="nota-max">/40</span>
                            </div>
                            <div className={`nota-item total ${getTotalClass(total)}`}>
                                <span className="nota-tipo">Total</span>
                                <span className="nota-valor">{total}</span>
                                <span className="nota-max">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    {calificacion.registradoPor && (
                        <div className="detail-item full-width">
                            <User className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Registrado por</span>
                                <span className="detail-value">{getRegistradoPor()}</span>
                            </div>
                        </div>
                    )}

                    {calificacion.observaciones && (
                        <div className="detail-item full-width">
                            <FileText className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Observaciones</span>
                                <span className="detail-value observaciones-text">{calificacion.observaciones}</span>
                            </div>
                        </div>
                    )}

                    {calificacion.createdAt && (
                        <div className="detail-item full-width">
                            <Calendar className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Fecha de Registro</span>
                                <span className="detail-value">{formatDate(calificacion.createdAt)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CalificacionDetailModal;
