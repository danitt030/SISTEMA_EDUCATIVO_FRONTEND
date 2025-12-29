import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Download, FileText, User, Calendar, BookOpen, GraduationCap, Award, CheckCircle, XCircle, School } from 'lucide-react';
import './BoletaPreviewModal.css';

const BoletaPreviewModal = ({ isOpen, onClose, boletaData, estudiante, cicloEscolar, onDownload, loading }) => {
    if (!isOpen) return null;

    // Extraer datos de la respuesta del backend
    let materias = [];
    let estudianteInfo = estudiante;
    let cursoInfo = null;
    let resumen = null;
    
    if (boletaData && typeof boletaData === 'object') {
        estudianteInfo = boletaData.estudiante || estudiante;
        cursoInfo = boletaData.curso;
        resumen = boletaData.resumen;
        
        if (boletaData.calificaciones && Array.isArray(boletaData.calificaciones)) {
            materias = boletaData.calificaciones.map(cal => ({
                nombre: cal.materia || 'Sin materia',
                bimestres: {
                    1: cal.bimestre1,
                    2: cal.bimestre2,
                    3: cal.bimestre3,
                    4: cal.bimestre4
                },
                promedio: cal.promedio,
                aprobado: cal.aprobado
            }));
        }
    }

    // Calcular resumen si no viene del backend
    if (!resumen) {
        let aprobadas = 0;
        let reprobadas = 0;
        let totalPromedio = 0;
        let countPromedios = 0;
        
        materias.forEach(m => {
            if (m.promedio !== null && m.promedio !== undefined) {
                totalPromedio += m.promedio;
                countPromedios++;
                if (m.aprobado) aprobadas++;
                else reprobadas++;
            }
        });
        
        resumen = {
            promedioGeneral: countPromedios > 0 ? (totalPromedio / countPromedios).toFixed(2) : '0.00',
            materiasAprobadas: aprobadas,
            materiasReprobadas: reprobadas,
            totalMaterias: materias.length
        };
    }

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
        if (estudianteInfo && typeof estudianteInfo === 'object') {
            const name = estudianteInfo.name || estudianteInfo.nombre || '';
            const surname = estudianteInfo.surname || estudianteInfo.apellido || '';
            return `${name} ${surname}`.trim() || estudianteInfo.username || 'Estudiante';
        }
        return estudianteInfo || 'Estudiante';
    };

    const getCodigoEstudiante = () => {
        if (estudianteInfo && typeof estudianteInfo === 'object') {
            return estudianteInfo.codigoEstudiante || estudianteInfo.code || '-';
        }
        return '-';
    };

    const getNotaClass = (nota) => {
        if (nota >= 80) return 'excelente';
        if (nota >= 60) return 'aprobado';
        return 'reprobado';
    };

    const getPromedioStatus = (promedio) => {
        if (promedio >= 80) return { text: 'Excelente', class: 'excelente' };
        if (promedio >= 60) return { text: 'Aprobado', class: 'aprobado' };
        return { text: 'Reprobado', class: 'reprobado' };
    };

    // Si no hay materias, mostrar mensaje
    if (materias.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Boleta de Calificaciones" size="md">
                <div className="boleta-preview">
                    <div className="empty-boleta-modal">
                        <FileText size={64} />
                        <h3>No hay calificaciones registradas</h3>
                        <p>No se encontraron calificaciones para este estudiante en el ciclo {cicloEscolar}.</p>
                        <Button variant="secondary" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    const promedioStatus = getPromedioStatus(parseFloat(resumen?.promedioGeneral || 0));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
            <div className="boleta-preview-container">
                {/* Encabezado Institucional */}
                <div className="boleta-header-institucional">
                    <div className="institucion-logo">
                        <School size={48} />
                    </div>
                    <div className="institucion-info">
                        <h1 className="institucion-nombre">CENTRO EDUCATIVO MI CASITA</h1>
                        <h2 className="boleta-titulo">BOLETA DE CALIFICACIONES</h2>
                        <p className="ciclo-escolar-label">Ciclo Escolar {boletaData?.cicloEscolar || cicloEscolar}</p>
                    </div>
                    <div className="boleta-badge-ciclo">
                        <Calendar size={20} />
                        <span>{boletaData?.cicloEscolar || cicloEscolar}</span>
                    </div>
                </div>

                {/* Información del Estudiante */}
                <div className="boleta-info-estudiante">
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">
                                <User size={16} /> Estudiante:
                            </span>
                            <span className="info-value nombre-estudiante">{getEstudianteName()}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">
                                <FileText size={16} /> Código:
                            </span>
                            <span className="info-value">{getCodigoEstudiante()}</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="info-label">
                                <GraduationCap size={16} /> Grado:
                            </span>
                            <span className="info-value">
                                {cursoInfo ? `${formatGrado(cursoInfo.grado)} "${cursoInfo.seccion}"` : '-'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">
                                <BookOpen size={16} /> Jornada:
                            </span>
                            <span className="info-value">{cursoInfo?.jornada || 'MATUTINA'}</span>
                        </div>
                    </div>
                </div>

                {/* Tabla de Calificaciones */}
                <div className="boleta-tabla-container">
                    <table className="boleta-tabla">
                        <thead>
                            <tr>
                                <th className="th-materia">MATERIA</th>
                                <th className="th-bimestre">B1</th>
                                <th className="th-bimestre">B2</th>
                                <th className="th-bimestre">B3</th>
                                <th className="th-bimestre">B4</th>
                                <th className="th-promedio">PROMEDIO</th>
                                <th className="th-estado">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materias.map((materia, idx) => (
                                <tr key={idx} className={`fila-materia ${materia.aprobado === false ? 'fila-reprobada' : ''}`}>
                                    <td className="td-materia">{materia.nombre}</td>
                                    {[1, 2, 3, 4].map(bim => {
                                        const datos = materia.bimestres[bim];
                                        return (
                                            <td key={bim} className="td-bimestre">
                                                {datos ? (
                                                    <div className={`nota-celda ${getNotaClass(datos.total)}`}>
                                                        <span className="nota-total">{datos.total}</span>
                                                        <span className="nota-detalle">Z:{datos.zona} E:{datos.examen}</span>
                                                    </div>
                                                ) : (
                                                    <span className="sin-nota">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="td-promedio">
                                        <span className={`promedio-valor ${materia.promedio !== null ? getNotaClass(materia.promedio) : ''}`}>
                                            {materia.promedio !== null ? materia.promedio : '-'}
                                        </span>
                                    </td>
                                    <td className="td-estado">
                                        {materia.promedio !== null && (
                                            <span className={`estado-badge ${materia.aprobado ? 'aprobado' : 'reprobado'}`}>
                                                {materia.aprobado ? (
                                                    <><CheckCircle size={14} /> Aprobado</>
                                                ) : (
                                                    <><XCircle size={14} /> Reprobado</>
                                                )}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Resumen Final */}
                <div className="boleta-resumen">
                    <div className="resumen-cards">
                        <div className="resumen-card promedio-general">
                            <div className="resumen-icon">
                                <Award size={28} />
                            </div>
                            <div className="resumen-content">
                                <span className="resumen-label">Promedio General</span>
                                <span className={`resumen-valor ${promedioStatus.class}`}>
                                    {resumen?.promedioGeneral || '0.00'}
                                </span>
                                <span className={`resumen-status ${promedioStatus.class}`}>
                                    {promedioStatus.text}
                                </span>
                            </div>
                        </div>
                        
                        <div className="resumen-stats">
                            <div className="stat-item aprobadas">
                                <CheckCircle size={20} />
                                <div className="stat-content">
                                    <span className="stat-numero">{resumen?.materiasAprobadas || 0}</span>
                                    <span className="stat-label">Aprobadas</span>
                                </div>
                            </div>
                            <div className="stat-item reprobadas">
                                <XCircle size={20} />
                                <div className="stat-content">
                                    <span className="stat-numero">{resumen?.materiasReprobadas || 0}</span>
                                    <span className="stat-label">Reprobadas</span>
                                </div>
                            </div>
                            <div className="stat-item total">
                                <BookOpen size={20} />
                                <div className="stat-content">
                                    <span className="stat-numero">{resumen?.totalMaterias || materias.length}</span>
                                    <span className="stat-label">Total Materias</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nota de aprobación */}
                <div className="boleta-nota-pie">
                    <p>Nota mínima de aprobación: <strong>60 puntos</strong> | Cada bimestre vale 25 puntos (máx. 100)</p>
                </div>

                {/* Acciones */}
                <div className="boleta-modal-actions">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={onDownload} 
                        loading={loading}
                        icon={Download}
                    >
                        Descargar PDF
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BoletaPreviewModal;
