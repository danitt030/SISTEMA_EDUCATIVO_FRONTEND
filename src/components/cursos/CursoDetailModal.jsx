import React from 'react';
import Modal from '../Modal';
import { BookOpen, Calendar, Clock, Layers, Users, GraduationCap } from 'lucide-react';
import './CursoDetailModal.css';

const CursoDetailModal = ({ isOpen, onClose, curso }) => {
    if (!curso) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatNivel = (nivel) => {
        const niveles = {
            'PREPRIMARIA': 'Preprimaria',
            'PRIMARIA': 'Primaria',
            'BASICO': 'Básico'
        };
        return niveles[nivel] || nivel;
    };

    const formatGrado = (grado) => {
        const grados = {
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
        return grados[grado] || grado;
    };

    const formatJornada = (jornada) => {
        const jornadas = {
            'MATUTINA': 'Matutina',
            'VESPERTINA': 'Vespertina'
        };
        return jornadas[jornada] || jornada;
    };

    // Generar nombre del curso
    const getCursoNombre = () => {
        const grado = formatGrado(curso.grado);
        const seccion = curso.seccion || '';
        return `${grado} "${seccion}"`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Curso" size="md">
            <div className="curso-detail">
                <div className="curso-detail-header">
                    <div className="curso-icon">
                        <BookOpen size={32} />
                    </div>
                    <div className="curso-main-info">
                        <h3>{getCursoNombre()}</h3>
                        <span className={`status-badge ${curso.status ? 'active' : 'inactive'}`}>
                            {curso.status ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>

                <div className="curso-detail-body">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <GraduationCap className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Nivel</span>
                                <span className="detail-value">{formatNivel(curso.nivel)}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Layers className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Grado</span>
                                <span className="detail-value">{formatGrado(curso.grado)}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Layers className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Sección</span>
                                <span className="detail-value">{curso.seccion || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Clock className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Jornada</span>
                                <span className="detail-value">{formatJornada(curso.jornada)}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Calendar className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Ciclo Escolar</span>
                                <span className="detail-value">{curso.cicloEscolar || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Users className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Capacidad Máxima</span>
                                <span className="detail-value">{curso.capacidadMaxima || 30} estudiantes</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <Users className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Coordinador</span>
                                <span className="detail-value">
                                    {curso.coordinador 
                                        ? (typeof curso.coordinador === 'object' 
                                            ? `${curso.coordinador.name || ''} ${curso.coordinador.surname || ''}`.trim() || curso.coordinador.username || 'Asignado'
                                            : 'Asignado')
                                        : 'Sin asignar'}
                                </span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Users className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Profesor</span>
                                <span className="detail-value">
                                    {curso.profesor 
                                        ? (typeof curso.profesor === 'object' 
                                            ? `${curso.profesor.name || ''} ${curso.profesor.surname || ''}`.trim() || curso.profesor.username || 'Asignado'
                                            : 'Asignado')
                                        : 'Sin asignar'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Calendar className="detail-icon" size={18} />
                        <div className="detail-content">
                            <span className="detail-label">Fecha de Creación</span>
                            <span className="detail-value">{formatDate(curso.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CursoDetailModal;
