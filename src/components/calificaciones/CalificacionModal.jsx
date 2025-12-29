import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import './CalificacionModal.css';

const CalificacionModal = ({ isOpen, onClose, calificacion, estudiantes = [], materias = [], cursos = [], onSave }) => {
    const getInitialFormData = () => ({
        estudiante: calificacion?.estudiante?._id || calificacion?.estudiante || '',
        materia: calificacion?.materia?._id || calificacion?.materia || '',
        curso: calificacion?.curso?._id || calificacion?.curso || '',
        bimestre: calificacion?.bimestre?.toString() || '',
        cicloEscolar: calificacion?.cicloEscolar?.toString() || new Date().getFullYear().toString(),
        zona: calificacion?.zona?.toString() || '',
        examen: calificacion?.examen?.toString() || '',
        observaciones: calificacion?.observaciones || ''
    });

    const [formData, setFormData] = useState(getInitialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const prevIsOpenRef = useRef(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            setFormData(getInitialFormData());
            setErrors({});
        }
        prevIsOpenRef.current = isOpen;
    });

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

    const estudianteOptions = estudiantes.filter(e => e.status !== false).map(est => ({
        value: est.uid || est._id,
        label: `${est.name || ''} ${est.surname || ''}`.trim() || est.username
    }));

    const cursoOptions = cursos.filter(c => c.status !== false).map(curso => ({
        value: curso.cid || curso._id,
        label: `${formatGrado(curso.grado)} "${curso.seccion}"`
    }));

    // Filtrar materias por curso seleccionado
    const materiaOptions = materias
        .filter(m => {
            if (m.status === false) return false;
            if (!formData.curso) return true;
            
            // Obtener el ID del curso de la materia (puede ser objeto o string)
            let materiaCursoId = m.curso;
            if (typeof m.curso === 'object' && m.curso !== null) {
                materiaCursoId = m.curso.cid || m.curso._id;
            }
            
            // El curso seleccionado viene del dropdown (cid o _id)
            const cursoSeleccionadoId = formData.curso;
            
            // Buscar el curso en la lista para obtener ambos IDs
            const cursoEnLista = cursos.find(c => 
                c.cid === cursoSeleccionadoId || c._id === cursoSeleccionadoId
            );
            
            // Comparar: el ID de la materia puede coincidir con cualquier variante del ID del curso
            if (materiaCursoId === cursoSeleccionadoId) return true;
            if (cursoEnLista && (materiaCursoId === cursoEnLista.cid || materiaCursoId === cursoEnLista._id)) return true;
            
            return false;
        })
        .map(mat => ({
            value: mat.mid || mat._id,
            label: mat.nombre
        }));

    const bimestreOptions = [
        { value: '1', label: 'Primer Bimestre' },
        { value: '2', label: 'Segundo Bimestre' },
        { value: '3', label: 'Tercer Bimestre' },
        { value: '4', label: 'Cuarto Bimestre' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Si cambia el curso, limpiar la materia seleccionada
        if (name === 'curso') {
            setFormData(prev => ({ ...prev, materia: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.estudiante) newErrors.estudiante = 'El estudiante es requerido';
        if (!formData.materia) newErrors.materia = 'La materia es requerida';
        if (!formData.curso) newErrors.curso = 'El curso es requerido';
        if (!formData.bimestre) newErrors.bimestre = 'El bimestre es requerido';
        if (!formData.cicloEscolar) newErrors.cicloEscolar = 'El ciclo escolar es requerido';
        
        if (!formData.zona && formData.zona !== 0) {
            newErrors.zona = 'La zona es requerida';
        } else if (Number(formData.zona) < 0 || Number(formData.zona) > 60) {
            newErrors.zona = 'La zona debe estar entre 0 y 60';
        }
        
        if (!formData.examen && formData.examen !== 0) {
            newErrors.examen = 'El examen es requerido';
        } else if (Number(formData.examen) < 0 || Number(formData.examen) > 40) {
            newErrors.examen = 'El examen debe estar entre 0 y 40';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const dataToSend = {
            ...formData,
            bimestre: Number(formData.bimestre),
            cicloEscolar: Number(formData.cicloEscolar),
            zona: Number(formData.zona),
            examen: Number(formData.examen)
        };
        const success = await onSave(dataToSend);
        setLoading(false);

        if (success) {
            onClose();
        }
    };

    // Calcular total
    const total = (Number(formData.zona) || 0) + (Number(formData.examen) || 0);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={calificacion ? 'Editar Calificación' : 'Registrar Calificación'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="calificacion-form">
                <div className="form-row">
                    <Select
                        label="Estudiante"
                        name="estudiante"
                        value={formData.estudiante}
                        onChange={handleChange}
                        options={estudianteOptions}
                        error={errors.estudiante}
                        placeholder="Seleccionar estudiante..."
                        required
                        disabled={!!calificacion}
                    />
                </div>

                <div className="form-row two-cols">
                    <Select
                        label="Curso"
                        name="curso"
                        value={formData.curso}
                        onChange={handleChange}
                        options={cursoOptions}
                        error={errors.curso}
                        placeholder="Seleccionar curso..."
                        required
                        disabled={!!calificacion}
                    />
                    <Select
                        label="Materia"
                        name="materia"
                        value={formData.materia}
                        onChange={handleChange}
                        options={materiaOptions}
                        error={errors.materia}
                        placeholder="Seleccionar materia..."
                        required
                        disabled={!!calificacion || !formData.curso}
                    />
                </div>

                <div className="form-row two-cols">
                    <Select
                        label="Bimestre"
                        name="bimestre"
                        value={formData.bimestre}
                        onChange={handleChange}
                        options={bimestreOptions}
                        error={errors.bimestre}
                        required
                        disabled={!!calificacion}
                    />
                    <Input
                        label="Ciclo Escolar"
                        name="cicloEscolar"
                        type="number"
                        value={formData.cicloEscolar}
                        onChange={handleChange}
                        error={errors.cicloEscolar}
                        min="2020"
                        max="2100"
                        required
                        disabled={!!calificacion}
                    />
                </div>

                <div className="notas-section">
                    <h4>Calificaciones</h4>
                    <div className="form-row three-cols">
                        <Input
                            label="Zona (0-60)"
                            name="zona"
                            type="number"
                            value={formData.zona}
                            onChange={handleChange}
                            error={errors.zona}
                            min="0"
                            max="60"
                            step="0.5"
                            required
                        />
                        <Input
                            label="Examen (0-40)"
                            name="examen"
                            type="number"
                            value={formData.examen}
                            onChange={handleChange}
                            error={errors.examen}
                            min="0"
                            max="40"
                            step="0.5"
                            required
                        />
                        <div className="total-display">
                            <span className="total-label">Total</span>
                            <span className={`total-value ${total >= 60 ? 'aprobado' : 'reprobado'}`}>
                                {total}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <Input
                        label="Observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {calificacion ? 'Guardar Cambios' : 'Registrar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CalificacionModal;
