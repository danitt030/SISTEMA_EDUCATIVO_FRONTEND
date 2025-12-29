import React from 'react';
import Modal from '../Modal';
import { GraduationCap, BookOpen, FileText, User, Calendar } from 'lucide-react';
import './MateriaDetailModal.css';

const MateriaDetailModal = ({ isOpen, onClose, materia }) => {
    if (!materia) return null;

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

    const getCursoName = (curso) => {
        if (!curso) return 'Sin asignar';
        if (typeof curso === 'object') {
            return `${formatGrado(curso.grado)} "${curso.seccion}" - ${curso.jornada}`;
        }
        return curso;
    };

    const getProfesorName = (profesor) => {
        if (!profesor) return 'Sin asignar';
        if (typeof profesor === 'object') {
            return `${profesor.name || ''} ${profesor.surname || ''}`.trim() || profesor.username || 'Asignado';
        }
        return 'Asignado';
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
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Materia" size="md">
            <div className="materia-detail">
                <div className="materia-detail-header">
                    <div className="materia-icon">
                        <GraduationCap size={32} />
                    </div>
                    <div className="materia-main-info">
                        <h3>{materia.nombre}</h3>
                        <span className={`status-badge ${materia.status ? 'active' : 'inactive'}`}>
                            {materia.status ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>

                <div className="materia-detail-body">
                    {materia.descripcion && (
                        <div className="detail-item">
                            <FileText className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Descripción</span>
                                <span className="detail-value">{materia.descripcion}</span>
                            </div>
                        </div>
                    )}

                    <div className="detail-grid">
                        <div className="detail-item">
                            <BookOpen className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Curso</span>
                                <span className="detail-value">{getCursoName(materia.curso)}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <User className="detail-icon" size={18} />
                            <div className="detail-content">
                                <span className="detail-label">Profesor</span>
                                <span className="detail-value">{getProfesorName(materia.profesor)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Calendar className="detail-icon" size={18} />
                        <div className="detail-content">
                            <span className="detail-label">Fecha de Creación</span>
                            <span className="detail-value">{formatDate(materia.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default MateriaDetailModal;
